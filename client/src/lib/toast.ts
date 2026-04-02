import { toast } from "sonner";

const glassClass = "rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-lg shadow-black/5 font-sans";
const descClass = "text-slate-500 font-medium";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      className: `${glassClass} text-emerald-600`,
      descriptionClassName: descClass,
    });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      className: `${glassClass} text-red-600`,
      descriptionClassName: descClass,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      className: `${glassClass} text-sky-600`,
      descriptionClassName: descClass,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      className: `${glassClass} text-amber-600`,
      descriptionClassName: descClass,
    });
  }
};