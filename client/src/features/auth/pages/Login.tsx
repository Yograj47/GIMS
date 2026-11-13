import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <section className="space-y-6 rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
                <p className="mt-1 text-sm text-slate-300">Sign in to your GroceryPro account.</p>
            </header>
            <LoginForm />
            <p className="border-t border-white/10 pt-4 text-sm text-slate-300">
                New to GroceryPro? <Link to="/register" className="font-medium text-brand-300 underline-offset-4 hover:underline">Create account</Link>
            </p>
        </section>
    );
}
