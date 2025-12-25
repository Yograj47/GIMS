import { Link } from "react-router-dom"; 
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <div className="w-full h-full">
            {/* Header section with more impact */}
            <div className="flex flex-col space-y-2 mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Welcome back
                </h2>
                <p className="text-sm text-slate-500">
                    Enter your credentials to manage your inventory
                </p>
            </div>

            {/* The Form */}
            <div>
                <LoginForm />
            </div>

            {/* Footer / Helper Info */}
            <div className="mt-8 flex flex-col items-center space-y-4">
                <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 w-full">
                    <p className="text-[11px] font-medium text-blue-600/80 text-center uppercase tracking-wider mb-1">
                        Quick Access Demo
                    </p>
                    <p className="text-xs text-slate-600 text-center font-mono">
                        admin@grocery.local <span className="mx-1 opacity-30">|</span> demo123
                    </p>
                </div>

                <div className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 font-semibold hover:underline underline-offset-4"
                    >
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}