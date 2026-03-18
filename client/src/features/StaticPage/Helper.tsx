import {
    Search,
    LifeBuoy,
    MessageSquare,
    Mail,
    ArrowRight,
    ShieldCheck,
    Globe,
    Phone,
    LayoutDashboard
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HelpPage() {
    const commonIssues = [
        {
            title: "Access & Security",
            desc: "Trouble with OTP or password resets? Secure your Han IT Hub account.",
            icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        },
        {
            title: "Inventory Setup",
            desc: "Learn how to categorize products and set up your initial stock levels.",
            icon: <LayoutDashboard className="w-5 h-5 text-blue-400" />,
        },
        {
            title: "System Standards",
            desc: "Technical requirements and browser compatibility for the GIMS platform.",
            icon: <Globe className="w-5 h-5 text-slate-400" />,
        }
    ];

    const email = "yograjrijal926@gmail.com";
    const subject = "GIMS Issue: [Brief Description]";
    const body = "Hello Han IT Hub Support,I am experiencing the following issue with GIMS: ";


    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailtoHref = `mailto:${email}?subject=${subject}&body=${body}`;

    const handleEmailSupport = () => {
        // Check if the user is on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile: Use the standard system trigger
            window.location.href = mailtoHref;
        } else {
            // Desktop: Force open Gmail in a new tab (more reliable for web users)
            window.open(gmailLink, '_blank');
        }
    };
    return (
        <div className="min-h-screen bg-transparent text-slate-200 p-6 md:p-12 animate-in fade-in duration-700">

            {/* Search Header - Keeping it for future Docs integration */}
            <div className="w-full mx-auto text-center mb-20">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                    How can we <span className="text-blue-500 font-black">Help?</span>
                </h1>
                <p className="text-slate-400 font-medium mb-10 text-lg">
                    Search the <span className="text-white">Han IT Hub</span> knowledge base or contact support.
                </p>

                <div className="relative max-w-4xl mx-auto group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <Input
                        placeholder="Search for GIMS setup guides..."
                        className="w-full py-8 pl-14 pr-6 bg-slate-950/40 border-white/5 backdrop-blur-xl rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-2xl"
                    />
                </div>
            </div>

            {/* Quick Action Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {commonIssues.map((issue, idx) => (
                    <div
                        key={idx}
                        className="group p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                                {issue.icon}
                            </div>
                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{issue.title}</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            {issue.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Support Channels */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Contact Specialist Card */}
                <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-10 flex flex-col justify-between items-start group">
                    <div>
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/40">
                            <MessageSquare className="text-white" size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Technical Specialist</h2>
                        <p className="text-slate-400 font-medium mb-8">
                            Direct consultation for system integration and custom features.
                        </p>
                    </div>
                    <button
                        onClick={handleEmailSupport}
                        className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 active:scale-95 transition-all shadow-lg"
                    >
                        Email Support <ArrowRight size={18} />
                    </button>
                </div>

                {/* Company Info Card */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Phone size={20} /></div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Direct Line</h4>
                                <p className="text-xs text-slate-500 mt-1">+977 98XXXXXXX</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Mail size={20} /></div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Official Inquiry</h4>
                                <p className="text-xs text-slate-500 mt-1">yograjrijal926@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><LifeBuoy size={20} /></div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Han IT Hub Status</h4>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                    GIMS Services Operational <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                            Developed by Han IT Hub
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}