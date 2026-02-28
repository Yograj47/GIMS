import type { PaginationMetadata } from "./Unit";

export type MovementData = {
  _id: string;
  product: {
    _id: string;
    name: string
  };
  transactionId?: string;
  performedBy: {
    _id: string;
    name: string
  };
  unit?: {
    _id: string;
    name: string;
  };
  multiplier: number;
  quantity: number;
  movementType: 'IN' | 'OUT';
  oldQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
};

export interface MovementAPIResponse {
  status: string;
  data: MovementData[] | null;
  meta?: PaginationMetadata
}