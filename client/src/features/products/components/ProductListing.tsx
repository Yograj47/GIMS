import { Button } from "@/components/ui/button";
import { type ProductAPIResponse } from "@/interface/Product";
import { Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

function ProductListing({ Product }: { Product: ProductAPIResponse }) {
    const isLowStock = Product.quantity <= Product.threshold;
    const navigate = useNavigate();

    return (
        <tr className="group hover:bg-slate-50/80 transition-colors">
            {/* Product Details (Name & SKU) */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${isLowStock ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                        }`}>
                        {Product.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {Product.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            SKU-{Product._id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>
            </td>

            {/* Category Column */}
            <td className="px-6 py-4 text-left"> {/* Force left alignment to match header */}
                <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1 rounded-md"
                >
                    {Product.category.name}
                </Badge>
            </td>

            {/* Stock Level */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isLowStock ? "text-red-600" : "text-slate-900"}`}>
                            {Product.quantity} {Product.unit.name}
                        </span>
                        {isLowStock && <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-none text-[10px] h-5">LOW</Badge>}
                    </div>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${isLowStock ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min((Product.quantity / 100) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </td>

            {/* Pricing: Clearly Separated for Non-Technical Users */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-6 justify-end">
                    {/* Buying Price (What the owner paid) */}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buying</span>
                        <span className="text-sm font-bold text-slate-500">₹{Product.basePrice}</span>
                    </div>

                    {/* Selling Price (What the customer pays) */}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Selling</span>
                        <span className="text-base font-black text-slate-900">₹{Product.sellingPrice}</span>
                    </div>
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => navigate(`/products/edit/${Product._id}`)}
                >
                    <Edit3 size={16} />
                </Button>
            </td>
        </tr>
    );
}

export default ProductListing;