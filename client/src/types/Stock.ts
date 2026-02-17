export type StockMovementData = {
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
  quantity: number;
  movementType: 'IN' | 'OUT';
  oldQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
};

export interface StockMovementAPIResponse {
  status: string;
  data: StockMovementData[] | null;
}