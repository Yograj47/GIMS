import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productMediaUrl } from "@/lib/productMedia";
import type { ProductPhotoDraft } from "@/types/product";

function PhotoPreview({ photo }: { photo: ProductPhotoDraft }) {
    const file = "file" in photo ? photo.file : undefined;
    const image = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (!file || !image.current) return;
        const url = URL.createObjectURL(file);
        image.current.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);
    const src = "mediaId" in photo ? productMediaUrl(photo.mediaId, true) : undefined;
    return <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        <img ref={image} src={src} alt="" className="size-full object-cover" />
    </div>;
}

export default function ProductPhotosField({ photos, onChange }: {
    photos: ProductPhotoDraft[];
    onChange: (photos: ProductPhotoDraft[]) => void;
}) {
    const pickerId = useId();
    const [error, setError] = useState("");

    function add(files: FileList | null) {
        if (!files?.length) return;
        const selected = Array.from(files);
        if (photos.length + selected.length > 6) {
            setError("Choose up to six photos in total.");
            return;
        }
        if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 3 * 1024 * 1024)) {
            setError("Choose JPEG, PNG or WebP images up to 3 MB each.");
            return;
        }
        setError("");
        onChange([...photos, ...selected.map((file) => ({ file, altText: "" }))]);
    }

    function move(index: number, direction: number) {
        const next = [...photos];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        onChange(next);
    }

    return (
        <div className="space-y-3">
            <p id={`${pickerId}-hint`} className="text-sm text-muted-foreground">Add up to six JPEG, PNG or WebP photos, 3 MB each. The first photo is the storefront cover.</p>
            <div className="flex items-center gap-3">
                <ImagePlus aria-hidden="true" className="size-5 shrink-0 text-link" />
                <Input id={pickerId} aria-label="Choose product photos" aria-describedby={`${pickerId}-hint`} type="file" multiple
                    accept="image/jpeg,image/png,image/webp" disabled={photos.length >= 6}
                    onChange={(event) => { add(event.currentTarget.files); event.currentTarget.value = ""; }} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {photos.length > 0 && <ol className="divide-y divide-border rounded-lg border border-border bg-card">
                {photos.map((photo, index) => (
                    <li key={"mediaId" in photo ? photo.mediaId : `${photo.file.name}-${index}`} className="flex flex-wrap items-center gap-3 p-3">
                        <PhotoPreview photo={photo} />
                        <label className="grid min-w-36 flex-1 gap-1 text-xs font-medium">
                            {index === 0 ? "Cover photo alt text" : `Photo ${index + 1} alt text`}
                            <Input maxLength={180} value={photo.altText} placeholder="Describe the photo"
                                onChange={(event) => onChange(photos.map((entry, position) => position === index ? { ...entry, altText: event.target.value } : entry))} />
                        </label>
                        <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move photo ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move photo ${index + 1} down`} disabled={index === photos.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove photo ${index + 1}`} onClick={() => { setError(""); onChange(photos.filter((_, position) => position !== index)); }}><X /></Button>
                        </div>
                    </li>
                ))}
            </ol>}
        </div>
    );
}
