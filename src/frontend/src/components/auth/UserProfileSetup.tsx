import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../../hooks/useAdmin";

export default function UserProfileSetup() {
  const [name, setName] = useState("");
  const saveProfileMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({ name: name.trim() });
      toast.success("Profile created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    }
  };

  return (
    <div className="container py-24">
      <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-700">
        <div className="p-8 rounded-xl border border-border bg-card space-y-6">
          <div className="text-center space-y-2">
            <User className="h-12 w-12 mx-auto text-chart-1" />
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">
              Please tell us your name to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saveProfileMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
              disabled={saveProfileMutation.isPending}
            >
              {saveProfileMutation.isPending
                ? "Creating Profile..."
                : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
