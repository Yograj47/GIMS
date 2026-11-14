import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Truck } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { useSuppliers } from '../hooks/useSuppliers';
import { getSupplierColumns } from '../components/SupplierColumns';
import { Input } from '@/components/ui/input';
import { useAuthStore } from "@/store/authStore";
import { useDebounce } from '@/lib/debounce';

const Suppliers: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);

    const { Suppliers, fetchSuppliers, isLoading, meta } = useSuppliers();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        fetchSuppliers(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch);
    }, [fetchSuppliers, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

    const billing = useAuthStore((state) => state.user?.role === "accountant");
    const columns = useMemo(() => getSupplierColumns(billing), [billing]);

    const updateSearch = (value: string) => {
        setSearchQuery(value);
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    };

    return (
        <section className="mx-auto w-full max-w-6xl space-y-7 px-4 py-7 sm:px-6 sm:py-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{billing ? "Supplier billing" : "Suppliers"}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {billing ? "Choose a supplier to post bills or review payments and credits." : "Find suppliers and open their profiles."}
                    </p>
                </div>
                {!billing && <Button asChild><Link to="/suppliers/add"><Plus aria-hidden="true" /> Add supplier</Link></Button>}
            </header>

            <section aria-labelledby="supplier-directory" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
                <div className="space-y-3 border-b border-border p-5 sm:p-6">
                    <h2 id="supplier-directory" className="font-semibold">Supplier directory</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input aria-label="Search suppliers" placeholder="Search by name, contact, or address" value={searchQuery} onChange={(event) => updateSearch(event.target.value)} className="pl-9" />
                        </div>
                        {searchQuery && <Button variant="ghost" onClick={() => updateSearch("")}>Clear search</Button>}
                    </div>
                </div>
                <DataTable embedded
                    columns={columns}
                    data={Suppliers || []}
                    isLoading={isLoading}
                    rowCount={meta?.totalItems || 0}
                    pageCount={meta?.totalPages || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    emptyState={<div className="grid justify-items-center gap-2 whitespace-normal">
                        <Truck aria-hidden="true" className="size-6 text-link" />
                        <p className="font-medium text-foreground">{searchQuery ? "No matching suppliers" : "No suppliers yet"}</p>
                        <p>{searchQuery ? "Try another name, contact, or address." : billing ? "Suppliers will appear when a manager adds them." : "Add a supplier to start tracking deliveries and bills."}</p>
                    </div>}
                />
            </section>
        </section>
    );
};

export default Suppliers;
