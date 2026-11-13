import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <main className="grid min-h-dvh place-items-center bg-market-paper px-4">
            <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center sm:p-8">
                <h1 className="text-xl font-semibold text-slate-950">Page not found</h1>
                <p className="text-sm text-slate-600">
                    The page you are looking for does not exist or has been moved.
                </p>

                <Link
                    to="/"
                    className="inline-flex min-h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
                >
                    Back to home
                </Link>
            </div>
        </main>
    );
};

export default NotFound;
