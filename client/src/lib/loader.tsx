import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export const Loading = ({ className, size = "md", fullPage = false }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-[3px]",
    lg: "w-16 h-16 border-4",
  };

  const loader = (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div 
        className={cn(
          "absolute rounded-full animate-spin transition-all duration-500",
          sizeClasses[size]
        )} 
        style={{ 
          borderTopColor: "rgb(37, 99, 235)", 
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent" 
        }} 
      />
      
      <div 
        className={cn(
          "rounded-full border shadow-[0_0_15px_rgba(37,99,235,0.05)]",
          sizeClasses[size]
        )} 
        style={{ borderColor: "rgba(30, 41, 59, 0.5)" }} 
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white backdrop-blur-xl animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          {loader}
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-1">
          <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.4em] ml-[0.4em]">
            System Loading
          </p>
          <p className="text-sm font-black text-slate-400 tracking-widest uppercase">
            GROCERY<span className="text-blue-500">PRO</span>
          </p>
        </div>
      </div>
    );
  }

  return loader;
};