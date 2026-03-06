import { Link, useLocation } from "react-router-dom";
import { PenLine } from "lucide-react";

export default function Header({ admin = false }) {
  const location = useLocation();

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 h-16">
        <Link
          to={admin ? "/admin/dashboard" : "/"}
          data-testid="header-logo"
          className="font-mono text-xs uppercase tracking-[0.3em] text-foreground hover:text-muted-foreground transition-colors duration-300"
        >
          {admin ? "// Admin Panel" : "// The Journal"}
        </Link>

        <nav className="flex items-center gap-6">
          {admin ? (
            <>
              <Link
                to="/admin/dashboard"
                data-testid="nav-dashboard"
                className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  location.pathname === "/admin/dashboard"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Posts
              </Link>
              <Link
                to="/admin/create"
                data-testid="nav-create-post"
                className="flex items-center gap-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest px-5 h-9 hover:bg-white/90 transition-colors duration-300"
              >
                <PenLine size={13} />
                New Post
              </Link>
              <Link
                to="/"
                data-testid="nav-view-site"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                View Site
              </Link>
            </>
          ) : (
            <Link
              to="/admin"
              data-testid="nav-admin"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
