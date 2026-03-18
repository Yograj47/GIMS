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

    // Matches the new Sidebar logic: 
    // Desktop can toggle, Tablet/Mobile are always collapsed (icon only)
    const collapsed = screen === "desktop" ? !sidebarOpen : true;

    return (
        <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
            {/* 1. SIDEBAR WRAPPER */}
            <div className="no-print">
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div
                className={cn(
                    "flex flex-col flex-1 min-w-0 transition-all duration-500 ease-in-out",
                    // Adjusted margins to match the new Sidebar widths (20 and 64)
                    collapsed ? "ml-20" : "ml-64",
                    // On mobile, we might want to hide the margin entirely if you 
                    // implement a drawer, but for now, this keeps it consistent:
                    screen === "mobile" && "ml-20" 
                )}
            >
                <div className="no-print">
                    <AppHeader />
                </div>

                {/* 3. SCROLLABLE CANVAS */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8">
                    <div className="max-w-400 mx-auto animate-in fade-in duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppLayout;