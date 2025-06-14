import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "AuraFlow",
  description:
    "Create desktop images for your screen with your personalized masterpiece maxim",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AuraFlow",
    description:
      "Create desktop images for your screen with your personalized masterpiece maxim",
    url: "https://auraflow.stackforgelabs.icu",
    images: [
      "https://res.cloudinary.com/dejzy9q65/image/upload/v1749903917/Screenshot_2025-06-14_at_5.30.20_PM_bwtqkk.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraFlow",
    site: "https://auraflow.stackforgelabs.icu",
    description:
      "Create desktop images for your screen with your personalized masterpiece maxim",
    creator: "@notamitwts",
    images: [
      "https://res.cloudinary.com/dejzy9q65/image/upload/v1749903917/Screenshot_2025-06-14_at_5.30.20_PM_bwtqkk.png",
    ],
  },
  keywords:
    "aura, aura flow, aura flow app, aura flow desktop, aura flow wallpaper, aura flow background, aura flow image generator, personalized desktop images, custom wallpapers, create wallpapers, generate wallpapers, desktop customization, personalized backgrounds, custom desktop images, create desktop images",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}
      >
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
