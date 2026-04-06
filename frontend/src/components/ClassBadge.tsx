"use client";

interface Props {
  carClass: string;
  size?: "sm" | "md" | "lg";
}

export default function ClassBadge({ carClass, size = "md" }: Props) {
  const sizeMap = { sm: 36, md: 48, lg: 72 };
  const fontMap = { sm: "0.9rem", md: "1.2rem", lg: "2rem" };
  const s = sizeMap[size];

  return (
    <div
      className={`class-badge class-${carClass}`}
      style={{ width: s, height: s, fontSize: fontMap[size] }}
    >
      {carClass}
    </div>
  );
}
