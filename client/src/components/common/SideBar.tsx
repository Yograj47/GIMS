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
    SidebarClose,
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
            { label: "User Management", icon: Users, href: "/users" },
            { label: "System Preferences", icon: Settings, href: "/settings" },
        ],
    },
]

function Sidebar() {
    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-white px-4 py-3">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-lg font-semibold">Grocery IMS</h1>
                <SidebarClose className="cursor-pointer text-muted-foreground" />
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
                                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
