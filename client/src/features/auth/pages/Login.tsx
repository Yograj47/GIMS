import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage({ customer = false }: { customer?: boolean }) {
    return (
        <section className="space-y-6 rounded-xl border border-border bg-card shadow-sm p-5 sm:p-8">
            <header>
                <h1 className="shop-display text-3xl font-semibold tracking-tight">{customer ? "Customer sign in" : "Workspace sign in"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{customer ? "Sign in with your grocery shopping account." : "Sign in with your store team account."}</p>
            </header>
            <LoginForm customer={customer} />
            {customer && <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                New to GroceryPro? <Link to="/shop/register" className="font-medium text-link underline-offset-4 hover:underline">Create account</Link>
            </p>}
        </section>
    );
}
