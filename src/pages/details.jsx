import React, { useCallback, useEffect, useState } from "react";
import { useSearch, useLocation, Link } from "wouter";
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from "../repository/workorders.repository.js";
import { listAttachmentsByWorkOrder, addAttachment, removeAttachment } from "../repository/attachments.repository.js";
import WorkOrderDetailsForm from "../components/dashboard/workorderdetailsform.jsx";
import WorkOrderAttachments from "../components/dashboard/workorderattachments.jsx";

import "../styles/details.scss";

export default function Details() {
    // useSearch() de wouter devuelve el query string sin el "?" (ej: "id=3")
    const search = useSearch();
    const id = new URLSearchParams(search).get("id");
    const [, navigate] = useLocation();

    const [workOrder, setWorkOrder] = useState(null);
    const [form, setForm] = useState({});
    const [attachments, setAttachments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [error, setError] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);

    // ¿Hay cambios sin guardar? Comparamos el form contra el último dato
    // confirmado (workOrder), campo por campo.
    const isDirty = workOrder
        ? Object.keys(form).some((key) => form[key] !== workOrder[key])
        : false;

    const loadData = useCallback(async () => {
        if (!id) {
            setLoading(false);
            setNotFound(true);
            return;
        }
        setLoading(true);
        setNotFound(false);
        setError(null);
        try {
            const [wo, attachmentsList] = await Promise.all([
                getWorkOrderById(id),
                listAttachmentsByWorkOrder(id),
            ]);
            if (!wo) {
                setNotFound(true);
            } else {
                setWorkOrder(wo);
                setForm(wo);
                setAttachments(attachmentsList);
            }
        } catch (err) {
            setError(err.message ?? "Ocurrió un error al cargar la orden de trabajo.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaveMessage(null);
    };

    const handleDiscard = () => {
        setForm(workOrder);
        setSaveMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaveMessage(null);
        try {
            // El total siempre se recalcula acá, nunca se confía en lo que
            // haya quedado en el form (el input de total ni siquiera existe).
            const total_amount = (Number(form.net_amount) || 0) + (Number(form.tax_amount) || 0);
            const updated = await updateWorkOrder(id, { ...form, total_amount });
            setWorkOrder(updated);
            setForm(updated);
            setSaveMessage("Cambios guardados.");
        } catch (err) {
            setError(err.message ?? "No se pudo guardar la orden de trabajo.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (file) => {
        setUploading(true);
        setError(null);
        try {
            const attachment = await addAttachment(id, file);
            setAttachments((prev) => [...prev, attachment]);
        } catch (err) {
            setError(err.message ?? "No se pudo subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        setError(null);
        try {
            await removeAttachment(attachmentId);
            setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
        } catch (err) {
            setError(err.message ?? "No se pudo eliminar el adjunto.");
        }
    };

    const handleDeleteWorkOrder = async () => {
        if (!confirmingDelete) {
            setConfirmingDelete(true);
            return;
        }
        setDeleting(true);
        setError(null);
        try {
            await deleteWorkOrder(id);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message ?? "No se pudo eliminar la orden de trabajo.");
            setDeleting(false);
            setConfirmingDelete(false);
        }
    };

    return (
        <div className="wod">

            <div className="wod__topbar">
                <Link href="/dashboard" className="wod__back">← Volver al dashboard</Link>
                {workOrder && <span className="wod__title">Orden de trabajo #{workOrder.id}</span>}
            </div>
            
            <div className="wod__content">

                {loading && <div className="wod__state wod__state--loading">Cargando…</div>}

                {!loading && notFound && (
                    <div className="wod__state wod__state--error">
                        No se encontró ninguna orden de trabajo con ese id.
                    </div>
                )}

                {!loading && !notFound && workOrder && (
                    <>
                        {error && <div className="wod__banner wod__banner--error">{error}</div>}
                        {saveMessage && <div className="wod__banner wod__banner--success">{saveMessage}</div>}

                        <WorkOrderDetailsForm
                            workOrder={workOrder}
                            form={form}
                            onFieldChange={handleFieldChange}
                            disabled={saving}
                        />

                        <div className="wod__actions">
                            <button type="button" className="wod__button wod__button--save" onClick={handleSave} disabled={!isDirty || saving}>
                                {saving ? "Guardando…" : "Guardar cambios"}
                            </button>
                            <button type="button" className="wod__button wod__button--cancel" onClick={handleDiscard} disabled={!isDirty || saving}>
                                Descartar cambios
                            </button>
                        </div>

                        <span className="wod__section-divider"></span>

                        <WorkOrderAttachments
                            attachments={attachments}
                            onUpload={handleUpload}
                            onDelete={handleDeleteAttachment}
                            uploading={uploading}
                            disabled={saving}
                        />

                        <span className="wod__section-divider"></span>

                        <div className="wod__danger-zone">
                            <span className="wod__danger-zone-text">
                                Eliminar esta orden de trabajo también borra sus adjuntos. Esta acción no se puede deshacer.
                            </span>
                            <button
                                type="button"
                                className={`wod__button wod__button--delete ${confirmingDelete ? "wod__button--delete-confirm" : ""}`}
                                onClick={handleDeleteWorkOrder}
                                disabled={deleting}
                            >
                                {deleting ? "Eliminando…" : confirmingDelete ? "¿Confirmar eliminación?" : "Eliminar orden de trabajo"}
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}