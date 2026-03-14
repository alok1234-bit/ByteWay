import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import SEO from "../components/SEO";
import SiteDetails from "../components/SiteDetails";
import SubscribeForm from "../components/SubscribeForm";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Home"
        description="Welcome to ByteWay - Your destination for insightful articles and stories"
      />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(/assets/generated/byteway-hero.dim_1600x900.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-1/10 border border-chart-1/20 text-sm font-medium animate-in zoom-in delay-100"
              style={{ animationDuration: "500ms" }}
            >
              <Sparkles className="h-4 w-4 text-chart-1" />
              <span>Welcome to ByteWay</span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-chart-1 to-chart-2 bg-clip-text text-transparent animate-in slide-in-from-bottom delay-200"
              style={{ animationDuration: "700ms" }}
            >
              Your Journey Through Ideas
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in delay-300"
              style={{ animationDuration: "700ms" }}
            >
              Discover insightful articles, engaging stories, and
              thought-provoking content that inspires and informs.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in delay-500"
              style={{ animationDuration: "700ms" }}
            >
              <Button
                size="lg"
                onClick={() => navigate({ to: "/blog" })}
                className="bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 transition-all duration-300 hover:scale-105 group"
                data-ocid="home.primary_button"
              >
                Explore Blog
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subscribe Banner ── */}
      <section className="relative overflow-hidden border-y border-border/60">
        <div className="absolute inset-0 bg-gradient-to-r from-chart-1/10 via-chart-2/8 to-chart-3/10" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, oklch(var(--chart-1) / 0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, oklch(var(--chart-2) / 0.10) 0%, transparent 60%)",
          }}
        />
        <div className="container relative py-14 md:py-20">
          <div className="max-w-2xl mx-auto">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* ── Contact & Social Section ── */}
      <section className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom duration-700">
          <SiteDetails />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-12 animate-in fade-in duration-700">
            <h2 className="text-3xl font-bold tracking-tight">Why ByteWay?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to delivering quality content that matters to you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality Content",
                description:
                  "Every article is carefully curated and reviewed for excellence.",
                icon: "✨",
              },
              {
                title: "Diverse Topics",
                description:
                  "From technology to lifestyle, explore a wide range of subjects.",
                icon: "🌈",
              },
              {
                title: "Community Driven",
                description:
                  "Join a community of readers and writers passionate about ideas.",
                icon: "🤝",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-background border border-border/50 hover:border-chart-1/50 transition-all duration-300 hover:scale-105 animate-in fade-in zoom-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: "500ms",
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
