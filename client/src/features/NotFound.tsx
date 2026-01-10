import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Page Not Found
                </h2>

                <p className="text-gray-500 mb-6">
                    The page you are looking for does not exist or has been moved.
                </p>

                <Link
                    to="/"
                    className="inline-block rounded-md bg-gray-800 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 transition"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
