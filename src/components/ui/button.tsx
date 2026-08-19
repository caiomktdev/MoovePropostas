import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "line";
  size?: "md" | "lg" | "sm";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-7 text-base",
        variant === "primary" &&
          "bg-primary text-white shadow-[0_0_32px_-8px_rgb(94_43_255_/_0.8)] hover:bg-primary-soft",
        variant === "ghost" && "bg-white/5 text-ink hover:bg-white/10",
        variant === "line" && "border border-line-strong text-ink hover:border-lilac/40 hover:bg-white/5",
        className,
      )}
      {...props}
    />
  );
}
