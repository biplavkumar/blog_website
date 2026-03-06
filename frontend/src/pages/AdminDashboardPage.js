import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }
    fetchBlogs();
  }, [token, navigate]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API}/admin/blogs`, {
        headers: { "x-admin-token": token },
      });
      setBlogs(res.data);
    } catch (e) {
      if (e.response?.status === 401) {
        sessionStorage.removeItem("admin_token");
        navigate("/admin", { replace: true });
      }
      console.error("Failed to fetch blogs:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    try {
      await axios.delete(`${API}/admin/blogs/${blogId}`, {
        headers: { "x-admin-token": token },
      });
      toast.success("Post deleted");
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (e) {
      toast.error("Failed to delete post");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    navigate("/admin");
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header admin />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1
              data-testid="admin-dashboard-title"
              className="text-3xl md:text-4xl font-bold tracking-tight"
            >
              Posts
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50 mt-2">
              {blogs.length} {blogs.length === 1 ? "post" : "posts"} total
            </p>
          </div>
          <Button
            data-testid="admin-logout-button"
            onClick={handleLogout}
            variant="ghost"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground rounded-none"
          >
            Logout
          </Button>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 skeleton-shimmer border border-border/40"
              />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div
            data-testid="admin-no-posts"
            className="text-center py-24 border border-border/30 border-dashed"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50 mb-4">
              No posts yet
            </p>
            <Link
              to="/admin/create"
              data-testid="admin-create-first-post"
              className="inline-block bg-foreground text-background font-mono text-xs uppercase tracking-widest px-8 py-3 hover:bg-white/90 transition-colors"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="border border-border/40">
            {blogs.map((blog, i) => (
              <div
                key={blog.id}
                data-testid={`admin-blog-row-${blog.id}`}
                className={`admin-row flex items-center justify-between px-5 md:px-6 py-4 ${
                  i !== blogs.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium truncate font-sans">
                      {blog.title}
                    </h3>
                    {blog.published ? (
                      <Badge
                        data-testid={`blog-status-published-${blog.id}`}
                        variant="outline"
                        className="text-[10px] font-mono uppercase tracking-widest rounded-none border-green-800/50 text-green-400 shrink-0"
                      >
                        <Eye size={10} className="mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <Badge
                        data-testid={`blog-status-draft-${blog.id}`}
                        variant="outline"
                        className="text-[10px] font-mono uppercase tracking-widest rounded-none border-yellow-800/50 text-yellow-400 shrink-0"
                      >
                        <EyeOff size={10} className="mr-1" />
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                      {blog.category}
                    </span>
                    <span className="text-muted-foreground/20">|</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    data-testid={`edit-blog-${blog.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/edit/${blog.id}`)}
                    className="h-8 w-8 p-0 rounded-none text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-testid={`delete-blog-${blog.id}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-none text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-sans">
                          Delete Post
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{blog.title}". This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none font-mono text-xs uppercase tracking-widest">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-testid={`confirm-delete-${blog.id}`}
                          onClick={() => handleDelete(blog.id)}
                          className="bg-red-900 text-red-100 hover:bg-red-800 rounded-none font-mono text-xs uppercase tracking-widest"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
