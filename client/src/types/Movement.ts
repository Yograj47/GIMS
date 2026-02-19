export type MovementData = {
  _id: string;
  productId: {
    _id: string;
    name: string
  };
  transactionId?: string;
  performedBy: {
    _id: string;
    name: string
  };
  unitId?: {
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
}