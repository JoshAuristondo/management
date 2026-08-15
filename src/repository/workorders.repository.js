import { supabase } from "../lib/supabaseClient.js";


const TABLE = "work_orders";

function normalizePatch(patch) {
	const { total_amount, ...rest } = patch;

	if (rest.po_number === "" || rest.po_number === undefined) {
		rest.po_number = null;
	} else if (rest.po_number !== null) {
		rest.po_number = Number(rest.po_number);
	}

	if (rest.po_date === "" || rest.po_date === undefined) {
		rest.po_date = null;
	}

	if (rest.net_amount === "" || rest.net_amount === undefined) {
		rest.net_amount = 0;
	}

	if (rest.tax_amount === "" || rest.tax_amount === undefined) {
		rest.tax_amount = 0;
	}

	return rest;
}

export async function listWorkOrders() {
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getWorkOrderById(id) {
	const { data, error } = await supabase
		.from(TABLE)
		.select("*")
		.eq("id", id)
		.maybeSingle(); // null si no existe, en vez de tirar error

	if (error) throw error;
	return data;
}

export async function updateWorkOrder(id, patch) {

	// Se normaliza el patch primero
	const normalized = normalizePatch(patch);
	
	// Se extrae el id para excluirlo del cuerpo de la actualización
	const { id: _, ...updateData } = normalized;


	const { data, error } = await supabase
		.from(TABLE)
		.update(updateData) // Enviamos solo los campos permitidos
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function createWorkOrder(patch) {
	const { data, error } = await supabase
		.from(TABLE)
		.insert(normalizePatch(patch))
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteWorkOrder(id) {

	const { data: attachmentRows, error: attachmentsError } = await supabase
		.from("attachments")
		.select("storage_path")
		.eq("work_order_id", id);

	if (attachmentsError) throw attachmentsError;

	if (attachmentRows?.length) {
		const paths = attachmentRows.map((row) => row.storage_path);
		const { error: storageError } = await supabase.storage.from("attachments").remove(paths);
		if (storageError) throw storageError;
	}

	const { error } = await supabase.from(TABLE).delete().eq("id", id);
	if (error) throw error;
}