import type { Metadata } from "next";
import "./globals.css";
import { ScrollMotion } from "./_components/scroll-motion";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

export const metadata: Metadata = {
  title: "ARC / FORM — Contemporary Art Gallery",
  description: "An independent contemporary art gallery for radical material, moving image and ideas.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ScrollMotion />
        <div className="grain" aria-hidden="true" />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
