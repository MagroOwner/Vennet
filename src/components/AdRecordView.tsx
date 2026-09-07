"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AD_SCENE_HEIGHT, AD_SCENE_WIDTH, AdScene } from "./AdScene";

export function AdRecordView({ index }: { index: number }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / AD_SCENE_WIDTH, window.innerHeight / AD_SCENE_HEIGHT));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#030814]">
      <div style={{ width: AD_SCENE_WIDTH, height: AD_SCENE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "center" }}>
        <AdScene index={index} />
      </div>
      <Link href="/studio/ads" aria-label="Exit record mode" className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-black text-white/70 opacity-0 transition hover:bg-white/20 hover:opacity-100 focus:opacity-100">Exit ✕</Link>
    </div>
  );
}
