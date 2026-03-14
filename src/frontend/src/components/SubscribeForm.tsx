import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail, Shield, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to subscribe. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-chart-1">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Newsletter
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Join the ByteWay Community
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Get the latest articles delivered to your inbox. No spam, ever.
        </p>
      </div>

      {/* Form / Success */}
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-3 py-8 px-6 rounded-2xl bg-gradient-to-br from-chart-1/10 to-chart-2/10 border border-chart-1/20 text-center"
            data-ocid="subscribe.success_state"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                delay: 0.1,
              }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-chart-1/15 border border-chart-1/30"
            >
              <CheckCircle2 className="h-7 w-7 text-chart-1" />
            </motion.div>
            <div>
              <p className="text-lg font-bold">You're in! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome to the ByteWay community. Watch your inbox for great
                content.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl border-border/70 focus-visible:ring-chart-1/50 focus-visible:border-chart-1/60 transition-all"
                  disabled={subscribeMutation.isPending}
                  data-ocid="subscribe.input"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={subscribeMutation.isPending}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-white shadow-md shadow-chart-1/20 whitespace-nowrap"
                data-ocid="subscribe.submit_button"
              >
                {subscribeMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Subscribing…
                  </span>
                ) : (
                  "Subscribe Free"
                )}
              </Button>
            </div>

            {/* Privacy note */}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
