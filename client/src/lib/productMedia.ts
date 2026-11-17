import api from "./api";

export function productMediaUrl(mediaId: string, preview = false) {
    return api.getUri({ url: `/products/media/${encodeURIComponent(mediaId)}${preview ? "/preview" : ""}` });
}
