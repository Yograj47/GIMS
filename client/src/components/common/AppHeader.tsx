import { Bell, ChevronDown } from "lucide-react";

function AppHeader() {
    return (
        <div className="w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-3">
            {/* 1. Store Name */}
            <h2 className="text-xl font-bold text-gray-800">
                Store Name
            </h2>

            {/* 2. Right Side: Notification & User Profile */}
            <div className="flex items-center">

                {/* Animated Notification Bell */}
                <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors group">
                    <Bell
                        size={22}
                        className="group-hover:animate-[ring_0.5s_ease-in-out_infinite] origin-top"
                    />
                    {/* Notification Dot */}
                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-100 mx-2"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105">
                        Y
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-gray-800">Yograj Rijal</span>
                        <span className="text-[11px] text-gray-400 font-medium">Administrator</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

            </div>

            {/* Tailwind Animation Keyframes (Add this to your tailwind.config.js or Global CSS) */}
            <style>{`
        @keyframes ring {
          0% { transform: rotate(0); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(-15deg); }
          75% { transform: rotate(10deg); }
          100% { transform: rotate(0); }
        }
      `}</style>
        </div>
    );
}

export default AppHeader;