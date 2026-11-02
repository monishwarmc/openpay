"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money, Order } from "@/lib/api";

export default function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<Order[]>("/api/orders").then(setOrders).catch(e=>setError(e.message)); }, []);
  return <main className="container" style={{padding:"40px 0"}}>
    <Link href="/" className="muted">← Dashboard</Link>
    <h1 style={{fontSize:30,fontWeight:800}}>Transactions</h1>
    <p className="muted">All records are simulated.</p>
    {error && <p style={{color:"#ff9eaa"}}>{error}</p>}
    <section className="panel" style={{padding:18,overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{textAlign:"left",color:"#98a6bd"}}>{["Order","Customer","Amount","Status","Created"].map(x=><th key={x} style={{padding:12}}>{x}</th>)}</tr></thead>
        <tbody>{orders.map(o=><tr key={o.id} style={{borderTop:"1px solid #26334a"}}>
          <td style={{padding:12}}><Link href={`/checkout/${o.id}`}>{o.order_number}</Link></td>
          <td style={{padding:12}}>{o.customer_name}</td><td style={{padding:12}}>{money(o.amount)}</td><td style={{padding:12}}>{o.status}</td><td style={{padding:12}}>{new Date(o.created_at).toLocaleString()}</td>
        </tr>)}</tbody>
      </table>
    </section>
  </main>;
}
