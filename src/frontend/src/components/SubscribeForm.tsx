import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubscribe } from "../hooks/useSubscriptions";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const subscribeMutation = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await subscribeMutation.mutateAsync(email);
      setIsSuccess(true);
      setEmail("");
      toast.success("Successfully subscribed! Thank you for joining us.");
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-3 p-4 bg-chart-1/10 border border-chart-1/20 rounded-lg animate-in fade-in zoom-in duration-500">
        <CheckCircle2 className="h-6 w-6 text-chart-1" />
        <p className="text-sm font-medium">Thank you for subscribing!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subscribe-email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="subscribe-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-chart-1"
              disabled={subscribeMutation.isPending}
            />
          </div>
          <Button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </div>
    </form>
  );
}
