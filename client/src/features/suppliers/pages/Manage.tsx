import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EntityFormPage } from "@/components/common/EntityFormPage";
import type { SupplierFormData } from "@/types/supplier";
import SupplierForm from "../components/SupplierForm";
import { useSuppliers } from "../hooks/useSuppliers";


export default function ManageSupplier() {
    const { id } = useParams();
    return <SupplierEditor key={id ?? "new"} id={id} />;
}

function SupplierEditor({ id }: { id?: string }) {
    const navigate = useNavigate();
    const { addSupplier, updateSupplier, fetchSupplierById, singleSupplier, isLoading } = useSuppliers();
    const [loading, setLoading] = useState(Boolean(id));
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!id) return;
        let active = true;
        fetchSupplierById(id).catch(() => {
            // The page shows a retry when loading fails.
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [id, attempt, fetchSupplierById]);

    async function submit(data: SupplierFormData) {
        const saved = id ? await updateSupplier(id, data) : await addSupplier(data);
        if (saved) navigate("/suppliers");
    }

    return (
        <EntityFormPage
            title={id ? "Edit supplier" : "Add supplier"}
            description={singleSupplier?.name}
            backTo="/suppliers"
            backLabel="Back to suppliers"
            formId="supplier-form"
            submitLabel={id ? "Save changes" : "Add supplier"}
            saving={isLoading}
            loading={loading}
            loadError={id && !singleSupplier ? "Couldn’t load this supplier." : undefined}
            onRetry={() => { setLoading(true); setAttempt((value) => value + 1); }}
        >
            <SupplierForm initialData={singleSupplier ?? undefined} onSubmit={submit} />
        </EntityFormPage>
    );
}
