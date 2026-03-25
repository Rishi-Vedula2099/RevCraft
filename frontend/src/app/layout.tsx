import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "RevCraft — Cloud-Native Car Builder",
  description: "Build, customize, and analyze cars in real-time with AI-powered insights. 3D car builder with performance scoring and class rankings.",
  keywords: ["car builder", "3D configurator", "AI", "performance", "analytics"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
