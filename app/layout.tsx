import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "arcform.gallery";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "ARC / FORM — Contemporary Art Gallery",
    description: "An independent contemporary art gallery for radical material, moving image and ideas.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "ARC / FORM — Art Beyond the Frame",
      description: "Radical material, moving image and ideas that refuse containment.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1728, height: 910, alt: "ARC / FORM — Art Beyond the Frame" }],
    },
    twitter: { card: "summary_large_image", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
