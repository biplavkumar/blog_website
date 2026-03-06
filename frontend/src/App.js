import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import BlogEditorPage from "@/pages/BlogEditorPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/create" element={<BlogEditorPage />} />
          <Route path="/admin/edit/:id" element={<BlogEditorPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" />
    </div>
  );
}

export default App;
