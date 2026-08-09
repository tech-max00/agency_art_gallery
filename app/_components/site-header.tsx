"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["/exhibitions", "Exhibitions"],
  ["/artists", "Artists"],
  ["/journal", "Journal"],
  ["/visit", "Visit"],
  ["/contact", "Contact"],
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="ARC FORM home">
        <span>ARC</span><i>/</i><span>FORM</span>
      </Link>
      <nav className={open ? "site-nav open" : "site-nav"} aria-label="Primary navigation">
        {links.map(([href, label]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? "active" : ""}>{label}</Link>
        ))}
      </nav>
      <div className="header-aside">
        <span className="location">ACCRA · 23:14 GMT</span>
        <button className={open ? "menu open" : "menu"} onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          <i /><i />
        </button>
      </div>
    </header>
  );
}
