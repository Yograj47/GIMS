import { Bell, ChevronDown, Search } from "lucide-react";

function AppHeader() {
    return (
        <header className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Main Branch 
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Shortcut Placeholder (UI Best Practice) */}
                <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-lg text-slate-400 gap-2 border border-slate-200">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none text-sm w-32"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                        <Bell size={20} className="hover:rotate-12 transition-transform" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                    </button>
                    
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    {/* Improved Profile Section */}
                    <button className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-full transition-all group">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            YR
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-none">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Yograj Rijal</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Super Admin</span>
                        </div>
                        <ChevronDown size={14} className="text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </header>
    );
}

export default AppHeader;