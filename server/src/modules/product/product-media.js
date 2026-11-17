import mongoose from "mongoose";
import sharp from "sharp";
import { z } from "zod";
import { AppError } from "../../shared/errors/index.js";
import Product from "./product.model.js";
import { imageFiles } from "../../config/mediaDb.js";

const { Schema } = mongoose;
const maxBytes = 3 * 1024 * 1024;
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const altText = z.string().trim().max(180).default("");
export const productPhotosSchema = z.array(z.union([
    z.object({ mediaId: objectId, altText }),
    z.object({ image: z.base64().max(Math.ceil(maxBytes / 3) * 4), altText }),
])).max(6).refine((photos) => {
    const ids = photos.flatMap((photo) => "mediaId" in photo ? [photo.mediaId.toLowerCase()] : []);
    return new Set(ids).size === ids.length;
}, "A photo can only appear once in a gallery");

export const MediaAsset = mongoose.model("MediaAssets", new Schema({
    storageKey: { type: Schema.Types.ObjectId, required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, ref: "Products", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
}, { timestamps: true }));

export async function prepareProductPhotos(photos) {
    const prepared = [];
    for (const photo of photos) {
        if ("mediaId" in photo) {
            prepared.push(photo);
            continue;
        }
        try {
            const input = Buffer.from(photo.image, "base64");
            if (!input.length || input.length > maxBytes) throw new Error("Invalid size");
            const image = sharp(input, { limitInputPixels: 25_000_000 });
            const metadata = await image.metadata();
            if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) throw new Error("Invalid format");
            const { data, info } = await image.autoOrient()
                .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
                .webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
            prepared.push({ data, width: info.width, height: info.height, altText: photo.altText });
        } catch {
            throw AppError.badRequest("Use a valid JPEG, PNG or WebP photo up to 3 MB and 25 megapixels");
        }
    }
    // Upload once before the primary database transaction, which may retry.
    for (const photo of prepared) {
        if (!photo.data) continue;
        const file = await imageFiles().create({ data: photo.data });
        photo.storageKey = file._id;
        photo.size = photo.data.length;
        delete photo.data;
    }
    return prepared;
}

export async function removeProductPhotos(productId, retained, session) {
    const removed = await MediaAsset.find({ productId, _id: { $nin: retained } }).select("storageKey").session(session);
    if (!removed.length) return;
    await MediaAsset.deleteMany({ _id: { $in: removed.map(({ _id }) => _id) } }, { session });
    // Remote files are collected after a grace period, once primary references are committed.
}

export async function writeProductPhotos(productId, photos, uploadedBy, session) {
    const retained = photos.flatMap((photo) => photo.mediaId ? [photo.mediaId] : []);
    const count = await MediaAsset.countDocuments({ productId, _id: { $in: retained } }).session(session);
    if (count !== retained.length) throw AppError.badRequest("One of the selected photos is no longer attached to this product");
    await removeProductPhotos(productId, retained, session);

    const gallery = [];
    for (const photo of photos) {
        let mediaId = photo.mediaId;
        if (!mediaId) {
            const [asset] = await MediaAsset.create([{
                productId, uploadedBy, storageKey: photo.storageKey, mimeType: "image/webp",
                size: photo.size, width: photo.width, height: photo.height,
            }], { session });
            mediaId = asset._id;
        }
        gallery.push({ mediaId, altText: photo.altText });
    }
    return gallery;
}

export const sendProductPhoto = (preview = false) => async (req, res) => {
    const mediaId = objectId.parse(req.params.mediaId);
    const asset = await MediaAsset.findById(mediaId);
    if (!asset || (!preview && !await Product.exists({ _id: asset.productId, isActive: true, sellingPrice: { $gt: 0 }, "photos.mediaId": mediaId }))) {
        throw AppError.notFound("Product photo not found");
    }
    const file = await imageFiles().findById(asset.storageKey);
    if (!file) throw AppError.notFound("Product photo not found");
    res.set({ "Cache-Control": preview ? "private, no-store" : "public, max-age=300", "X-Content-Type-Options": "nosniff" });
    res.type(asset.mimeType).send(file.data);
};
