import { PageHeader } from "@/components/common/PageHeader";
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
        <section className="w-full space-y-3 p-3 sm:p-4">
            <PageHeader title={billing ? "Supplier billing" : "Suppliers"} icon={Truck}>
                {!billing && <Button asChild><Link to="/suppliers/add"><Plus aria-hidden="true" /> Add supplier</Link></Button>}
            </PageHeader>

            <DataTable
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input aria-label="Search suppliers" placeholder="Search by name, contact, or address" value={searchQuery} onChange={(event) => updateSearch(event.target.value)} className="pl-9" />
                        </div>
                        {searchQuery && <Button variant="ghost" onClick={() => updateSearch("")}>Clear search</Button>}
                    </div>
                }
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
    );
};

export default Suppliers;
