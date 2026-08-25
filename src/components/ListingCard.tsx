import Link from "next/link";
import { formatPrice, type Listing } from "@/lib/types";

type DisplaySize = "small" | "medium" | "large";

const cardStyles: Record<DisplaySize, { image: string; body: string; description: string }> = {
  small: { image: "aspect-square", body: "p-3", description: "mt-1 line-clamp-2 text-xs leading-5 text-slate-400" },
  medium: { image: "aspect-[4/3]", body: "p-5", description: "mt-2 line-clamp-2 text-sm leading-6 text-slate-400" },
  large: { image: "aspect-[16/10]", body: "p-6", description: "mt-3 line-clamp-3 text-sm leading-6 text-slate-400" },
};

export function ListingCard({ listing, size = "medium" }: { listing: Listing; size?: DisplaySize }) {
  const style = cardStyles[size];
  return <Link href={"/marketplace/" + listing.id} className="group block overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-950/85 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:shadow-2xl hover:shadow-emerald-950/20">
    <div className={"relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 " + style.image}>{listing.imageUrls[0] ? <img src={listing.imageUrls[0]} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl text-slate-600">✦</div>}<span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-200 backdrop-blur">{listing.category}</span></div>
    <div className={style.body}><div className="flex items-start justify-between gap-3"><h3 className="line-clamp-2 text-base font-bold text-white transition group-hover:text-emerald-200">{listing.title}</h3><span className="whitespace-nowrap text-sm font-bold text-emerald-300">{formatPrice(listing.priceCents, listing.currency)}</span></div><p className={style.description}>{listing.description}</p><div className={size === "small" ? "mt-3 flex items-center justify-between text-xs font-semibold text-slate-300" : "mt-5 flex items-center justify-between text-sm font-semibold text-slate-300"}><span>View offer</span><span className="text-emerald-300 transition group-hover:translate-x-1">→</span></div></div>
  </Link>;
}
