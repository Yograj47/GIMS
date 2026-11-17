import { z } from "zod";

export const deliveryAddressFields = {
    province: z.enum(["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"]),
    district: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(500),
};

export function validContactPhone(phone) {
    return /^\d{7,15}$/.test(phone?.replace(/[\s()+.-]/g, "") ?? "");
}
