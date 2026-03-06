import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  const token = sessionStorage.getItem("admin_token");
  if (token) {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      if (res.data.success) {
        sessionStorage.setItem("admin_token", res.data.token);
        toast.success("Access granted");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center page-enter">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-border/50 mb-6">
            <Lock size={18} className="text-muted-foreground" />
          </div>
          <h1
            data-testid="admin-login-title"
            className="text-2xl md:text-3xl font-semibold tracking-tight mb-2"
          >
            Admin Access
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            data-testid="admin-password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background border-border/50 focus:border-foreground/50 focus:ring-0 rounded-none h-12 font-mono text-sm text-center tracking-widest"
            autoFocus
          />
          <Button
            data-testid="admin-login-button"
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-white/90 rounded-none h-12 font-mono text-xs uppercase tracking-widest"
          >
            {loading ? "Verifying..." : "Enter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
