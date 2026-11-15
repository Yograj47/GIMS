import { PageHeader } from "@/components/common/PageHeader";
import { LayoutDashboard } from "lucide-react";

export function DashboardPageHeader() {
    return <PageHeader title="Dashboard" description="Stock value, recent movements, and low-stock alerts." icon={LayoutDashboard} />;
}
