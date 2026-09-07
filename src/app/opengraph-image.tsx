import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vennet — digital work worth owning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#10151f", color: "white", padding: "72px", fontFamily: "Arial, sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 32, fontWeight: 700 }}><div style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, color: "#10151f", background: "#2fcf91", fontWeight: 900 }}>V</div>vennet</div><div style={{ display: "flex", flexDirection: "column", gap: "18px" }}><div style={{ color: "#95ecc5", fontSize: 24, fontWeight: 700 }}>A marketplace for useful digital work</div><div style={{ fontSize: 76, lineHeight: 1, letterSpacing: -4, fontWeight: 800 }}>Find work worth<br />owning.</div></div><div style={{ color: "#d6e5dc", fontSize: 26 }}>Templates · Code · Bots · AI tools · Creator services</div></div>, size);
}
