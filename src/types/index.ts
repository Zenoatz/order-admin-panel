export interface Order {
  id: number;
  order_id: number;
  service_name: string;
  link: string;
  charge: number;
  cost: number | null;
  profit: number | null;
  slip_url: string | null;
  status: string;
  created_at: string;
}