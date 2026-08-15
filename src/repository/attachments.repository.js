import { supabase } from "../lib/supabaseClient.js";

const TABLE = "attachments";
const BUCKET = "attachments";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hora

async function attachSignedUrls(rows) 
{
    if (rows.length === 0) return [];

    const paths = rows.map((row) => row.storage_path);
    const { data: signed, error } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    if (error) throw error;

    return rows.map((row, index) => ({
        ...row,
        url: signed[index]?.signedUrl ?? null,
    }));
}

export async function listAttachmentsByWorkOrder(workOrderId) {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("work_order_id", workOrderId)
        .order("uploaded_at", { ascending: true });

    if (error) throw error;
    return attachSignedUrls(data);
}

export async function addAttachment(workOrderId, file) {
    // Prefijo por work_order_id: además de evitar choques de nombre, deja
    // los archivos de cada orden agrupados dentro del bucket.
    const storagePath = `${workOrderId}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase
        .storage
        .from(BUCKET)
        .upload(storagePath, file, {
            contentType: file.type || "application/octet-stream",
        });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            work_order_id: workOrderId,
            file_name: file.name,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            storage_path: storagePath,
        })
        .select()
        .single();

    if (error) {
        // Si falla la fila en la tabla, no dejamos el archivo huérfano en
        // Storage (ya se subió, pero nadie va a saber que existe).
        await supabase.storage.from(BUCKET).remove([storagePath]);
        throw error;
    }

    const [withUrl] = await attachSignedUrls([data]);
    return withUrl;
}

export async function removeAttachment(attachmentId) {
    const { data: row, error: fetchError } = await supabase
        .from(TABLE)
        .select("storage_path")
        .eq("id", attachmentId)
        .single();

    if (fetchError) throw fetchError;

    const { error: storageError } = await supabase
        .storage
        .from(BUCKET)
        .remove([row.storage_path]);

    if (storageError) throw storageError;

    const { error } = await supabase.from(TABLE).delete().eq("id", attachmentId);
    if (error) throw error;
}