import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <div className="w-full flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg shadow-zinc-300 p-8">

                {/* Header */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Welcome back
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Sign in to manage your inventory
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <LoginForm />
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-600 hover:underline underline-offset-4"
                    >
                        Create an account
                    </Link>
                </div>

            </div>
        </div>
    );
}
