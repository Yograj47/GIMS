import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">GroceryPro</h1>
            <p className="mx-auto max-w-xl text-pretty text-base leading-relaxed text-slate-200 sm:text-lg">
                Shop groceries for pickup or delivery. Store teams can sign in to manage inventory, sales, and supplier deliveries.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" className="bg-market-yellow text-brand-950 hover:bg-market-yellow/90" asChild>
                    <Link to="/shop"><ShoppingBasket size={18} /> Shop groceries</Link>
                </Button>
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white" asChild>
                    <Link to="/login">Staff sign in <ArrowRight size={18} /></Link>
                </Button>
            </div>
        </div>
    );
}
