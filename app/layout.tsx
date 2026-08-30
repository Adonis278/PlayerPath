import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ContentProvider } from "@/components/ContentProvider";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "PlayerPath",
  description:
    "Coaching reference and player assessment for grassroots soccer coaches, ages 9-12.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PlayerPath",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f7a4a",
  width: "device-width",
  initialScale: 1,
  // Never block pinch-zoom. A coach reading small print outdoors may need it,
  // and disabling zoom is an accessibility failure.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <ContentProvider>
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
            {children}
          </div>
          <BottomNav />
        </ContentProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
