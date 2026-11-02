"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { api, money, Order } from "@/lib/api";

export default function Checkout({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState("UPI");
  const [outcome, setOutcome] = useState("SUCCESS");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try { setOrder(await api<Order>(`/api/orders/${orderId}`)); }
    catch (e) { setError(e instanceof Error ? e.message : "Order not found"); }
  }
  useEffect(() => { void load(); }, [orderId]);

  async function pay() {
    setBusy(true); setError("");
    try {
      const updated = await api<Order>(`/api/payments/${orderId}/simulate`, {
        method: "POST",
        body: JSON.stringify({ method, outcome }),
      });
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally { setBusy(false); }
  }

  if (!order) return <main className="container" style={{padding:50}}><p>{error || "Loading checkout…"}</p><Link href="/">Back to dashboard</Link></main>;

  return (
    <main className="container" style={{maxWidth:650,padding:"45px 0 70px"}}>
      <Link href="/" className="muted" style={{fontSize:13}}>← Back to dashboard</Link>
      <section className="panel" style={{padding:26,marginTop:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,color:"#a99aff",fontWeight:800,letterSpacing:2}}>OPENPAY</div><h1 style={{fontSize:25,fontWeight:800,margin:"8px 0"}}>Secure checkout demo</h1></div>
          <span className="pill">TEST MODE</span>
        </div>
        <div style={{background:"#0b1322",borderRadius:13,padding:18,margin:"22px 0"}}>
          <p className="muted" style={{fontSize:12,margin:"0 0 5px"}}>AMOUNT DUE</p>
          <div style={{fontSize:34,fontWeight:800}}>{money(order.amount)}</div>
          <p className="muted" style={{fontSize:13,marginBottom:0}}>{order.description}</p>
        </div>
        <div style={{display:"grid",gap:6,fontSize:13,marginBottom:22}}>
          <div className="muted">Order: <span style={{color:"#e8edf7"}}>{order.order_number}</span></div>
          <div className="muted">Customer: <span style={{color:"#e8edf7"}}>{order.customer_name}</span></div>
        </div>

        {order.status === "SUCCESS" ? (
          <div style={{padding:18,borderRadius:12,background:"#123c31",color:"#70e0b3"}}>
            <div style={{fontSize:20,fontWeight:800}}>Simulated payment successful</div>
            <p style={{marginBottom:0,fontSize:13}}>This is a test result only. No real funds moved.</p>
          </div>
        ) : (
          <>
            <h2 style={{fontSize:16,fontWeight:800}}>Choose payment method</h2>
            <div style={{display:"grid",gap:9,margin:"12px 0 20px"}}>
              {["UPI","CARD","NETBANKING"].map(item=><button key={item} type="button" onClick={()=>setMethod(item)} className="btn btn-secondary" style={{justifyContent:"space-between",outline:method===item?"2px solid #8a74ff":"none"}}><span>{item==="UPI"?"UPI / QR":item==="CARD"?"Credit or debit card":"Net banking"}</span><span>{method===item?"●":"○"}</span></button>)}
            </div>
            <label className="label">Simulator result</label>
            <select className="field" value={outcome} onChange={e=>setOutcome(e.target.value)} style={{marginBottom:16}}>
              <option value="SUCCESS">Successful payment</option>
              <option value="FAILED">Failed payment</option>
              <option value="PENDING">Pending payment</option>
            </select>
            <button className="btn" disabled={busy} onClick={()=>void pay()} style={{width:"100%"}}>{busy?"Processing…":`Simulate ${method} payment`}</button>
          </>
        )}
        {order.attempts.length>0 && <div style={{marginTop:22,borderTop:"1px solid #26334a",paddingTop:16}}>
          <h3 style={{fontSize:14,fontWeight:800}}>Payment attempts</h3>
          {order.attempts.map(a=><div key={a.id} className="muted" style={{fontSize:12,marginTop:8}}>{a.method} · {a.status} · {a.provider_reference}</div>)}
        </div>}
        {error && <p style={{color:"#ff9eaa",fontSize:13}}>{error}</p>}
      </section>
      <p className="muted" style={{fontSize:12,textAlign:"center",marginTop:16}}>OpenPay development simulator · No real payment processing</p>
    </main>
  );
}
