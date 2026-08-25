import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { QuickNav } from "@/components/QuickNav";
import Link from "next/link";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export const metadata: Metadata = {
  title: "Vennet",
  description: "Digital marketplace for creators, products, and services",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8"><QuickNav />{children}</main>
          <footer className="border-t border-zinc-900 px-5 py-6 text-center text-sm text-zinc-500">
            <span>© {new Date().getFullYear()} Vennet</span><span className="mx-3">·</span><Link href="/terms" className="hover:text-emerald-400">Terms of Service</Link>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
