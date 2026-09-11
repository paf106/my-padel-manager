import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#064e3b",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 260,
        fontWeight: 800,
        borderRadius: 96,
      }}
    >
      P
    </div>,
    size,
  );
}
