import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export const Loading = ({ className, size = "md", fullPage = false }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  const loader = (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Glow - Animated Spinner */}
      <div className={cn(
        "absolute rounded-full border animate-spin",
        sizeClasses[size]
      )} style={{ borderColor: "rgb(37, 99, 235) transparent rgb(37, 99, 235) rgb(37, 99, 235)" }} />
      {/* Inner Muted Ring */}
      <div className={cn(
        "rounded-full border",
        sizeClasses[size]
      )} style={{ borderColor: "rgb(226, 232, 240)" }} />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
        {loader}
        <p className="mt-4 text-sm font-bold text-slate-900 animate-pulse tracking-tight">
          GROCERY<span className="text-blue-600">PRO</span>
        </p>
      </div>
    );
  }

  return loader;
};