import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/SideBar";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/common/AppHeader";

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [screen, setScreen] = useState<"desktop" | "tablet" | "mobile">("desktop");

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;

            if (w < 768) setScreen("mobile");
            else if (w < 1024) setScreen("tablet");
            else setScreen("desktop");
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const collapsed = screen === "desktop" ? !sidebarOpen : true;

    return (
        <div className="flex h-screen w-full bg-[#f1f5f9] overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <div
                className={cn(
                    "flex flex-col flex-1 min-w-0 transition-all duration-300",
                    collapsed ? "ml-16" : "ml-64"
                )}
            >
                <AppHeader />

                <main className="h-[90%] overflow-y-auto px-3 py-4">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
