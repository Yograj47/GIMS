import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      className: "rounded-xl border-emerald-100 bg-emerald-50 text-emerald-900",
    });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      className: "rounded-xl border-red-100 bg-red-50 text-red-900",
    });
  },

  info: (message: string, description?: string) => {
    toast(message, {
      description,
      className: "rounded-xl border-blue-100 bg-blue-50 text-blue-900",
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      className: "rounded-xl border-amber-100 bg-amber-50 text-amber-900",
    });
  }
};