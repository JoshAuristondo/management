import React from "react";
import { JOB_STATUS_TONES, formatDate, formatCurrency } from "../../data/workorders.data.js";

const JOB_STATUSES = Object.keys(JOB_STATUS_TONES);

// Formulario controlado: `form` es el estado editable (vive en la página
// que lo usa), `workOrder` es el registro original ya guardado — sirve
// para mostrar los campos de solo lectura (id, created_at). Si `workOrder`
// es null/undefined (caso "Nueva orden"), esos campos simplemente no se
// muestran: todavía no existen. onFieldChange(field, value) avisa al
// padre de cada cambio; el padre decide cuándo persistir.
export default function WorkOrderDetailsForm({ workOrder, form, onFieldChange, disabled }) {
  const handleChange = (field) => (event) => {
    onFieldChange(field, event.target.value);
  };

  const handleNumberChange = (field) => (event) => {
    const raw = event.target.value;
    onFieldChange(field, raw === "" ? "" : Number(raw));
  };

  // El total se deriva de neto + iva: evita que quede desincronizado a
  // mano. Se muestra de solo lectura y se recalcula en cada cambio.
  const total = (Number(form.net_amount) || 0) + (Number(form.tax_amount) || 0);

  return (
    <div className="wod__form">

      {workOrder && (
        <div className="wod__field-group">
          <div className="wod__field wod__field--readonly">
            <span className="wod__label">ID</span>
            <span className="wod__value">#{workOrder.id}</span>
          </div>

          <div className="wod__field wod__field--readonly">
            <span className="wod__label">Creada</span>
            <span className="wod__value">{formatDate(workOrder.created_at)}</span>
          </div>
        </div>
      )}

      <div className="wod__field-group">
        <label className="wod__field">
          <span className="wod__label">Contratista</span>
          <input className="wod__input" type="text" value={form.contractor ?? ""} onChange={handleChange("contractor")} disabled={disabled} />
        </label>

        <label className="wod__field">
          <span className="wod__label">Encargado</span>
          <input className="wod__input" type="text" value={form.manager ?? ""} onChange={handleChange("manager")} disabled={disabled} />
        </label>

        <label className="wod__field">
          <span className="wod__label">Técnico</span>
          <input className="wod__input" type="text" value={form.worker ?? ""} onChange={handleChange("worker")} disabled={disabled} />
        </label>
      </div>

      <div className="wod__field-group">
        <label className="wod__field">
          <span className="wod__label">Ubicación</span>
          <input className="wod__input" type="text" value={form.location ?? ""} onChange={handleChange("location")} disabled={disabled} />
        </label>

        <label className="wod__field">
          <span className="wod__label">Estado</span>
          <select className="wod__select" value={form.job_status ?? ""} onChange={handleChange("job_status")} disabled={disabled}>
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="wod__field wod__field--toggle">
          <span className="wod__label">Facturado</span>
          <button
            type="button"
            className="wod__toggle"
            role="switch"
            aria-checked={!!form.is_invoiced}
            disabled={disabled}
            onClick={() => onFieldChange("is_invoiced", !form.is_invoiced)}
          >
            {form.is_invoiced ? "Sí" : "No"}
          </button>
        </label>
      </div>

      <label className="wod__field wod__field--full">
        <span className="wod__label">Descripción</span>
        <textarea className="wod__textarea" rows={4} value={form.description ?? ""} onChange={handleChange("description")} disabled={disabled} />
      </label>

      <div className="wod__field-group">
        <label className="wod__field">
          <span className="wod__label">N° OC</span>
          <input className="wod__input" type="text" value={form.po_number ?? ""} onChange={handleChange("po_number")} disabled={disabled} placeholder="Sin OC" />
        </label>

        <label className="wod__field">
          <span className="wod__label">Fecha OC</span>
          <input className="wod__input" type="date" value={form.po_date ?? ""} onChange={handleChange("po_date")} disabled={disabled} />
        </label>
      </div>

      <div className="wod__field-group">
        <label className="wod__field">
          <span className="wod__label">Neto</span>
          <input className="wod__input" type="number" step="1" value={form.net_amount ?? ""} onChange={handleNumberChange("net_amount")} disabled={disabled} />
        </label>

        <label className="wod__field">
          <span className="wod__label">IVA</span>
          <input className="wod__input" type="number" step="1" value={form.tax_amount ?? ""} onChange={handleNumberChange("tax_amount")} disabled={disabled} />
        </label>

        <div className="wod__field wod__field--readonly">
          <span className="wod__label">Total (Neto + IVA)</span>
          <span className="wod__value wod__value--total">{formatCurrency(total)}</span>
        </div>
      </div>

    </div>
  );
}