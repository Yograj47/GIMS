import { ArrowLeft, Mail } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supportEmail } from "./publicInfo";

const pages = {
    about: {
        title: "About GroceryPro",
        intro: "GroceryPro connects grocery store operations and online shopping.",
        sections: [
            { title: "Store workspace", text: "Store teams use their workspace accounts to manage inventory, record sales and returns, receive supplier deliveries, and review financial reports." },
            { title: "Online shop", text: "Customers can browse groceries and place orders for pickup or delivery through the storefront." },
        ],
    },
    contact: {
        title: "Contact",
        intro: "Email support for help with your account or an order.",
        sections: [
            { title: "What to include", text: "Describe what happened and include your order reference if you have one. Keep passwords, verification codes, and payment card details out of the message." },
        ],
    },
    terms: {
        title: "Terms of use",
        intro: "Draft for review before public launch.",
        sections: [
            { title: "Workspace accounts", text: "Use the account assigned to you and keep your password and verification codes private. Record store transactions and inventory changes accurately." },
            { title: "Shopping and orders", text: "Review your items, total, and fulfillment details before submitting an order. Contact the store for help with order changes, cancellations, or returns." },
        ],
    },
    privacy: {
        title: "Privacy notice",
        intro: "Draft for review before public launch.",
        sections: [
            { title: "Account and order data", text: "GroceryPro uses your name and email for your account. Orders use contact details for fulfillment and a delivery address when delivery is selected." },
            { title: "Sessions and security logs", text: "GroceryPro uses a session cookie to keep you signed in. Security logs may record activity, IP address, request protocol, and browser information." },
            { title: "Privacy questions", text: "Use the contact page to ask about the information associated with your account or order." },
        ],
    },
};

export default function PublicInfoPage({ page }: { page: keyof typeof pages }) {
    const { title, intro, sections } = pages[page];
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [page]);

    return (
        <main className="min-h-dvh bg-white px-5 py-7 text-black selection:bg-neutral-200 selection:text-black sm:px-8 sm:py-10" style={{ colorScheme: "light" }}>
            <div className="mx-auto max-w-3xl">
                <button type="button" onClick={() => {
                    if (window.history.state?.idx > 0) navigate(-1);
                    else navigate("/shop", { replace: true });
                }} className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
                    <ArrowLeft className="size-4" aria-hidden="true" /> Back
                </button>
                <article className="mt-8 sm:mt-12">
                    <header className="border-b-2 border-black pb-6">
                        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{title}</h1>
                        <p className="mt-3 max-w-prose text-base leading-7">{intro}</p>
                    </header>
                    {page === "contact" && (
                        <a href={`mailto:${supportEmail}`} className="mt-6 inline-flex max-w-full items-start gap-2 text-base font-medium underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
                            <Mail aria-hidden="true" className="mt-1 size-4 shrink-0" />
                            <span className="break-all">{supportEmail}</span>
                        </a>
                    )}
                    <div className="space-y-7 py-7 sm:space-y-8 sm:py-8">
                        {sections.map((section) => (
                            <section key={section.title}>
                                <h2 className="text-lg font-semibold">{section.title}</h2>
                                <p className="mt-2 text-base leading-7">{section.text}</p>
                            </section>
                        ))}
                    </div>
                    {page === "about" && <Link className="inline-block text-sm font-medium underline underline-offset-4 hover:decoration-2" to="/shop">Visit the shop</Link>}
                    {(page === "privacy" || page === "terms") && <Link className="inline-block text-sm font-medium underline underline-offset-4 hover:decoration-2" to="/contact">Contact support</Link>}
                </article>
            </div>
        </main>
    );
}
