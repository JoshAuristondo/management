import { createColumnHelper } from "@tanstack/react-table";
import { formatCurrency, formatDate, monthKeyFromDate, yearFromDate } from "../../data/workorders.data.js";
import { SelectHeaderCell, SelectRowCell, JobStatusCell, InvoicedToggleCell, DescriptionCell, EditActionCell, } from "./workordercells.jsx";

const columnHelper = createColumnHelper();

// --- Filtros de columna reutilizables -----------------------------------

// Filtro de texto simple, case-insensitive (contractor, manager, worker…).
export const textIncludesFilter = (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    if (cellValue === null || cellValue === undefined) return false;
    return String(cellValue)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
};

// Filtro global: alimenta un único input de búsqueda en el header.
export function globalSearchFilterFn(row, _columnId, filterValue) {
    const search = String(filterValue).toLowerCase();
    const haystack = [row.original.contractor, row.original.manager, row.original.worker, row.original.location, row.original.description, row.original.job_status, row.original.po_number,]
        .filter((v) => v !== null && v !== undefined)
        .join(" ")
        .toLowerCase();
    return haystack.includes(search);
}

// --- Definición de columnas ---------------------------------------------
// onToggleInvoiced y editBasePath ya NO se reciben acá: viajan por
// `meta` al crear la tabla (ver useWorkOrdersTable.js / workorderstable.jsx)
// y las celdas los leen desde `table.options.meta`. Por eso esta función
// no necesita parámetros ni recrearse cuando cambian esos callbacks.
export function buildWorkOrderColumns() {
    return [
        // --- Columna de selección --------------------------------------------
        columnHelper.display({
            id: "select",
            size: 40,
            header: SelectHeaderCell,
            cell: SelectRowCell,
            enableSorting: false,
            enableColumnFilter: false,
        }),

        columnHelper.accessor("id", {
            header: "ID",
            size: 60,
            enableGlobalFilter: false,
        }),

        columnHelper.accessor("created_at", {
            id: "created_at",
            header: "Creada",
            cell: (info) => formatDate(info.getValue()),
            sortingFn: "datetime",
            enableGlobalFilter: false,
            // filterValue esperado: { year?: "2026", month?: "2026-07" }
            // (o undefined para no filtrar). Ambas claves son independientes:
            // se puede filtrar solo por año, solo por mes, o por ambos a la vez.
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true;
                const value = row.getValue(columnId);
                if (!value) return false;
                const { year, month } = filterValue;
                if (year && yearFromDate(value) !== year) return false;
                if (month && monthKeyFromDate(value) !== month) return false;
                return true;
            },
        }),

        columnHelper.accessor("contractor", {
            header: "Contratista",
            filterFn: textIncludesFilter,
        }),

        columnHelper.accessor("manager", {
            header: "Encargado",
            filterFn: textIncludesFilter,
        }),

        columnHelper.accessor("worker", {
            header: "Técnico",
            filterFn: textIncludesFilter,
        }),

        columnHelper.accessor("location", {
            header: "Ubicación",
            filterFn: textIncludesFilter,
        }),

        columnHelper.accessor("job_status", {
            id: "job_status",
            header: "Estado",
            // filterValue: array de estados aceptados (chips/select multiple).
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                return filterValue.includes(row.getValue(columnId));
            },
            cell: JobStatusCell,
        }),

        columnHelper.accessor("is_invoiced", {
            id: "is_invoiced",
            header: "Facturado",
            cell: InvoicedToggleCell,
            // filterValue: "all" | "invoiced" | "pending"
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue === "all") return true;
                const invoiced = row.getValue(columnId);
                return filterValue === "invoiced" ? invoiced : !invoiced;
            },
            enableGlobalFilter: false,
        }),

        columnHelper.accessor("description", {
            header: "Descripción",
            enableSorting: false,
            cell: DescriptionCell,
        }),

        columnHelper.accessor("po_number", {
            id: "po_number",
            header: "N° OC",
            cell: (info) => info.getValue() ?? "Sin OC",
            enableGlobalFilter: false,
        }),

        columnHelper.accessor("po_date", {
            id: "po_date",
            header: "Fecha OC",
            cell: (info) => formatDate(info.getValue()),
            enableGlobalFilter: false,
        }),

        columnHelper.accessor("net_amount", {
            header: "Neto",
            cell: (info) => formatCurrency(info.getValue()),
            meta: { align: "right" },
            enableGlobalFilter: false,
        }),

        columnHelper.accessor("tax_amount", {
            header: "IVA",
            cell: (info) => formatCurrency(info.getValue()),
            meta: { align: "right" },
            enableGlobalFilter: false,
        }),

        columnHelper.accessor("total_amount", {
            header: "Total",
            cell: (info) => formatCurrency(info.getValue()),
            meta: { align: "right" },
            enableGlobalFilter: false,
        }),

        // --- Columna de acciones ------------------------------------------
        columnHelper.display({
            id: "actions",
            header: "Acciones",
            size: 70,
            cell: EditActionCell,
            enableSorting: false,
            enableColumnFilter: false,
            enableGlobalFilter: false,
        }),
    ];
}