import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Image,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SEO from "../../components/SEO";
import AdminAuthPanel from "../../components/admin/AdminAuthPanel";
import BlogPostsPanel from "../../components/admin/BlogPostsPanel";
import PhotosPanel from "../../components/admin/PhotosPanel";
import SiteConfigurationForm from "../../components/admin/SiteConfigurationForm";
import SubscribersPanel from "../../components/admin/SubscribersPanel";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminDashboardPage() {
  const { logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  const handleLogout = () => {
    logoutAdmin();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  return (
    <>
      <SEO title="Admin Dashboard" />

      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-chart-1" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Welcome,{" "}
                <span className="font-medium text-foreground">ALOK</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-ocid="admin.logout.button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Admin Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="animate-in fade-in duration-700 delay-200"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-1 p-1">
              <TabsTrigger
                value="posts"
                className="flex items-center gap-2 py-2.5"
                data-ocid="admin.posts.tab"
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Blog Posts</span>
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="flex items-center gap-2 py-2.5"
                data-ocid="admin.photos.tab"
              >
                <Image className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className="flex items-center gap-2 py-2.5"
                data-ocid="admin.subscribers.tab"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Subscribers</span>
              </TabsTrigger>
              <TabsTrigger
                value="config"
                className="flex items-center gap-2 py-2.5"
                data-ocid="admin.config.tab"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Site Config</span>
              </TabsTrigger>
              <TabsTrigger
                value="auth"
                className="flex items-center gap-2 py-2.5"
                data-ocid="admin.auth.tab"
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Auth</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              <BlogPostsPanel />
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <PhotosPanel />
            </TabsContent>

            <TabsContent value="subscribers" className="mt-6">
              <SubscribersPanel />
            </TabsContent>

            <TabsContent value="config" className="mt-6">
              <SiteConfigurationForm />
            </TabsContent>

            <TabsContent value="auth" className="mt-6">
              <AdminAuthPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
