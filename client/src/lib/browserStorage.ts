type StorageKind = "local" | "session";

export function readStorage(kind: StorageKind, key: string) {
    try { return (kind === "local" ? window.localStorage : window.sessionStorage).getItem(key); }
    catch { return null; }
}

export function writeStorage(kind: StorageKind, key: string, value: string | null) {
    try {
        const storage = kind === "local" ? window.localStorage : window.sessionStorage;
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
        return true;
    } catch {
        // The current page remains usable when browser storage is unavailable.
        return false;
    }
}
