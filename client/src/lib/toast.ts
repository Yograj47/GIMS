import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      className: "rounded-2xl border-emerald-500/20 bg-slate-900/90 backdrop-blur-xl text-emerald-400 shadow-2xl shadow-emerald-900/20 font-sans",
      descriptionClassName: "text-slate-400 font-medium",
    });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      className: "rounded-2xl border-red-500/20 bg-slate-900/90 backdrop-blur-xl text-red-400 shadow-2xl shadow-red-900/20 font-sans",
      descriptionClassName: "text-slate-400 font-medium",
    });
  },

  info: (message: string, description?: string) => {
    toast(message, {
      description,
      className: "rounded-2xl border-blue-500/20 bg-slate-900/90 backdrop-blur-xl text-blue-400 shadow-2xl shadow-blue-900/20 font-sans",
      descriptionClassName: "text-slate-400 font-medium",
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      className: "rounded-2xl border-amber-500/20 bg-slate-900/90 backdrop-blur-xl text-amber-400 shadow-2xl shadow-amber-900/20 font-sans",
      descriptionClassName: "text-slate-400 font-medium",
    });
  }
};