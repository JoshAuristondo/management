import { useState, useCallback } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { globalSearchFilterFn } from "./workOrders.columns.js";


export function useWorkOrdersTable({
    data,
    columns,
    state: controlledState,
    onStateChange,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    rowCount,
    getRowId = (row) => String(row.id),
    meta,
} = {}) {
    const [internalSorting, setInternalSorting] = useState([
        { id: "created_at", desc: true },
    ]);
    const [internalColumnFilters, setInternalColumnFilters] = useState([]);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
    const [internalPagination, setInternalPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [internalColumnVisibility, setInternalColumnVisibility] = useState({});
    const [internalRowSelection, setInternalRowSelection] = useState({});

    const state = controlledState ?? {
        sorting: internalSorting,
        columnFilters: internalColumnFilters,
        globalFilter: internalGlobalFilter,
        pagination: internalPagination,
        columnVisibility: internalColumnVisibility,
        rowSelection: internalRowSelection,
    };

    const makeHandler = useCallback(
        (key, setInternal) => (updater) => {
            const prev = state[key];
            const next = typeof updater === "function" ? updater(prev) : updater;
            if (onStateChange) {
                onStateChange(key, next);
            } else {
                setInternal(next);
            }
        },
        [state, onStateChange]
    );

    const table = useReactTable({
        data,
        columns,
        state,
        getRowId,
        // Datos que las celdas necesitan pero que no son parte del estado de
        // la tabla (callbacks, config) — se leen como table.options.meta.
        meta,

        // --- Ordenación --------------------------------------------------
        onSortingChange: makeHandler("sorting", setInternalSorting),
        manualSorting,
        getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),

        // --- Filtrado (por columna + global) ------------------------------
        onColumnFiltersChange: makeHandler("columnFilters", setInternalColumnFilters),
        onGlobalFilterChange: makeHandler("globalFilter", setInternalGlobalFilter),
        globalFilterFn: globalSearchFilterFn,
        manualFiltering,
        getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),

        // --- Paginación ----------------------------------------------------
        onPaginationChange: makeHandler("pagination", setInternalPagination),
        manualPagination,
        getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
        rowCount: manualPagination ? rowCount : undefined,

        // --- Visibilidad de columnas ----------------------------------------
        onColumnVisibilityChange: makeHandler(
            "columnVisibility",
            setInternalColumnVisibility
        ),

        // --- Selección de filas ----------------------------------------------
        enableRowSelection: true,
        onRowSelectionChange: makeHandler("rowSelection", setInternalRowSelection),

        getCoreRowModel: getCoreRowModel(),
        debugTable: false,
    });

    return table;
}