export type Order = {
    id: number;
    // --- Updated status values to match usage in OrderRow.tsx ---
    status: 'completed' | 'processing' | 'Pending' | 'partial' | 'canceled' | 'In progress';
    charge: number;
    link: string;
    start_count: number;
    quantity: number;
    service_name: string;
    created_at: string;
    remains: number | null;
    note: string | null;
    cost: number | null;
    slip_url: string | null;
};

export type Summary = {
    total_orders: number;
    total_charge: number;
    processing_orders: number;
    completed_orders: number;
};
