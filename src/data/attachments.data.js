export function formatFileSize(bytes) 
{
    if (bytes === null || bytes === undefined) return "—";
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function isImageAttachment(fileType) 
{
    return typeof fileType === "string" && fileType.startsWith("image/");
}

export function isPdfAttachment(fileType) 
{
    return fileType === "application/pdf";
}