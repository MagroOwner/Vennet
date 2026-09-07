import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { CookieConsent } from "@/components/CookieConsent";
import { GuidePanel } from "@/components/GuidePanel";
import Link from "next/link";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vennetofficial.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Vennet | Digital work worth owning", template: "%s | Vennet" },
  description: "Discover and sell templates, code, bots, automations, AI tools, and creator services with clear delivery on Vennet.",
  openGraph: { type: "website", locale: "en_US", url: siteUrl, siteName: "Vennet", title: "Vennet | Digital work worth owning", description: "Buy and sell useful digital work from independent creators." },
  twitter: { card: "summary_large_image", title: "Vennet | Digital work worth owning", description: "Buy and sell useful digital work from independent creators." },
  robots: { index: true, follow: true },
};

const footerColumns = [
  ["Marketplace", [["Browse offers", "/marketplace"], ["Categories", "/collections"], ["Discover", "/discover"]]],
  ["Sell", [["Start selling", "/signup?next=/dashboard/seller"], ["Seller hub", "/dashboard/seller"], ["Vennet Pro", "/pro"]]],
  ["Company", [["Help center", "/help"], ["About Vennet", "/"], ["Contact support", "/help"]]],
  ["Legal", [["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"], ["Legal notices", "/legal"]]],
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col text-slate-900 antialiased`}><Providers><Navbar /><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-5 sm:py-8">{children}</main><footer className="mt-10 border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">{footerColumns.map(([title, links]) => <section key={title}><h2 className="text-sm font-black text-[#10151f]">{title}</h2><ul className="mt-4 space-y-2.5">{links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm font-medium text-slate-600 transition hover:text-emerald-800">{label}</Link></li>)}</ul></section>)}</div><div className="border-t border-slate-200"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© {new Date().getFullYear()} Vennet. Built for useful digital work.</span><span>Secure checkout powered by Stripe.</span></div></div></footer><GuidePanel /><CookieConsent /></Providers></body></html>;
}
