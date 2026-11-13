import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-market-paper px-4 py-8">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 text-center max-w-md mb-8">
        You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="flex gap-2"
        >
          <ArrowLeft size={16} /> Go Back
        </Button>
        <Button 
          onClick={() => navigate("/dashboard")}
          className="bg-brand-600 hover:bg-brand-700"
        >
          Dashboard
        </Button>
      </div>
    </main>
  );
}
