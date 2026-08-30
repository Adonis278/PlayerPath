import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Static export. Firebase Hosting serves plain files, Firestore is reached
   * directly from the client with security rules doing authorization, so there is
   * no server to run. This is also what lets the service worker precache the
   * whole app for sideline use.
   */
  output: "export",

  // next/image's optimizer needs a server; static export ships the files as-is.
  // Our images are already cropped and compressed to display size at build time.
  images: { unoptimized: true },

  // Firebase Hosting serves /browse from /browse/index.html.
  trailingSlash: true,
};

export default nextConfig;
