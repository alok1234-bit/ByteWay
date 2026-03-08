import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AdminLoginForm from "./AdminLoginForm";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated } = useAdminAuth();

  // Brief shimmer while hook initialises (sync, so almost instant)
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

  // Not authenticated — show login form
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // Authenticated — render protected content
  return <>{children}</>;
}
