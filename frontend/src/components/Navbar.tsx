"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Navbar() {
  const pathname = usePathname();
  const { username, logout } = useStore();

  const links = [
    { href: "/", label: "Home" },
    { href: "/builder", label: "Builder" },
    { href: "/garage", label: "Garage" },
    { href: "/analytics", label: "Analytics" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        AUTO<span>FORGE</span> AI
      </Link>

      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          </li>
        ))}
        {username && (
          <li>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {username} ✕
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
