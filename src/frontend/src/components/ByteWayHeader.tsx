import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const ADMIN_VISIBLE_KEY = "byteway_admin_nav_visible";

export default function ByteWayHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminLinkVisible, setAdminLinkVisible] = useState(false);

  // Restore admin link visibility from sessionStorage on mount
  useEffect(() => {
    try {
      setAdminLinkVisible(sessionStorage.getItem(ADMIN_VISIBLE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  // Track rapid logo clicks
  const clickTimestampsRef = useRef<number[]>([]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    // Only intercept extra rapid clicks — still navigate on regular click
    const now = Date.now();
    clickTimestampsRef.current = [
      ...clickTimestampsRef.current.filter((t) => now - t < 2000),
      now,
    ];

    if (clickTimestampsRef.current.length >= 5) {
      e.preventDefault();
      clickTimestampsRef.current = [];
      try {
        sessionStorage.setItem(ADMIN_VISIBLE_KEY, "1");
      } catch {
        // ignore
      }
      setAdminLinkVisible(true);
    }
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Blog", path: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 group transition-transform hover:scale-105 duration-300"
          onClick={handleLogoClick}
        >
          <img
            src="/assets/generated/byteway-logo.dim_512x512.png"
            alt="ByteWay Logo"
            className="h-10 w-10 object-contain transition-transform group-hover:rotate-12 duration-500"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
            ByteWay
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              data-ocid={`nav.${item.label.toLowerCase()}.link`}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-chart-1 to-chart-2 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}

          {/* Hidden admin link — only visible after 5 rapid logo clicks */}
          {adminLinkVisible && (
            <Link
              to="/admin"
              className="text-xs font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 ml-2"
              data-ocid="nav.admin.link"
            >
              ·admin
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-ocid="nav.menu.toggle"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur animate-in slide-in-from-top duration-300">
          <nav className="container py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
                data-ocid={`nav.${item.label.toLowerCase()}.link`}
              >
                {item.label}
              </Link>
            ))}

            {/* Hidden admin link (mobile) */}
            {adminLinkVisible && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200 py-1"
                data-ocid="nav.admin.link"
              >
                ·admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
