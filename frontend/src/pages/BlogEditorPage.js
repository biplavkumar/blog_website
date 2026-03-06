import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, X, Save, ArrowLeft } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  "Technology",
  "Design",
  "Business",
  "Lifestyle",
  "Travel",
  "Food",
  "Health",
  "Science",
  "Culture",
  "Uncategorized",
];

export default function BlogEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("admin_token");
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [published, setPublished] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  useEffect(() => {
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    if (isEditing) {
      fetchBlog();
    }
  }, [token, id, navigate, isEditing]);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(`${API}/admin/blogs/${id}`, {
        headers: { "x-admin-token": token },
      });
      const blog = res.data;
      setTitle(blog.title);
      setContent(blog.content);
      setExcerpt(blog.excerpt);
      setCategory(blog.category);
      setPublished(blog.published);
      if (blog.has_image) {
        setImagePreview(
          `${process.env.REACT_APP_BACKEND_URL}/api/blogs/${blog.slug}/image`
        );
      }
    } catch (e) {
      toast.error("Failed to load post");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageData(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        category,
        published,
      };

      if (imageData) {
        payload.image_data = imageData;
      }

      if (isEditing) {
        await axios.put(`${API}/admin/blogs/${id}`, payload, {
          headers: { "x-admin-token": token },
        });
        toast.success("Post updated");
      } else {
        await axios.post(`${API}/admin/blogs`, payload, {
          headers: { "x-admin-token": token },
        });
        toast.success("Post created");
      }

      navigate("/admin/dashboard");
    } catch (e) {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header admin />
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-6">
          <div className="h-10 w-1/3 skeleton-shimmer" />
          <div className="h-12 w-full skeleton-shimmer" />
          <div className="h-64 w-full skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header admin />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 md:py-16">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-10">
          <button
            data-testid="editor-back-button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                data-testid="publish-toggle"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {published ? "Published" : "Draft"}
              </Label>
            </div>
            <Button
              data-testid="save-post-button"
              onClick={handleSave}
              disabled={saving}
              className="bg-foreground text-background hover:bg-white/90 rounded-none h-10 px-6 font-mono text-xs uppercase tracking-widest"
            >
              <Save size={13} className="mr-2" />
              {saving ? "Saving..." : isEditing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <h2
          data-testid="editor-page-title"
          className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 font-sans"
        >
          {isEditing ? "Edit Post" : "New Post"}
        </h2>

        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Title
            </Label>
            <Input
              data-testid="blog-title-input"
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border/50 focus:border-foreground/50 focus:ring-0 rounded-none h-12 text-lg font-medium"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Excerpt
            </Label>
            <Input
              data-testid="blog-excerpt-input"
              type="text"
              placeholder="Short description (auto-generated if empty)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-background border-border/50 focus:border-foreground/50 focus:ring-0 rounded-none h-12 font-mono text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Category
            </Label>
            <div
              data-testid="category-selector"
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`category-option-${cat.toLowerCase()}`}
                  onClick={() => setCategory(cat)}
                  className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-colors duration-200 ${
                    category === cat
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border/50 hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Cover Image
            </Label>
            {imagePreview ? (
              <div className="relative group">
                <div className="aspect-[4/3] overflow-hidden border border-border/40">
                  <img
                    data-testid="image-preview"
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  data-testid="remove-image-button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm border border-border/50 p-2 hover:bg-foreground hover:text-background transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                data-testid="upload-image-button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] md:aspect-[21/9] border border-dashed border-border/50 flex flex-col items-center justify-center gap-3 hover:border-foreground/30 transition-colors group"
              >
                <Upload
                  size={24}
                  className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
                />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                  Click to upload image
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/30">
                  JPG, PNG, WebP — Max 10MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Content
            </Label>
            <ReactQuill
              data-testid="blog-content-editor"
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="Write your story..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
