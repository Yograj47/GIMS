import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    data: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now, immutable: true },
}, { versionKey: false });
fileSchema.index({ createdAt: 1, _id: 1 });

let mediaConnection;
let mediaFile;

export async function connectMediaDB() {
    if (mediaConnection?.readyState === 1) return;
    if (!process.env.MEDIA_MONGO_URI) throw new Error("MEDIA_MONGO_URI is required for product image storage");
    const connection = mongoose.createConnection(process.env.MEDIA_MONGO_URI, {
        dbName: process.env.MEDIA_DB_NAME || "gims_media",
        serverSelectionTimeoutMS: 15_000,
        maxPoolSize: 5,
        autoIndex: false,
    });
    try {
        await connection.asPromise();
        const model = connection.model("MediaFiles", fileSchema);
        await model.createIndexes();
        mediaConnection = connection;
        mediaFile = model;
    } catch {
        await connection.close().catch(() => {});
        throw new Error("Could not connect to the media database. Check MEDIA_MONGO_URI, database access and Atlas network access.");
    }
}

export function imageFiles() {
    if (!mediaFile || mediaConnection?.readyState !== 1) {
        throw new Error("The media database is unavailable");
    }
    return mediaFile;
}
