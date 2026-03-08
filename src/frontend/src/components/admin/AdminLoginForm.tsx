import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLoginForm() {
  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    // Small artificial delay for polish
    await new Promise((r) => setTimeout(r, 600));

    const success = loginAdmin(username.trim(), password);
    setIsLoading(false);

    if (success) {
      toast.success("Welcome back, Admin!");
      navigate({ to: "/admin" });
    } else {
      setError("Invalid credentials. Please try again.");
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-chart-1/5 blur-3xl" />
      </div>

      <Card
        className="relative w-full max-w-md border border-border/60 bg-card/80 backdrop-blur shadow-2xl animate-in fade-in zoom-in-95 duration-500"
        data-ocid="admin.login.card"
      >
        <CardHeader className="text-center pb-2 pt-8">
          {/* Shield icon with gradient ring */}
          <div className="mx-auto mb-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chart-1 to-primary flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-chart-1 to-primary opacity-30 blur-lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your credentials to continue
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="admin-username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter username"
                className="h-11 border-border/60 focus:border-primary/60 bg-background/50"
                data-ocid="admin.login.input"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  className="h-11 pr-11 border-border/60 focus:border-primary/60 bg-background/50"
                  data-ocid="admin.password.input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                data-ocid="admin.login.error_state"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-chart-1 to-primary hover:opacity-90 transition-opacity text-white font-semibold shadow-md"
              data-ocid="admin.login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
