// Datos de ejemplo

export const mockWorkOrders = [
    {
        id: 1,
        created_at: "2026-07-20T08:30:00Z",
        contractor: "Hites",
        manager: "Cristian Marilao",
        worker: "Juan Pérez",
        location: "Alameda",
        is_invoiced: true,
        job_status: "Terminado",
        description: "Mantenimiento preventivo de sistema eléctrico principal.",
        po_number: 174187,
        po_date: "2026-07-15",
        net_amount: 90000.0,
        tax_amount: 17100.0,
        total_amount: 107100.0,
    },
    {
        id: 2,
        created_at: "2026-07-22T10:15:00Z",
        contractor: "Falabella",
        manager: "Ana Gómez",
        worker: "Pedro Soto",
        location: "Puente Alto",
        is_invoiced: false,
        job_status: "En proceso",
        description:
            "Reparación de filtración de agua en bodega central. Esperando repuestos.",
        po_number: 174188,
        po_date: "2026-07-21",
        net_amount: 80000.0,
        tax_amount: 15200.0,
        total_amount: 95200.0,
    },
    {
        id: 3,
        created_at: "2026-07-25T14:00:00Z",
        contractor: "Hites",
        manager: "Cristian Marilao",
        worker: "Luis Rojas",
        location: "Rancagua",
        is_invoiced: false,
        job_status: "Terminado",
        description: "Instalación de nuevos equipos de climatización.",
        po_number: 174190,
        po_date: "2026-07-23",
        net_amount: 216500.0,
        tax_amount: 41135.0,
        total_amount: 257635.0,
    },
    {
        id: 4,
        created_at: "2026-07-28T09:00:00Z",
        contractor: "Particular",
        manager: "Cliente Directo",
        worker: "Juan Pérez",
        location: "Estación Central",
        is_invoiced: false,
        job_status: "Pendiente",
        description: "Visita técnica por emergencia eléctrica. Presupuesto por definir.",
        po_number: null,
        po_date: null,
        net_amount: 0.0,
        tax_amount: 0.0,
        total_amount: 0.0,
    },
    {
        id: 5,
        created_at: "2026-07-10T16:45:00Z",
        contractor: "Ripley",
        manager: "Carlos Vega",
        worker: "Pedro Soto",
        location: "Ahumada",
        is_invoiced: false,
        job_status: "Cancelado",
        description: "El cliente canceló la visita antes de la llegada del técnico.",
        po_number: 174150,
        po_date: "2026-07-09",
        net_amount: 0.0,
        tax_amount: 0.0,
        total_amount: 0.0,
    },
    {
        id: 6,
        created_at: "2026-06-18T11:20:00Z",
        contractor: "Falabella",
        manager: "Ana Gómez",
        worker: "Luis Rojas",
        location: "Providencia",
        is_invoiced: true,
        job_status: "Terminado",
        description: "Revisión periódica de extintores y sistema contra incendios.",
        po_number: 174120,
        po_date: "2026-06-15",
        net_amount: 45000.0,
        tax_amount: 8550.0,
        total_amount: 53550.0,
    },
    {
        id: 7,
        created_at: "2026-06-18T11:20:00Z",
        contractor: "Falabella",
        manager: "Ana Gómez",
        worker: "Luis Rojas",
        location: "Providencia",
        is_invoiced: true,
        job_status: "Terminado",
        description: "Revisión periódica de extintores y sistema contra incendios.",
        po_number: 174120,
        po_date: "2026-08-15",
        net_amount: 45000.0,
        tax_amount: 8550.0,
        total_amount: 53550.0,
    },
    {
        id: 8,
        created_at: "2025-07-20T08:30:00Z",
        contractor: "Hites",
        manager: "Cristian Marilao",
        worker: "Juan Pérez",
        location: "Alameda",
        is_invoiced: true,
        job_status: "Terminado",
        description: "Mantenimiento preventivo de sistema eléctrico principal.",
        po_number: 174187,
        po_date: "2026-07-15",
        net_amount: 90000.0,
        tax_amount: 17100.0,
        total_amount: 107100.0,
    },
];


// Mapa de estado -> tono visual, separado del componente para poder reutilizarlo en otras vistas (tarjetas, notificaciones, etc.)
export const JOB_STATUS_TONES = {
    Terminado: "success",
    "En proceso": "info",
    Pendiente: "warning",
    Cancelado: "neutral",
};


/// Formato

const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const monthLabelFormatter = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
});

// Usado cuando ya hay un año seleccionado en el filtro: no hace falta
// repetirlo en cada opción del <select> de mes.
const monthOnlyLabelFormatter = new Intl.DateTimeFormat("es-CL", {
    month: "long",
});


export function formatCurrency(value) {
    if (value === null || value === undefined) return "—";
    return currencyFormatter.format(value);
}

export function formatDate(value) {
    if (!value) return "—";
    return dateFormatter.format(new Date(value));
}

// Fecha ISO -> "2026-07" (clave usada por el filtro de mes).
export function monthKeyFromDate(value) {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Fecha ISO -> "2026" (clave usada por el filtro de año).
export function yearFromDate(value) {
    const date = new Date(value);
    return String(date.getFullYear());
}

// "2026-07" -> "Julio 2026" (o solo "Julio" si includeYear es false).
// includeYear se pone en false cuando el filtro de año ya está fijado,
// para no repetir el año en cada opción del <select> de mes.
export function monthLabelFromKey(key, { includeYear = true } = {}) {
    const [year, month] = key.split("-").map(Number);
    const formatter = includeYear ? monthLabelFormatter : monthOnlyLabelFormatter;
    const label = formatter.format(new Date(year, month - 1, 1));
    return label.charAt(0).toUpperCase() + label.slice(1);
}