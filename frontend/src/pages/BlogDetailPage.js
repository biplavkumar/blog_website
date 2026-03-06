import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${API}/blogs/${slug}`);
        setBlog(res.data);
      } catch (e) {
        console.error("Failed to fetch blog:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-8">
          <div className="h-4 w-20 skeleton-shimmer rounded" />
          <div className="h-12 w-3/4 skeleton-shimmer rounded" />
          <div className="aspect-[21/9] skeleton-shimmer" />
          <div className="space-y-3">
            <div className="h-4 w-full skeleton-shimmer rounded" />
            <div className="h-4 w-5/6 skeleton-shimmer rounded" />
            <div className="h-4 w-4/6 skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
            Post not found
          </p>
          <Link
            to="/"
            data-testid="back-home-link"
            className="inline-flex items-center gap-2 mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = blog.has_image
    ? `${process.env.REACT_APP_BACKEND_URL}/api/blogs/${blog.slug}/image`
    : null;

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />

      <article className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Back Link */}
        <Link
          to="/"
          data-testid="blog-back-link"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors duration-300 mb-10 block"
        >
          <ArrowLeft size={12} />
          All Posts
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-6">
          <span
            data-testid="blog-detail-category"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
          >
            {blog.category}
          </span>
          <span className="text-muted-foreground/30">|</span>
          <time
            data-testid="blog-detail-date"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50"
          >
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        <h1
          data-testid="blog-detail-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-10"
        >
          {blog.title}
        </h1>

        {/* Hero Image */}
        {imageUrl && (
          <div className="aspect-[21/9] overflow-hidden mb-12 border border-border/40">
            <img
              data-testid="blog-detail-image"
              src={imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          data-testid="blog-detail-content"
          className="blog-content text-base leading-relaxed text-muted-foreground max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            The Journal
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
