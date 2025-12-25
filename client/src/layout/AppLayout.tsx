import { Outlet } from "react-router-dom"
import AppHeader from "../components/common/AppHeader"
import Sidebar from "../components/common/SideBar"

function AppLayout() {
    return (
        <div className="h-screen w-screen grid grid-cols-[256px_1fr] grid-rows-1">
            <Sidebar />
            <div className="flex flex-col h-full">
                <AppHeader />
                <main className="overflow-auto h-full">
                    <Outlet />
                </main>
            </div>
        </div >
    )
}

export default AppLayout