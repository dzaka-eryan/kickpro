import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KickPro — Event & Sparring Komunitas Bola",
    template: "%s | KickPro",
  },
  description:
    "KickPro — platform otomasi event mabar, booking slot QRIS, dan sparring komunitas bola.",
  icons: {
    icon: "/favicon.png?v=3",
    apple: "/favicon.png?v=3",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#03251B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
