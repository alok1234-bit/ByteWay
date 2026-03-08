import { Heart } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import { useGetSiteConfiguration } from "../hooks/useSiteConfiguration";

export default function Footer() {
  const { data: config } = useGetSiteConfiguration();
  const currentYear = new Date().getFullYear();

  const appIdentifier = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "byteway-app",
  );

  const socialLinks = [
    { icon: SiFacebook, url: config?.socialMedia.facebook, label: "Facebook" },
    { icon: SiX, url: config?.socialMedia.twitter, label: "X (Twitter)" },
    {
      icon: SiInstagram,
      url: config?.socialMedia.instagram,
      label: "Instagram",
    },
    { icon: SiLinkedin, url: config?.socialMedia.linkedin, label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/byteway-logo.dim_512x512.png"
                alt="ByteWay"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                ByteWay
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your destination for insightful articles and stories.
            </p>
          </div>

          {/* Contact Section */}
          {config && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {config.address && <p>{config.address}</p>}
                {config.phone && <p>{config.phone}</p>}
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {config.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Follow Us</h3>
            <div className="flex gap-4">
              {socialLinks.map(
                (social) =>
                  social.url && (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} ByteWay. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with{" "}
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
