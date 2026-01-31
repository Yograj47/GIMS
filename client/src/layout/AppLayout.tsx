import { Outlet } from "react-router-dom"
import AppHeader from "../components/common/AppHeader"
import Sidebar from "../components/common/SideBar"

function AppLayout() {
    return (
        <div className="h-screen w-full flex bg-[#fcfcfd] overflow-hidden">
            {/* Fixed Sidebar */}
            <Sidebar />
            
            <div className="flex flex-col flex-1 min-w-0 h-full">
                {/* Fixed Header */}
                <AppHeader />
                
                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppLayout