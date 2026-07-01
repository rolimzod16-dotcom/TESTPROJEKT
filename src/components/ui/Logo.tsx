type LogoProps = {
  size?: "sm" | "lg";
  className?: string;
};

export function Logo({ size = "sm", className = "" }: LogoProps) {
  const box = size === "lg" ? "h-16 w-16 text-3xl" : "h-10 w-10 text-xl";

  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-amber-400 shadow-md shadow-amber-200 ${box} ${className}`}
    >
      🐝
    </div>
  );
}