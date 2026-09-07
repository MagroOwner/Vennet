import { ImageResponse } from "next/og";

export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#e8faf0", border: "4px solid #2fcf91", borderRadius: "24px", display: "flex", height: "100%", justifyContent: "center", width: "100%" }}>
      <svg width="64" height="64" viewBox="0 0 96 96" aria-label="Vennet">
        <path d="M14 18h18l16 37 16-37h18L48 80 14 18Z" fill="#10151f" />
        <path d="M28 18h12l8 20 8-20h12L48 63 28 18Z" fill="#2fcf91" />
      </svg>
    </div>,
    size,
  );
}
