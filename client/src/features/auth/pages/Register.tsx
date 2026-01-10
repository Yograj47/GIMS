import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  return (
    <div className="relative w-full h-full">

      {/* Back to Login – pinned left */}
      <div className="absolute left-0 top-1">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="mr-1.5 h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>

      {/* Centered Content */}
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="flex flex-col space-y-2 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Create an account
              </h2>

              <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                Step 1 of 1
              </span>
            </div>

            <p className="text-sm text-slate-500">
              Join Grocery Pro to start managing your inventory efficiently.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
