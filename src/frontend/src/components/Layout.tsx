import type { ReactNode } from "react";
import ByteWayHeader from "./ByteWayHeader";
import FlirtyChatbot from "./FlirtyChatbot";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ByteWayHeader />
      <main className="flex-1 animate-in fade-in duration-500">{children}</main>
      <Footer />
      <FlirtyChatbot />
    </div>
  );
}
