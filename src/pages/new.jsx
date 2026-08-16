import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { createWorkOrder } from "../repository/workorders.repository.js";
import WorkOrderDetailsForm from "../components/dashboard/workorderdetailsform.jsx";

import "../styles/details.scss";

const EMPTY_FORM = {
    contractor: "",
    manager: "",
    worker: "",
    location: "",
    is_invoiced: false,
    job_status: "Pendiente",
    description: "",
    po_number: "",
    po_date: "",
    net_amount: "",
    tax_amount: "",
};

// Requisitos mínimos para poder crear: sin esto, el botón "Crear" queda
// deshabilitado. Ajustá esta lista si tu negocio exige otros campos.
const REQUIRED_FIELDS = ["contractor", "manager", "worker", "location"];

export default function New() {
    const [, navigate] = useLocation();

    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const isValid = REQUIRED_FIELDS.every((field) => String(form[field] ?? "").trim() !== "");

    const handleCreate = async () => {
        if (!isValid) return;
        setSaving(true);
        setError(null);
        try {
            const total_amount = (Number(form.net_amount) || 0) + (Number(form.tax_amount) || 0);
            const created = await createWorkOrder({ ...form, total_amount });
            // Los adjuntos se agregan en Detalles: ahí ya existe un id real al
            // que referenciarlos.
            navigate(`/details?id=${created.id}`);
        } catch (err) {
            setError(err.message ?? "No se pudo crear la orden de trabajo.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="wod">
            <div className="wod__content">

                <div className="wod__topbar">
                    <Link href="/dashboard" className="wod__back">← Volver a Tablas</Link>
                    <span className="wod__title">Nueva orden de trabajo</span>
                </div>

                {error && <div className="wod__banner wod__banner--error">{error}</div>}

                <WorkOrderDetailsForm
                    workOrder={null}
                    form={form}
                    onFieldChange={handleFieldChange}
                    disabled={saving}
                />

                <div className="wod__actions">
                    <button type="button" className="wod__button wod__button--save" onClick={handleCreate} disabled={!isValid || saving}>
                        {saving ? "Creando…" : "Crear orden de trabajo"}
                    </button>
                    <Link href="/dashboard" className="wod__button wod__button--cancel">
                        Cancelar
                    </Link>
                </div>

                <div className="wod__state">
                    Los adjuntos se agregan después de crear la orden, desde la pantalla de Detalles.
                </div>

            </div>
        </div>
    );
}