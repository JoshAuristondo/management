import React from "react";
import { JOB_STATUS_TONES } from "../../data/workorders.data.js";
import WorkOrderEditButton from "./workordereditbutton.jsx";

// Este archivo exporta SOLO componentes (nada de funciones "utilitarias"
// sueltas), a propósito: es el requisito de vite-plugin-react para que el
// Fast Refresh pueda recargar en caliente sin perder el estado del árbol.
// La lógica de columnas/filtros (no-componentes) vive en workOrders.columns.js.

export function IndeterminateCheckbox({ indeterminate, checked, disabled, onChange, ariaLabel }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
    />
  );
}

export function StatusBadge({ status, tone = "neutral" }) {
  return <span className={`wo-badge wo-badge--${tone}`}>{status}</span>;
}

// --- Celdas de tabla ------------------------------------------------------
// Cada una recibe directamente el "cell context" / "header context" de
// TanStack Table como props (row, table, getValue, ...), así que se pueden
// pasar tal cual a columnHelper como `header:`/`cell:` sin envolverlas en
// una arrow function con JSX (eso es lo que obligaba a mezclar JSX con
// exports no-componente en el archivo de columnas).

export function SelectHeaderCell({ table }) {
  return (
    <IndeterminateCheckbox
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
      ariaLabel="Seleccionar todas las filas"
    />
  );
}

export function SelectRowCell({ row }) {
  return (
    <IndeterminateCheckbox
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      indeterminate={row.getIsSomeSelected?.() ?? false}
      onChange={row.getToggleSelectedHandler()}
      ariaLabel={`Seleccionar orden #${row.original.id}`}
    />
  );
}

export function JobStatusCell({ getValue }) {
  const status = getValue();
  return <StatusBadge status={status} tone={JOB_STATUS_TONES[status]} />;
}

// El callback onToggleInvoiced viaja por `table.options.meta`, no por un
// closure armado al construir las columnas (ver useWorkOrdersTable.js).
export function InvoicedToggleCell({ row, getValue, table }) {
  const { onToggleInvoiced } = table.options.meta ?? {};
  const invoiced = getValue();
  return (
    <button
      type="button"
      className="wo-toggle"
      role="switch"
      aria-checked={invoiced}
      onClick={() => onToggleInvoiced?.(row.original.id, !invoiced)}
    >
      {invoiced ? "Sí" : "No"}
    </button>
  );
}

export function DescriptionCell({ getValue }) {
  const value = getValue();
  return (
    <span className="wo-truncate" title={value}>
      {value}
    </span>
  );
}

// editBasePath también viaja por `table.options.meta`.
export function EditActionCell({ row, table }) {
    const { editBasePath } = table.options.meta ?? {};
    return <WorkOrderEditButton id={row.original.id} basePath={editBasePath} />;
}