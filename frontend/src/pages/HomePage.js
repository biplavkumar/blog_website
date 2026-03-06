import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "@/components/Header";
import BlogCard from "@/components/BlogCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory && selectedCategory !== "All")
        params.category = selectedCategory;

      const res = await axios.get(`${API}/blogs`, { params });
      setBlogs(res.data);
    } catch (e) {
      console.error("Failed to fetch blogs:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBlogs();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchBlogs]);

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12 md:pb-16">
        <h1
          data-testid="homepage-title"
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-4"
        >
          The Journal
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl">
          Thoughts, stories, and ideas worth sharing.
        </p>
      </section>

      {/* Search & Filter Bar */}
      <section
        data-testid="filter-section"
        className="max-w-7xl mx-auto px-6 md:px-12 pb-12"
      >
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <Input
              data-testid="search-input"
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border/50 focus:border-foreground/50 focus:ring-0 rounded-none h-12 font-mono text-sm"
            />
          </div>

          {/* Category Filter */}
          <div
            data-testid="category-filters"
            className="flex flex-wrap gap-2"
          >
            <button
              data-testid="category-filter-all"
              onClick={() => setSelectedCategory("All")}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-colors duration-300 ${
                selectedCategory === "All"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border/50 hover:border-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                data-testid={`category-filter-${cat.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-colors duration-300 ${
                  selectedCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border/50 hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {loading ? (
          <div
            data-testid="loading-skeleton"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-0">
                <div className="aspect-[4/3] skeleton-shimmer" />
                <div className="p-5 space-y-3 bg-card border border-t-0 border-border/40">
                  <div className="h-3 w-20 skeleton-shimmer rounded" />
                  <div className="h-5 w-3/4 skeleton-shimmer rounded" />
                  <div className="h-3 w-full skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div
            data-testid="no-blogs-message"
            className="text-center py-24"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
              {searchQuery || selectedCategory !== "All"
                ? "No posts match your search"
                : "No posts yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
            The Journal
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
