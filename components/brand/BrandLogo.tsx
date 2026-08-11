type BrandLogoProps = {
  variant: "header" | "lockup" | "symbol";
  className?: string;
};

export function BrandLogo({ variant, className = "" }: BrandLogoProps) {
  return (
    <span
      className={["brand-logo", `brand-logo--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}
