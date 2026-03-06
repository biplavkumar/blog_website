from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import io
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Image processing config
TARGET_WIDTH = 1200
TARGET_HEIGHT = 900  # 4:3 aspect ratio

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Models ---
class AdminLogin(BaseModel):
    password: str

class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: str = ""
    category: str = "Uncategorized"
    published: bool = True
    image_data: Optional[str] = None  # base64 encoded image

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    published: Optional[bool] = None
    image_data: Optional[str] = None

class BlogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    slug: str
    content: str
    excerpt: str
    category: str
    published: bool
    has_image: bool
    created_at: str
    updated_at: str

class BlogListResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    slug: str
    excerpt: str
    category: str
    published: bool
    has_image: bool
    created_at: str
    updated_at: str


# --- Helpers ---
def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text


def process_image(base64_data: str) -> str:
    """Crop and resize image to uniform 4:3 aspect ratio, return base64."""
    try:
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',', 1)[1]

        img_bytes = base64.b64decode(base64_data)
        img = Image.open(io.BytesIO(img_bytes))

        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Crop to 4:3 aspect ratio (center crop)
        target_ratio = TARGET_WIDTH / TARGET_HEIGHT
        img_ratio = img.width / img.height

        if img_ratio > target_ratio:
            # Image is wider, crop sides
            new_width = int(img.height * target_ratio)
            left = (img.width - new_width) // 2
            img = img.crop((left, 0, left + new_width, img.height))
        else:
            # Image is taller, crop top/bottom
            new_height = int(img.width / target_ratio)
            top = (img.height - new_height) // 2
            img = img.crop((0, top, img.width, top + new_height))

        # Resize to target dimensions
        img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

        # Convert back to base64
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        raise HTTPException(status_code=400, detail="Invalid image data")


def verify_admin(x_admin_token: str = Header(None)):
    if x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# --- Routes ---

@api_router.get("/")
async def root():
    return {"message": "Blog API is running"}


@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    if data.password == ADMIN_PASSWORD:
        return {"success": True, "token": ADMIN_PASSWORD}
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.get("/blogs", response_model=List[BlogListResponse])
async def get_blogs(search: str = "", category: str = ""):
    query = {"published": True}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
        ]
    if category and category != "All":
        query["category"] = category

    blogs = await db.blogs.find(query, {"_id": 0, "image_data": 0, "content": 0}).sort("created_at", -1).to_list(100)
    return blogs


@api_router.get("/blogs/{slug}", response_model=BlogResponse)
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"slug": slug, "published": True}, {"_id": 0, "image_data": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@api_router.get("/blogs/{slug}/image")
async def get_blog_image(slug: str):
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0, "image_data": 1})
    if not blog or not blog.get("image_data"):
        raise HTTPException(status_code=404, detail="Image not found")

    img_bytes = base64.b64decode(blog["image_data"])
    return Response(content=img_bytes, media_type="image/jpeg")


@api_router.get("/categories")
async def get_categories():
    categories = await db.blogs.distinct("category", {"published": True})
    return {"categories": sorted(categories) if categories else []}


# --- Admin Routes ---

@api_router.get("/admin/blogs")
async def admin_get_blogs(authorized: bool = Depends(verify_admin)):
    blogs = await db.blogs.find({}, {"_id": 0, "image_data": 0, "content": 0}).sort("created_at", -1).to_list(100)
    return blogs


@api_router.get("/admin/blogs/{blog_id}")
async def admin_get_blog(blog_id: str, authorized: bool = Depends(verify_admin)):
    blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0, "image_data": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@api_router.post("/admin/blogs")
async def admin_create_blog(data: BlogCreate, authorized: bool = Depends(verify_admin)):
    blog_id = str(uuid.uuid4())
    slug = slugify(data.title)

    # Ensure unique slug
    existing = await db.blogs.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{blog_id[:8]}"

    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "id": blog_id,
        "title": data.title,
        "slug": slug,
        "content": data.content,
        "excerpt": data.excerpt or data.content[:150].strip() + "...",
        "category": data.category,
        "published": data.published,
        "has_image": False,
        "image_data": None,
        "created_at": now,
        "updated_at": now,
    }

    if data.image_data:
        doc["image_data"] = process_image(data.image_data)
        doc["has_image"] = True

    await db.blogs.insert_one(doc)
    del doc["image_data"]
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/blogs/{blog_id}")
async def admin_update_blog(blog_id: str, data: BlogUpdate, authorized: bool = Depends(verify_admin)):
    existing = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog not found")

    update_data = {}
    if data.title is not None:
        update_data["title"] = data.title
        update_data["slug"] = slugify(data.title)
    if data.content is not None:
        update_data["content"] = data.content
    if data.excerpt is not None:
        update_data["excerpt"] = data.excerpt
    if data.category is not None:
        update_data["category"] = data.category
    if data.published is not None:
        update_data["published"] = data.published
    if data.image_data is not None:
        update_data["image_data"] = process_image(data.image_data)
        update_data["has_image"] = True

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.blogs.update_one({"id": blog_id}, {"$set": update_data})

    updated = await db.blogs.find_one({"id": blog_id}, {"_id": 0, "image_data": 0})
    return updated


@api_router.delete("/admin/blogs/{blog_id}")
async def admin_delete_blog(blog_id: str, authorized: bool = Depends(verify_admin)):
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"success": True}


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
