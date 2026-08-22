import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MakanBijak — Smart Eating for Malaysians",
  description:
    "A mobile-first web app that helps Malaysians make better food choices using local nutrition data and personal health profiles.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geistSans.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e74c3c]">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none text-[#e74c3c]">
                  MakanBijak
                </h1>
                <p className="text-[10px] font-medium text-[#1abc9c]">
                  Smart Eating
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#e8f8f5] px-2 py-1 text-xs font-medium text-[#1abc9c]">
              Malaysia
            </span>
          </div>
        </header>
        <main className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
