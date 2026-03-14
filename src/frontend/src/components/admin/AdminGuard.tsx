import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import SubadminDashboardPage from "../../pages/admin/SubadminDashboardPage";
import AdminLoginForm from "./AdminLoginForm";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isSubadmin } = useAdminAuth();

  // Sync check — almost instant
  if (isAuthenticated === undefined) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-4 animate-pulse">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show unified login form
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // Subadmin — show restricted blog-only dashboard
  if (isSubadmin) {
    return <SubadminDashboardPage />;
  }

  // Full admin — render children (AdminDashboardPage)
  if (isAdmin) {
    return <>{children}</>;
  }

  // Fallback (should not reach here)
  return <AdminLoginForm />;
}
