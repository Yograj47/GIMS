import { Link } from "react-router-dom";

const Home = () => {
    return (
        <>
            <div className="max-w-3xl text-center">
                {/* Heading */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Welcome to <span className="text-gray-700">GIMS</span>
                </h1>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                    GIMS helps you manage grocery inventory, stock movements, suppliers,
                    and transactions in a simple and organized way.
                </p>

                <p className="text-gray-500 mb-10">
                    Everything you need to track stock, sales, and purchases — all in one
                    system.
                </p>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <Link
                        to="/login"
                        className="px-6 py-3 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition"
                    >
                        Sign In
                    </Link>

                    <Link
                        to="/about"
                        className="px-6 py-3 rounded-md border border-gray-400 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Home;
