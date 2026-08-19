import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant: "wordmark" | "mark" | "lockup";
  className?: string;
  priority?: boolean;
};

const ASSETS = {
  wordmark: { src: "/brand/wordmark.png", alt: "moove", width: 480, height: 140 },
  mark: { src: "/brand/mark.png", alt: "Moove", width: 320, height: 200 },
  lockup: { src: "/brand/lockup.png", alt: "MOOVE", width: 640, height: 160 },
} as const;

export function BrandLogo({ variant, className, priority }: BrandLogoProps) {
  const asset = ASSETS[variant];
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn("logo-knockout h-auto w-auto select-none", className)}
    />
  );
}
