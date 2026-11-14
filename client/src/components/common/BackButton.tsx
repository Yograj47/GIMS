import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function BackButton({ children = "Back", className }: { children?: ReactNode; className?: string }) {
    const navigate = useNavigate();
    return <button type="button" aria-label="Back" className={className} onClick={() => navigate(-1)}>{children}</button>;
}
