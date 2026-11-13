import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

export default function Register() {
    return (
        <section className="space-y-6 rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Create a customer account</h1>
            </header>
            <RegisterForm />
            <p className="border-t border-white/10 pt-4 text-sm text-slate-300">
                Already have an account? <Link to="/login" className="font-medium text-brand-300 underline-offset-4 hover:underline">Sign in</Link>
            </p>
        </section>
    );
}
