import Image from "next/image";
import React from "react";

interface Props {
  width?: number;
  height?: number;
  src: string;
  alt?: string;
  circle?: boolean;
}

export default function ImageViewer({
  width = 100,
  height = 100,
  src,
  alt,
  circle = false,
}: Props): React.ReactNode {
  return (
    <div
      style={{ width, height }}
      className={`relative overflow-hidden rounded-${circle ? "full" : "sm"} bg-gray-200`}
    >
      <Image
        fill
        src={src}
        alt={alt ?? "alt"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
