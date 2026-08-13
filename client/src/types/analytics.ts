export interface WeeklyMovementData {
    _id: {
        day: string;
        type: 'IN' | 'OUT';
    };
    totalQty: number;
}
