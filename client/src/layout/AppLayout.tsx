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

        <div className="flex h-screen w-full overflow-hidden font-sans antialiased text-slate-900">

            {/* 1. SIDEBAR WRAPPER */}
            <div className="no-print relative z-60">
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div
                className={cn(
                    "flex flex-col flex-1 min-w-0 transition-all duration-500 ease-in-out",
                    collapsed ? "ml-20" : "ml-64",
                    screen === "mobile" && "ml-0"
                )}
            >

                    {/* Header */}
                    <div className="no-print border-b border-slate-300 backdrop-blur-md sticky top-0 z-50"> 
                        <AppHeader />
                    </div>

                    {/* Main */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-200">
                        <div className="max-w-350 mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
            );
}

            export default AppLayout;