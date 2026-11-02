export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Attempt = {
  id: number;
  method: string;
  status: string;
  provider_reference: string;
  created_at: string;
};

export type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  environment: string;
  created_at: string;
  attempts: Attempt[];
};

export function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? `Request failed (${response.status})`);
  }
  return data as T;
}
