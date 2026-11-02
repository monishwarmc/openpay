"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, money, Order } from "@/lib/api";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer_name: "Demo Customer",
    customer_email: "customer@example.com",
    description: "OpenPay SaaS subscription",
    amount: "149900",
  });

  async function refresh() {
    try {
      setOrders(await api<Order[]>("/api/orders"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const order = await api<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      await refresh();
      window.location.href = `/checkout/${order.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create order");
    }
  }

  const total = orders.reduce((sum, o) => sum + o.amount, 0);
  const paid = orders.filter(o => o.status === "SUCCESS");
  const paidTotal = paid.reduce((sum, o) => sum + o.amount, 0);

  return (
    <main className="container" style={{ padding: "38px 0 70px" }}>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, marginBottom:34 }}>
        <div>
          <div style={{fontSize:13, color:"#a99aff", fontWeight:800, letterSpacing:2}}>OPENPAY</div>
          <h1 style={{fontSize:30, fontWeight:800, margin:"6px 0"}}>Merchant dashboard</h1>
          <p className="muted" style={{margin:0}}>Payment operations · Development sandbox</p>
        </div>
        <span className="pill">SIMULATOR MODE</span>
      </header>

      <div className="grid-cards" style={{marginBottom:22}}>
        <section className="panel" style={{padding:20}}>
          <p className="muted" style={{marginTop:0}}>Total orders</p>
          <div style={{fontSize:30,fontWeight:800}}>{orders.length}</div>
        </section>
        <section className="panel" style={{padding:20}}>
          <p className="muted" style={{marginTop:0}}>Successful simulated payments</p>
          <div style={{fontSize:30,fontWeight:800,color:"#70e0b3"}}>{money(paidTotal)}</div>
        </section>
        <section className="panel" style={{padding:20}}>
          <p className="muted" style={{marginTop:0}}>Order value created</p>
          <div style={{fontSize:30,fontWeight:800}}>{money(total)}</div>
        </section>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(0, .9fr) minmax(0, 1.1fr)",gap:18}}>
        <section className="panel" style={{padding:22}}>
          <h2 style={{fontSize:19,fontWeight:800,marginTop:0}}>Create test order</h2>
          <p className="muted" style={{fontSize:13}}>Amounts are entered in paise. ₹1,499 = 149900.</p>
          <form onSubmit={createOrder} style={{display:"grid",gap:14}}>
            <div><label className="label">Customer name</label><input className="field" required value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})}/></div>
            <div><label className="label">Customer email</label><input className="field" type="email" required value={form.customer_email} onChange={e=>setForm({...form,customer_email:e.target.value})}/></div>
            <div><label className="label">Description</label><input className="field" required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div><label className="label">Amount (paise)</label><input className="field" type="number" min="1" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
            <button className="btn" type="submit">Create order and checkout</button>
          </form>
          {error && <p style={{color:"#ff9eaa",fontSize:13}}>{error}</p>}
        </section>

        <section className="panel" style={{padding:22,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
            <h2 style={{fontSize:19,fontWeight:800,marginTop:0}}>Recent orders</h2>
            <button className="btn btn-secondary" onClick={()=>void refresh()}>Refresh</button>
          </div>
          {loading ? <p className="muted">Loading…</p> : orders.length === 0 ? <p className="muted">No orders yet. Create your first test order.</p> :
            <div style={{display:"grid",gap:12}}>
              {orders.slice(0,8).map(order=><Link key={order.id} href={`/checkout/${order.id}`} style={{padding:"13px 0",borderBottom:"1px solid #26334a",display:"flex",justifyContent:"space-between",gap:12}}>
                <div><div style={{fontWeight:700}}>{order.order_number}</div><div className="muted" style={{fontSize:12}}>{order.customer_name} · {order.description}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:700}}>{money(order.amount)}</div><span className={`pill ${order.status==="SUCCESS"?"pill-success":order.status==="FAILED"?"pill-failed":""}`}>{order.status}</span></div>
              </Link>)}
            </div>
          }
        </section>
      </div>
      <p className="muted" style={{fontSize:12,marginTop:22}}>All transactions in this environment are simulated. No money is collected or transferred.</p>
    </main>
  );
}
