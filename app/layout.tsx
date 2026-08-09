import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARC / FORM — Contemporary Art Gallery",
  description: "An independent contemporary art gallery for radical material, moving image and ideas.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
