import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { imageFiles } from "../../config/mediaDb.js";
import { MediaAsset } from "./product-media.js";

const retentionMs = 24 * 60 * 60 * 1000;
const checksum = (data) => createHash("sha256").update(data).digest("hex");

export async function migrateImageFiles() {
    const legacyFiles = mongoose.connection.collection("mediafiles");
    for await (const file of legacyFiles.find({})) {
        const bytes = Buffer.from(file.data.buffer);
        const files = imageFiles();
        await files.updateOne({ _id: file._id }, {
            $setOnInsert: { data: bytes, createdAt: new Date() },
        }, { upsert: true });
        const saved = await files.findById(file._id).lean();
        if (!saved || checksum(saved.data.buffer) !== checksum(bytes)) {
            throw new Error("An image could not be verified in the media database. Migration stopped.");
        }
        await legacyFiles.deleteOne({ _id: file._id });
    }
}

export async function cleanUnusedImageFiles() {
    const files = imageFiles();
    const cutoff = new Date(Date.now() - retentionMs);
    for await (const file of files.find({ createdAt: { $lt: cutoff } }).select("_id").cursor()) {
        if (!await MediaAsset.exists({ storageKey: file._id })) {
            await files.deleteOne({ _id: file._id, createdAt: { $lt: cutoff } });
        }
    }
}
