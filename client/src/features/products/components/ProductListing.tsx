import { Button } from "@/components/ui/button";
import { type ProductAPIResponse } from "@/interface/Product";
import { AlertTriangle, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductListing({ Product }: { Product: ProductAPIResponse }) {
    const isLowStock = Product.quantity <= Product.threshold;
    const navigate = useNavigate();

    return (
        <tr
            key={Product._id}
            className={`group hover:bg-gray-100`}
        >
            {/* Product Name & Alert */}
            <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                    {isLowStock && (
                        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                            <AlertTriangle size={16} />
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-gray-900 leading-none">{Product.name}</p>
                        <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                            ID: {Product._id.slice(-6)}
                        </p>
                    </div>
                </div>
            </td>

            {/* Category */}
            <td className="px-8 py-5">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 capitalize">
                    {Product.category.name}
                </span>
            </td>

            {/* Stock Levels */}
            <td className="px-8 py-5">
                <div className="flex flex-col">
                    <span
                        className={`text-base font-black ${isLowStock ? "text-red-600" : "text-gray-900"
                            }`}
                    >
                        {Product.quantity} {Product.unit.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Min: {Product.threshold}
                    </span>
                </div>
            </td>

            {/* Pricing */}
            <td className="px-8 py-5 font-bold text-gray-600">₹{Product.basePrice}</td>
            <td className="px-8 py-5 font-bold text-blue-600">₹{Product.sellingPrice}</td>

            {/* Actions */}
            <td className="px-8 py-5 text-right">
                <Button variant={"link"}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/products/edit/${Product._id}`)
                    }}
                >
                    <Edit3 size={14} />
                    Edit
                </Button>
            </td>
        </tr>
    );
}

export default ProductListing;