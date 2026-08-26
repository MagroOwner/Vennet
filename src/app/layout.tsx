import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { CookieConsent } from "@/components/CookieConsent";
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
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col text-slate-900 antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-5 sm:py-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white px-5 py-7 text-center text-sm font-medium text-slate-500">
            <span>© {new Date().getFullYear()} Vennet</span><span className="mx-3">·</span><Link href="/terms" className="font-semibold text-slate-700 transition hover:text-emerald-700">Terms of Service</Link>
          </footer>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
