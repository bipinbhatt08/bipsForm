import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL!

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "BipsForm — Always on form",
    template: "%s | BipsForm",
  },
  description: "Always on form — build, share and collect responses at scale. 9 field types, 5 beautiful themes, conditional logic, and a real-time response dashboard. Free to start.",
  keywords: ["form builder", "online forms", "survey builder", "conditional logic", "BipsForm", "always on form"],
  authors: [{ name: "BipsForm" }],
  creator: "BipsForm",
  openGraph: {
    title: "BipsForm — Always on form",
    description: "Always on form — build, share and collect responses at scale. Stunning themes, conditional logic, real-time dashboard.",
    url: BASE_URL,
    siteName: "BipsForm",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BipsForm — Always on form",
    description: "Always on form — build, share and collect responses at scale. Stunning themes, conditional logic, real-time dashboard.",
    creator: "@bipsform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GlobalProviders>
          {children}
          <Toaster
            richColors
            position={'bottom-right'}
            toastOptions={{
              classNames: {
                toast: "font-sans",
              },
            }}
          />
        </GlobalProviders>
      </body>
    </html>
  );
}
