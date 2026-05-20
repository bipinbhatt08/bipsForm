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

export const metadata: Metadata = {
  title: {
    default: "BipsForm",
    template: "%s | BipsForm",
  },
  description: "Always on form — build, share and collect responses at scale.",
  keywords: ["form builder", "form creator", "survey", "BipsForm"],
  openGraph: {
    title: "BipsForm",
    description: "Always on form — build, share and collect responses at scale.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
