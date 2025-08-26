export interface Order {
  id: number;
  link: string;
  status: 'Completed' | 'Pending' | 'In progress' | 'Partial' | 'Canceled' | 'Processing' | 'Error';
  charge: number | null;
  start_count: number | null;
  remains: number | null;
  created_at: string;
  service_name: string | null;
}

export interface Summary {
  totalOrders: number;
  totalCharge: number;
  pendingOrders: number;
  completedOrders: number;
}
