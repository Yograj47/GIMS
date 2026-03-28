import { AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    itemName?: string;
    description?: string;
    actionText?: string;
    isLoading?: boolean;
}

export const DeleteConfirmDialog = ({
    open,
    onOpenChange,
    onConfirm,
    title = "Confirm Deletion",
    itemName = "this item",
    description,
    actionText = "Delete Records",
    isLoading = false
}: DeleteConfirmDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-sm border-slate-200 max-w-100">
                <AlertDialogHeader>
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                        <AlertTriangle size={20} />
                    </div>
                    
                    <AlertDialogTitle className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                        {title}
                    </AlertDialogTitle>
                    
                    <AlertDialogDescription className="text-slate-500 text-xs font-medium leading-relaxed">
                        {description || (
                            <>
                                Removing <span className="text-slate-900 font-bold uppercase tracking-tight">{itemName}</span> from the registry is permanent. This action cannot be reversed within the current audit cycle.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 mt-4">
                    <AlertDialogCancel 
                        disabled={isLoading}
                        className="rounded-sm border-slate-200 font-bold text-[12px] uppercase tracking-widest h-9 px-4 transition-colors"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className="rounded-sm bg-rose-600 hover:bg-rose-700 text-white font-bold text-[12px] uppercase tracking-widest h-9 px-4 shadow-sm transition-all"
                    >
                        {isLoading ? "Processing..." : actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};