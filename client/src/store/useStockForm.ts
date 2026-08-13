import type { Item } from "@/types/transaction";
import { useState } from "react";

export const useStockForm = () => {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (newItem: Item) => {
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearItems = () => setItems([]);

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return { items, addItem, removeItem, clearItems, grandTotal };
};