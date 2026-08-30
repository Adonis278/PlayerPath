import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ContentProvider } from "@/components/ContentProvider";
import { BottomNav, SideNav } from "@/components/AppNav";
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

/**
 * Responsive shell.
 *
 * Phone gets a single column with a bottom tab bar. Tablet and desktop get a
 * left rail and a wider content area - an iPad is not a big phone, and pinning
 * everything to 512px in the middle of a 1024px screen wastes the one thing a
 * tablet actually offers.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-bg text-ink">
        <ContentProvider>
          <div className="flex min-h-dvh">
            <SideNav />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="mx-auto flex w-full max-w-lg flex-1 flex-col md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
                {children}
              </div>
              <BottomNav />
            </div>
          </div>
        </ContentProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
