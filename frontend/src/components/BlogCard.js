import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function BlogCard({ blog, index = 0 }) {
  const imageUrl = blog.has_image
    ? `${BACKEND_URL}/api/blogs/${blog.slug}/image`
    : null;

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      to={`/blog/${blog.slug}`}
      data-testid={`blog-card-${blog.slug}`}
      className="blog-card group relative overflow-hidden bg-card border border-border/40 hover:border-border transition-colors duration-500 block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-secondary relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            className="blog-card-image w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
              No Image
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span
            data-testid={`blog-card-category-${blog.slug}`}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
          >
            {blog.category}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
            {formattedDate}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-semibold leading-tight tracking-tight text-foreground group-hover:text-muted-foreground transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {blog.excerpt}
        </p>

        <div className="flex items-center gap-1 pt-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors duration-300">
            Read
          </span>
          <ArrowUpRight
            size={12}
            className="text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
          />
        </div>
      </div>
    </Link>
  );
}
