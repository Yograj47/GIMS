import { Link } from "react-router-dom";
import { ArrowRight, Info, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
    return (
        <div className="max-w-3xl text-center animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <PackageSearch className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                    Inventory Ecosystem
                </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-[1.1]">
                Master Your Stock <br />
                <span className="text-blue-500">Simplify Your Business.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 mb-4 leading-relaxed max-w-2xl mx-auto">
                GIMS provides the professional tools you need to manage grocery inventory,
                track stock movements, and audit transactions in one secure, real-time system.
            </p>

            <p className="text-slate-500 mb-8 text-sm font-medium italic">
                The ultimate control center for stock, sales, and supplier management.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-900/20 group">
                    <Link to="/login" className="flex items-center gap-2">
                        Sign In to Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/5 h-12 px-8 rounded-xl transition-all"
                >
                    <Link to="/about" className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Learn More
                    </Link>
                </Button>
            </div>
        </div>
    );
};
export default Home;