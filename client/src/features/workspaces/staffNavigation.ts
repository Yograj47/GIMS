import { ClipboardList, RotateCcw, ShoppingCart, Users } from "lucide-react";
export const staffActions = [
    { label: "New sale", to: "/stock-movements/sale", icon: ShoppingCart },
    { label: "Customer returns", to: "/stock-movements/customer-return", icon: RotateCcw },
    { label: "Orders", to: "/stock-movements/orders", icon: ClipboardList },
    { label: "Customers", to: "/staff/customers", icon: Users },
];
