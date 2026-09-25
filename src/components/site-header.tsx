"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/housing", label: "Housing" },
  { href: "/land", label: "Land" },
  { href: "/painting", label: "Painting" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="Dicon Estate home">
          <span className="site-logo">
            <Image src="/assets/logo.jpg" alt="Dicon Estate" width={260} height={170} priority />
          </span>
          <span className="brand-name">DICON ESTATE</span>
        </Link>
        <nav className={menuOpen ? "main-nav mobile-open" : "main-nav"}>
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} prefetch className={isActive ? "nav-item active" : "nav-item"} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
