import { useCallback, useEffect, useState } from "react";
import WorkOrdersTable from "../components/dashboard/workorderstable.jsx";
import { listWorkOrders, updateWorkOrder } from "../repository/workorders.repository.js";



export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadWorkOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try 
        {
            const workOrders = await listWorkOrders();
            setData(workOrders);
        } 
        catch (err) 
        {
            setError(err.message ?? "No se pudieron cargar las órdenes de trabajo.");
        } 
        finally 
        {
            setLoading(false);
        }

    }, []);

    useEffect(() => { loadWorkOrders(); }, [loadWorkOrders]);
        
    

    // Actualización optimista: se ve el cambio al toque y, si la llamada a
    // Supabase falla, se revierte y se muestra el error.
    const handleToggleInvoiced = async (id, nextValue) => 
    {
        setData((prev) =>
            prev.map((wo) => (wo.id === id ? { ...wo, is_invoiced: nextValue } : wo))
        );
        try 
        {
            await updateWorkOrder(id, { is_invoiced: nextValue });
        } 
        catch (err) 
        {
            setError(err.message ?? "No se pudo actualizar el estado de facturación.");
            setData((prev) =>
                prev.map((wo) => (wo.id === id ? { ...wo, is_invoiced: !nextValue } : wo))
            );
        }
    };

    if (loading) {
        // Reutiliza las clases de workorderstable.scss (ya se importan al
        // cargar el módulo de WorkOrdersTable) para que no salte el layout.
        return (
            <div className="wo">
                
                <div className="wo__empty wo__text wo__empty--loading">Cargando órdenes de trabajo…</div>
                
            </div>
        );
    }

    return (
        <>
            {error && (
                <div
                    style={{
                        fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 12,
                        color: "#ff8080",
                        padding: "0 1rem",
                        marginBottom: "-0.5rem",
                    }}
                >
                    {error}
                </div>
            )}
            <WorkOrdersTable data={data} onToggleInvoiced={handleToggleInvoiced} />
        </>
    );
}