import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Menu,
  Search,
  Shield,
  UserCheck,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "../context/SearchContext";
import { useGetAllBlogPostMetadata } from "../hooks/useBlog";
import { useGetAllVideos } from "../hooks/useVideos";

const ADMIN_VISIBLE_KEY = "byteway_admin_nav_visible";

export default function ByteWayHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminLinkVisible, setAdminLinkVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: posts } = useGetAllBlogPostMetadata();
  const { data: videos } = useGetAllVideos();

  useEffect(() => {
    try {
      setAdminLinkVisible(sessionStorage.getItem(ADMIN_VISIBLE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clickTimestampsRef = useRef<number[]>([]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
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

  const q = searchQuery.toLowerCase();
  const matchedPosts =
    searchQuery.length >= 2
      ? (posts ?? [])
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.author.toLowerCase().includes(q),
          )
          .slice(0, 5)
      : [];

  const matchedVideos =
    searchQuery.length >= 2
      ? (videos ?? [])
          .filter(
            (v) =>
              v.title.toLowerCase().includes(q) ||
              (v.description ?? "").toLowerCase().includes(q),
          )
          .slice(0, 5)
      : [];

  const hasResults = matchedPosts.length > 0 || matchedVideos.length > 0;
  const showDropdown = dropdownOpen && searchQuery.length >= 2;

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setDropdownOpen(true);
  }

  function clearSearch() {
    setSearchQuery("");
    setDropdownOpen(false);
  }

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Blog", path: "/blog" },
    { label: "Videos", path: "/videos" },
  ];

  const SearchDropdown = () => (
    <div
      className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      data-ocid="search.panel"
    >
      {!hasResults ? (
        <div className="px-4 py-8 text-center">
          <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="p-2">
          {matchedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2">
                <BookOpen className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Blog Posts
                </span>
              </div>
              {matchedPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-500/10 transition-colors group cursor-pointer"
                  onClick={() => {
                    navigate({ to: "/blog/$id", params: { id: post.id } });
                    clearSearch();
                  }}
                >
                  <p className="text-sm font-medium text-foreground group-hover:text-rose-400 transition-colors line-clamp-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {post.author}
                  </p>
                </button>
              ))}
            </div>
          )}

          {matchedPosts.length > 0 && matchedVideos.length > 0 && (
            <div className="my-1 mx-3 border-t border-border/40" />
          )}

          {matchedVideos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Video className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Videos
                </span>
              </div>
              {matchedVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 transition-colors group cursor-pointer"
                  onClick={() => {
                    navigate({ to: "/videos" });
                    clearSearch();
                  }}
                >
                  <p className="text-sm font-medium text-foreground group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {video.title}
                  </p>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {video.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-105 duration-300 shrink-0"
          onClick={handleLogoClick}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 opacity-40 blur-md group-hover:opacity-70 transition-opacity duration-500" />
            <img
              src="/assets/generated/byteway-logo.dim_512x512.png"
              alt="ByteWay Logo"
              className="relative h-10 w-10 object-contain rounded-full transition-transform group-hover:rotate-12 duration-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]"
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            ByteWay
          </span>
        </Link>

        {/* Prominent Search Bar - right after logo */}
        <div
          className="hidden md:flex relative items-center flex-shrink-0"
          ref={searchRef}
        >
          <div className="absolute left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-rose-400 animate-search-icon" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setDropdownOpen(true)}
            placeholder="ALOK"
            data-ocid="nav.search_input"
            className="pl-10 pr-4 py-2 w-52 rounded-full text-sm bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10 border border-rose-400/30 text-foreground placeholder:text-rose-300/70 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/60 focus:w-64 transition-all duration-300 shadow-sm shadow-rose-500/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {showDropdown && <SearchDropdown />}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              data-ocid={`nav.${item.label.toLowerCase()}.link`}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}

          {adminLinkVisible && (
            <div className="flex items-center gap-2 ml-2 animate-in fade-in duration-300">
              <Link
                to="/admin"
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-200"
                data-ocid="nav.admin.link"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all duration-200"
                data-ocid="nav.subadmin.link"
              >
                <UserCheck className="h-3 w-3" />
                Sub-Admin
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
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
            {/* Mobile Search Bar */}
            <div className="relative flex flex-col" ref={searchRef}>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-rose-400 animate-search-icon" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() =>
                    searchQuery.length >= 2 && setDropdownOpen(true)
                  }
                  placeholder="ALOK"
                  data-ocid="nav.search_input"
                  className="pl-10 pr-4 py-2 w-full rounded-full text-sm bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10 border border-rose-400/30 text-foreground placeholder:text-rose-300/70 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/60 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {showDropdown && (
                <div className="relative mt-1">
                  <SearchDropdown />
                </div>
              )}
            </div>

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

            {adminLinkVisible && (
              <div className="flex flex-col gap-2 pt-1 border-t border-border/30">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/20 w-fit"
                  data-ocid="nav.admin.link"
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 w-fit"
                  data-ocid="nav.subadmin.link"
                >
                  <UserCheck className="h-3 w-3" />
                  Sub-Admin
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
