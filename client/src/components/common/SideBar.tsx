import {
    LayoutDashboard,
    Box,
    Truck,
    ArrowLeftRight,
    Bell,
    ClipboardList,
    BarChart3,
    Users,
    Settings,
    LogOut,
} from "lucide-react"

type MenuItem = {
    label: string
    icon: React.ElementType
    href: string
}

type MenuSection = {
    title: string
    items: MenuItem[]
}

const menuSections: MenuSection[] = [
    {
        title: "Main",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Products", icon: Box, href: "/products" },
            { label: "Suppliers", icon: Truck, href: "/suppliers" },
            { label: "Stock Movement", icon: ArrowLeftRight, href: "/stock" },
        ],
    },
    {
        title: "Analytics",
        items: [
            { label: "Alerts", icon: Bell, href: "/alerts" },
            { label: "Activity Logs", icon: ClipboardList, href: "/logs" },
            { label: "Reports", icon: BarChart3, href: "/reports" },
        ],
    },
    {
        title: "Settings",
        items: [
            { label: "User", icon: Users, href: "/users" },
            { label: "System Preferences", icon: Settings, href: "/settings" },
        ],
    },
]

function Sidebar() {
    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-white px-4 py-3">

            {/* Header */}
            <div className="mb-6 flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm">
                    <Box className="w-5 h-5" />
                </div>

                <div className="leading-tight">
                    <h1 className="text-lg font-bold text-slate-900">
                        Grocery<span className="text-blue-600">Pro</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                        Inventory System
                    </p>
                </div>
            </div>


            {/* Menu */}
            <nav className="flex-1 space-y-6">
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            {section.title}
                        </h2>

                        <ul className="space-y-1">
                            {section.items.map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 active:bg-[#dbeafe] active:text-[#2563eb] hover:bg-[#dbeafe] hover:text-[#2563eb]"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <button className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </aside>
    )
}

export default Sidebar
