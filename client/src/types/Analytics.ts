export interface WeeklyMovementData {
    _id: {
        day: string; 
        type: 'IN' | 'OUT';
    };
    totalQty: number;
}

export interface AnalyticsAPIResponse {
    status: string;
    data: WeeklyMovementData[];
}