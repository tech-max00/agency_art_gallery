import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://arc-form-gallery.lw233093.chatgpt.site";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "ARC / FORM — Contemporary Art Gallery",
  description: "An independent contemporary art gallery for radical material, moving image and ideas.",
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg` },
  openGraph: {
    title: "ARC / FORM — Art Beyond the Frame",
    description: "Radical material, moving image and ideas that refuse containment.",
    type: "website",
    images: [{ url: `${basePath}/og.png`, width: 1728, height: 910, alt: "ARC / FORM — Art Beyond the Frame" }],
  },
  twitter: { card: "summary_large_image", images: [`${basePath}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
