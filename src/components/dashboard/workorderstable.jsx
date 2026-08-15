import React, { useState, useMemo, useEffect, useRef } from "react";
import { flexRender } from "@tanstack/react-table";
import { useWorkOrdersTable } from "./useworkorderstable.js";
import { buildWorkOrderColumns } from "./workorders.columns.js";
import { mockWorkOrders, monthKeyFromDate, monthLabelFromKey, yearFromDate, JOB_STATUS_TONES, } from "../../data/workorders.data.js";

import { Link } from "wouter";

import Dropdown  from "../dropdown/dropdown.jsx";

import { IoIosAdd } from "react-icons/io";
import { CiExport, CiFilter, CiSearch } from "react-icons/ci";
import { VscSettings } from "react-icons/vsc";
import { FaRegFilePdf, FaRegFileExcel, FaRegFileCode, FaRegEye, FaRegEyeSlash, FaChevronDown, FaChevronUp, FaFilePdf } from "react-icons/fa";
import { MdGroupWork } from "react-icons/md";

import "../../styles/workorderstable.scss";


//Export

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "../../data/workorders.data.js";


export default function WorkOrdersTable({
    data = mockWorkOrders,
    onToggleInvoiced,
    // Ruta base a la que apunta el botón "Editar" de cada fila.
    // Se navega a `${editBasePath}?id=<id>`.
    editBasePath,
    // Props para futura integración con Fetch / Backend:
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    rowCount,
    onStateChange,
}) {

    const columns = useMemo(() => buildWorkOrderColumns(), []);

    // 2. Inicializamos la tabla con el Custom Hook
    const table = useWorkOrdersTable({ data, columns, manualPagination, manualSorting, manualFiltering, rowCount, onStateChange, meta: { onToggleInvoiced, editBasePath }, });

    // 3. Extraemos dinámicamente los años disponibles según los datos
    const availableYears = useMemo(() => {
        const years = new Set();
        data.forEach((row) => {
            if (row.created_at) years.add(yearFromDate(row.created_at));
        });
        return Array.from(years).sort().reverse();
    }, [data]);

    // Lista de estados disponibles según tu configuración
    const availableStatuses = Object.keys(JOB_STATUS_TONES);

    // --- Handlers para Filtros de Columna Específicos ---

    // Filtro de Año + Mes (Columna 'created_at')
    // El filterValue de esta columna es un objeto { year?, month? }.
    const currentDateFilter = table.getColumn("created_at")?.getFilterValue() ?? {};
    const currentYearFilter = currentDateFilter.year ?? "";
    const currentMonthFilter = currentDateFilter.month ?? "";

    // Meses disponibles: si hay un año seleccionado, solo se muestran los
    // meses con datos dentro de ese año.
    const availableMonths = useMemo(() => {
        const months = new Set();
        data.forEach((row) => {
            if (!row.created_at) return;
            if (currentYearFilter && yearFromDate(row.created_at) !== currentYearFilter) return;
            months.add(monthKeyFromDate(row.created_at));
        });
        return Array.from(months).sort().reverse();
    }, [data, currentYearFilter]);

    const handleYearFilterChange = (e) => {
        const year = e.target.value;
        // Al cambiar de año se resetea el mes: las opciones de mes cambian y
        // un mes de otro año dejaría de ser válido.
        table.getColumn("created_at")?.setFilterValue(year ? { year } : undefined);
    };

    const handleMonthFilterChange = (e) => {
        const month = e.target.value;
        const nextFilter = {
            ...(currentYearFilter ? { year: currentYearFilter } : {}),
            ...(month ? { month } : {}),
        };
        table
            .getColumn("created_at")
            ?.setFilterValue(Object.keys(nextFilter).length > 0 ? nextFilter : undefined);
    };

    // Filtro Facturado (Columna 'is_invoiced')
    const currentInvoicedFilter =
        table.getColumn("is_invoiced")?.getFilterValue() ?? "all";

    const handleInvoicedFilterChange = (e) => {
        const val = e.target.value;
        table.getColumn("is_invoiced")?.setFilterValue(val);
    };

    // Filtro Estado de Trabajo (Columna 'job_status')
    const currentStatusFilter = table.getColumn("job_status")?.getFilterValue() ?? [];

    const handleStatusFilterToggle = (status) => {
        const current = Array.isArray(currentStatusFilter) ? currentStatusFilter : [];
        const next = current.includes(status)
            ? current.filter((s) => s !== status)
            : [...current, status];
        table.getColumn("job_status")?.setFilterValue(next.length > 0 ? next : undefined);
    };


    // --- Lógica de Exportación ---
    const handleExport = (format) => {
        // 1. Obtener las filas seleccionadas. Si no hay ninguna, usamos todas las filtradas.
        let targetRows = table.getSelectedRowModel().rows;
        if (targetRows.length === 0) {
            targetRows = table.getFilteredRowModel().rows;
        }

        if (targetRows.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        // 2. Mapear los datos al formato que queremos en el archivo
        const dataToExport = targetRows.map((row) => ({
            "ID": row.original.id,
            "Creada": formatDate(row.original.created_at),
            "Contratista": row.original.contractor,
            "Encargado": row.original.manager,
            "Técnico": row.original.worker,
            "Ubicación": row.original.location,
            "Estado": row.original.job_status,
            "Facturado": row.original.is_invoiced ? "Sí" : "No",
            "N° OC": row.original.po_number || "Sin OC",
            "Neto": row.original.net_amount,
            "IVA": row.original.tax_amount,
            "Total": row.original.total_amount,
        }));

        // 3. Ejecutar la exportación según el formato solicitado
        if (format === "csv") {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // \uFEFF para soporte UTF-8 en Excel
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "ordenes_de_trabajo.csv";
            link.click();
        }
        else if (format === "excel") {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");
            XLSX.writeFile(workbook, "ordenes_de_trabajo.xlsx");

        } else if (format === "pdf") {
            // Inicializamos el documento en horizontal (landscape)
            const doc = new jsPDF("landscape");

            // Título del PDF
            doc.text("Reporte de Órdenes de Trabajo", 14, 15);

            // Extraemos las cabeceras (keys) y las filas (values)
            const tableColumn = Object.keys(dataToExport[0]);
            const tableRows = dataToExport.map(obj => Object.values(obj));

            // Usamos autoTable como función externa pasándole el doc
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] },
            });

            // Descargamos el archivo
            doc.save("ordenes_de_trabajo.pdf");
        }

        setIsExportOpen(false); // Cierra el menú al terminar
    };


    return (

        <div className="wo">
            
            <div className="wo__header">
                <h1 className="wo__text wo__text--header">Órdenes de Trabajo</h1>
                <h2 className="wo__text wo__text--subtitle">Consulta, gestiona y da seguimiento a todas las ordenes de trabajo.</h2>
            </div>

            <div className="wo__section wo__section--upper">
                
                <label className="wo__search">
                    <CiSearch className="wo__text" />
                    <input id="search-input" type="text" className="wo__input wo__text wo__text--search" placeholder="Buscar en todas las columnas" value={table.getState().globalFilter ?? ""} onChange={(e) => table.setGlobalFilter(e.target.value)} />
                </label>


                <div className="wo__actions">

                    <Dropdown icon={<CiExport/>} buttonText="Exportar como" content=
                    {
                        <>
                            <button type="button" onClick={() => handleExport("pdf")} className="wo__text wo__text--drop wo__button wo__button--drop">
                                <FaRegFilePdf /> PDF
                            </button>
                            <button type="button" onClick={() => handleExport("excel")} className="wo__text wo__text--drop wo__button wo__button--drop">
                                <FaRegFileExcel /> Excel (.xlsx)
                            </button>
                            <button type="button" onClick={() => handleExport("csv")} className="wo__text wo__text--drop wo__button wo__button--drop">
                                <FaRegFileCode /> CSV
                            </button>
                        </>
                    }>
                        
                    </Dropdown>

                    <Dropdown icon={<CiFilter/>} buttonText="Filtrar" content={

                        <>
                            <div className="wo__filter wo__filter--year">
                                <label htmlFor="year-select" className="wo__text wo__text--filter">Año:</label>
                                <select id="year-select" className="wo__select wo__text wo__text--filter" value={currentYearFilter} onChange={handleYearFilterChange}>
                                    <option value="">Todos los años</option>
                                    {availableYears.map((year) => (
                                        <option className="wo__select wo__text wo__text--filter" key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>     


                            <div className="wo__filter wo__filter--month">
                                <label htmlFor="month-select" className="wo__text wo__text--filter">Mes:</label>
                                <select id="month-select" className="wo__select wo__text wo__text--filter" value={currentMonthFilter} onChange={handleMonthFilterChange}>
                                    <option value="">Todos los meses</option>
                                    {availableMonths.map((monthKey) => (
                                        <option className="wo__select wo__text wo__text--filter" key={monthKey} value={monthKey}>
                                            {monthLabelFromKey(monthKey, { includeYear: !currentYearFilter })}
                                        </option>
                                    ))}
                                </select>
                            </div>    

                            <div className="wo__filter wo__filter--invoiced">
                                <label htmlFor="invoiced-select" className="wo__text wo__text--filter">Facturación:</label>
                                <select id="invoiced-select" className="wo__select wo__text wo__text--filter" value={currentInvoicedFilter} onChange={handleInvoicedFilterChange}>
                                    <option className="wo__text wo__text--filter" value="all">Todas</option>
                                    <option className="wo__text wo__text--filter" value="invoiced">Facturadas (Sí)</option>
                                    <option className="wo__text wo__text--filter" value="pending">Pendientes (No)</option>
                                </select>
                            </div>              
                        </>
                    }>
                        
                    </Dropdown>

                    <Dropdown icon={<MdGroupWork/>} buttonText="Estados" content={
                        <>
                            {availableStatuses.map((status) => {
                                const isActive = currentStatusFilter.includes(status);
                                return (
                                    <button key={status} type="button" className={`wo__text wo__text--drop wo__button wo__button--drop ${isActive ? "wo__button--drop--active" : ""}`} onClick={() => handleStatusFilterToggle(status)} >
                                        {status}
                                    </button>
                                );
                            })}
                            {currentStatusFilter.length > 0 && (
                                <button type="button" className="wo__text wo__text--drop wo__button wo__button--drop" onClick={() => table.getColumn("job_status")?.setFilterValue(undefined)}>
                                    Limpiar estados
                                </button>
                            )}
                        </>
                    }>
                        
                    </Dropdown>

                    <Dropdown icon={<VscSettings/>} buttonText="Columas" content={
                        <>
                            {table.getAllLeafColumns().map((column) => {
                                if (column.id === "select") return null;
                                return (
                                    <button key={column.id} className={`wo__button wo__button--column-selector wo__text wo__text--column-selector ${column.getIsVisible() ? "wo__button--column-selector--active" : ""}`} onClick={column.getToggleVisibilityHandler()}>
                                        {column.getIsVisible() ? <FaRegEye /> : <FaRegEyeSlash />}
                                        {typeof column.columnDef.header === "string"
                                            ? column.columnDef.header
                                            : column.id}
                                       
                                    </button>
                                );
                            })}
                        </>
                    }       
                    />


                    <Link href="/new" className="wo__action">
                        <div className="wo__action-button wo__text wo__text--action">
                            <div className="wo__action-button__icon action-button__icon--left">
                                <IoIosAdd />
                            </div>
                            Nueva orden
                        </div>
                    </Link>

                </div>

            </div>

            
            <div className="wo__section wo__section--tables">

                <table className="wo__table">

                    <thead className="wo__thead">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="wo__tr wo__tr--thead">
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const isSorted = header.column.getIsSorted();

                                    return (
                                        <th key={header.id} style={{ width: header.getSize() }} onClick={canSort ? header.column.getToggleSortingHandler() : undefined} className={
                                            
                                            `wo__th wo__th--th wo__text wo__text--th ${canSort ? "wo__th--sortable" : "wo__th--unsortable"}` }>
                                        
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {/* Indicadores de Ordenamiento Ascendente / Descendente */}
                                            {canSort && (<span className="wo__text wo__text--sort"> {isSorted === "asc" ? " ↓" : isSorted === "desc" ? " ↑" : " ↕"} </span>)}
                                        
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="wo__tbody">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className={`wo__tr wo__tr--tbody ${row.getIsSelected() ? "wo__tr--selected" : ""}`}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} style={{ textAlign: cell.column.columnDef.meta?.align || "left", }} style={{ width: cell.column.getSize() }} className={`wo__text wo__text--td wo__td ${row.getIsSelected() ? "wo__td--selected" : ""}`}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={table.getVisibleLeafColumns().length} className="wo__empty wo__text wo__text--empty">
                                    No se encontraron órdenes de trabajo.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* CONTROLES DE PAGINACIÓN                                       */}
            {/* ------------------------------------------------------------- */}
            <div className="wo__section wo__section--pagination">

                <div className="wo__pagination wo__text wo__text--pagination">
                    Página
                    <strong className="wo__text wo__text--pagination-num">{table.getState().pagination.pageIndex + 1}</strong> de{" "}
                    <strong className="wo__text wo__text--pagination-num">{table.getPageCount() || 1}</strong>
                    | {table.getSelectedRowModel().rows.length} de
                    <strong className="wo__text wo__text--pagination-num">{table.getFilteredRowModel().rows.length}</strong> órdenes
                </div>

                <div className="wo__pagination-actions">
                    <button type="button" className="wo__button wo__button--pagination" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Anterior
                    </button>

                    <button type="button" className="wo__button wo__button--pagination" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Siguiente
                    </button>

                    <select className="wo__select wo__text wo__text--select" value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
                        {[5, 10, 20, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                Mostrar {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div> 

        </div> 
        

    );
}


