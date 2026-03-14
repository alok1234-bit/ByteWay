import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import SEO from "../../components/SEO";
import SubadminBlogPanel from "../../components/admin/SubadminBlogPanel";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function SubadminDashboardPage() {
  const { logoutAdmin, currentUsername } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  return (
    <>
      <SEO title="Sub-Admin Dashboard" />

      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-chart-2" />
                Sub-Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Welcome,{" "}
                <span className="font-medium text-foreground">
                  {currentUsername}
                </span>{" "}
                <span className="text-xs bg-chart-2/10 text-chart-2 border border-chart-2/20 rounded-full px-2 py-0.5 ml-1">
                  Sub-Admin
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You have permission to post blog articles only.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-ocid="subadmin.logout.button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Subadmin Blog Panel — focused blog writing interface */}
          <div className="animate-in fade-in duration-700 delay-200">
            <SubadminBlogPanel />
          </div>
        </div>
      </div>
    </>
  );
}
