import type { PaginationMetadata } from "./pagination";

export interface ActivityLogData {
    _id: string;
    performedBy: {
        _id: string;
        name: string;
        role: string;
    };
    actorRole?: string;
    statusCode?: number;
    requestId?: string;
    sourceIp?: string;
    protocol?: string;
    httpVersion?: string;
    userAgent?: string;
    durationMs?: number;
    action: string;
    type: string;
    message: string;
    createdAt: string;
}

export interface ActivityAPIResponse {
    status: string;
    data: ActivityLogData[];
    meta: PaginationMetadata;
}
