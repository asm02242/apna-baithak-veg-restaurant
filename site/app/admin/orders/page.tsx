'use client';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  userId?: string;
  items: { id: string; name: string; price: number; quantity: number; image?: string }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  handlingFee: number;
  smallCartFee: number;
  tip: number;
  grandTotal: number;
  deliveryType: 'delivery' | 'takeaway' | 'dinein';
  address: string;
  phone: string;
  name: string;
  slot: string;
  payment: 'cod' | 'razorpay';
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  offerApplied?: { id: string; label: string; discount: number; freeItemValue?: number };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [assigning, setAssigning] = useState(false);

  const statusColors: Record<string, string> = {
    pending: 'bg-[#ea580c]/20 text-[#ea580c]',
    confirmed: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    preparing: 'bg-[#0ea5e9]/20 text-[#0ea5e9]',
    delivered: 'bg-[#16a34a]/20 text-[#16a34a]',
    cancelled: 'bg-red-500/20 text-red-600',
  };

  const statusOrder = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'] as const;

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, [filter]);

  const fetchPartners = async () => {
    try {
      const r = await fetch('/api/admin/delivery-partners', { cache: 'no-store' });
      const d = await r.json();
      if (d.partners) setPartners(d.partners.filter((p: any) => p.is_active));
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      // Try Neon orders first (customer orders), fallback to legacy admin orders
      let data: any = null;
      try {
        const r2 = await fetch('/api/orders', { cache: 'no-store' });
        if (r2.ok) {
          const d2 = await r2.json();
          if (Array.isArray(d2.orders) && d2.orders.length) {
            // Map Neon orders to admin Order type for display
            const mapped = d2.orders.map((o: any) => ({
              id: o.id,
              userId: o.user_id,
              items: (o.items || []).map((it: any) => ({ id: it.menu_item_id || it.combo_id || it.id, name: it.name, price: it.unit_price, quantity: it.quantity, image: '' })),
              subtotal: o.subtotal,
              discount: o.discount || 0,
              deliveryFee: o.delivery_fee || 0,
              handlingFee: 5,
              smallCartFee: 0,
              tip: 0,
              grandTotal: o.total,
              deliveryType: 'delivery' as const,
              address: o.address,
              phone: o.phone,
              name: o.customer_name,
              slot: 'ASAP',
              payment: (o.payment_method === 'online' ? 'razorpay' : o.payment_method) as any,
              status: (o.order_status?.toLowerCase() as any) || 'pending',
              createdAt: o.created_at,
              offerApplied: o.offer_id ? { id: o.offer_id, label: o.offer_id, discount: o.discount } as any : undefined,
              paymentStatus: o.payment_status,
            }));
            data = { orders: mapped };
          }
        }
      } catch {}
      if (!data?.orders?.length) {
        const res = await fetch(`/api/admin/orders?status=${filter}&limit=100`);
        data = await res.json();
      }
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOrder || !selectedPartner) return;
    setAssigning(true);
    try {
      const r = await fetch('/api/delivery/assignment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'assign', order_id: selectedOrder.id, delivery_partner_id: selectedPartner }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Assign failed');
      alert(`Assigned to ${partners.find(p=>p.id===selectedPartner)?.name} • OTP: ${d.otp||'sent'}`);
      setSelectedOrder(null);
    } catch (e: any) {
      alert(e.message);
    } finally { setAssigning(false); }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId);
    try {
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id: orderId, status: newStatus }),
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const getNextStatuses = (current: string) => {
    const idx = statusOrder.indexOf(current as any);
    return statusOrder.slice(idx + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ea580c] animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-black">Orders ({orders.length})</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${filter === s ? 'bg-[#ea580c] text-white' : 'bg-white border'}`}>{s}</button>
          ))}
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-xs font-bold text-black/50">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-black/50">No orders</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-t hover:bg-[#f7f7f7]">
                      <td className="p-3 font-mono text-sm">{o.id.slice(-8)}</td>
                      <td className="p-3">
                        <div className="font-bold">{o.name}</div>
                        <div className="text-xs text-black/60">{o.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-black/60 max-w-[200px] truncate">
                          {o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                        </div>
                        {o.offerApplied && (
                          <div className="text-[10px] text-[#ea580c] font-bold mt-1">Offer: {o.offerApplied.label}</div>
                        )}
                      </td>
                      <td className="p-3 font-black">₹{o.grandTotal}</td>
                      <td className="p-3 text-xs text-black/60 capitalize">{o.deliveryType}</td>
                      <td className="p-3 text-xs text-black/60 capitalize">{o.payment}</td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as Order['status'])}
                          disabled={updating === o.id}
                          className={`rounded-full px-2 py-1 text-xs font-bold ${statusColors[o.status]}`}
                        >
                          {statusOrder.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-xs text-black/60">{formatDate(o.createdAt)}</td>
                      <td className="p-3">
                        <button onClick={() => setSelectedOrder(o)} className="text-xs text-[#ea580c] hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-black">Order #{selectedOrder.id.slice(-8)}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-xl hover:text-black/50">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f7f7f7] p-4">
                  <div className="text-xs font-bold text-black/50">Customer</div>
                  <div className="font-bold">{selectedOrder.name}</div>
                  <div className="text-sm text-black/60">{selectedOrder.phone}</div>
                  <div className="mt-2 text-xs font-bold text-black/50">Address</div>
                  <div className="text-sm">{selectedOrder.address}</div>
                </div>
                <div className="rounded-xl bg-[#f7f7f7] p-4">
                  <div className="text-xs font-bold text-black/50">Order Details</div>
                  <div className="text-sm">Type: <span className="font-bold capitalize">{selectedOrder.deliveryType}</span></div>
                  <div className="text-sm">Payment: <span className="font-bold capitalize">{selectedOrder.payment}</span></div>
                  <div className="text-sm">Slot: <span className="font-bold">{selectedOrder.slot}</span></div>
                  <div className="text-sm">Status: <span className={`font-bold ${statusColors[selectedOrder.status].replace('/20', '')}`}>{selectedOrder.status}</span></div>
                  <div className="text-sm">Placed: <span className="font-bold">{formatDate(selectedOrder.createdAt)}</span></div>
                </div>
              </div>

              <div className="rounded-xl bg-white ring-1 ring-black/5 overflow-hidden">
                <div className="p-3 border-b bg-[#f7f7f7] text-xs font-bold text-black/50">Items</div>
                <div className="divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7]">
                        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-xl">🍽️</div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-xs text-black/60">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="text-right font-bold text-sm">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white ring-1 ring-black/5 p-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-bold text-black/50">Bill Breakdown</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                      <div className="flex justify-between"><span>Handling</span><span>₹{selectedOrder.handlingFee}</span></div>
                      <div className="flex justify-between"><span>Delivery</span><span>{selectedOrder.deliveryFee === 0 ? 'Free' : '₹' + selectedOrder.deliveryFee}</span></div>
                      {selectedOrder.smallCartFee > 0 && <div className="flex justify-between text-red-600"><span>Small cart fee</span><span>₹{selectedOrder.smallCartFee}</span></div>}
                      {selectedOrder.discount > 0 && <div className="flex justify-between text-[#ea580c]"><span>Offer discount</span><span>-₹{selectedOrder.discount}</span></div>}
                      {selectedOrder.tip > 0 && <div className="flex justify-between"><span>Tip</span><span>₹{selectedOrder.tip}</span></div>}
                    </div>
                  </div>
                  <div className="bg-[#f7f7f7] rounded-xl p-4 text-right">
                    <div className="text-xs font-bold text-black/50">Grand Total</div>
                    <div className="text-2xl font-black text-[#ea580c]">₹{selectedOrder.grandTotal}</div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#fff7ed] p-3 ring-1 ring-black/5">
                  <div className="text-xs font-black">Delivery Partner</div>
                  <div className="mt-2 flex gap-2">
                    <select value={selectedPartner} onChange={e=>setSelectedPartner(e.target.value)} className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm">
                      <option value="">Select Partner (active only)</option>
                      {partners.map((p:any)=><option key={p.id} value={p.id}>{p.name} • {p.phone} {p.is_online?'● Online':''}</option>)}
                    </select>
                    <button onClick={handleAssign} disabled={!selectedPartner||assigning} className="rounded-xl bg-[#1c0a00] px-4 py-2 text-sm font-black text-white disabled:opacity-50">{assigning?'Assigning…':'Assign Delivery'}</button>
                  </div>
                  <div className="mt-2 text-[11px] text-black/50">Only active partners shown • OTP will be generated on assign</div>
                </div>

                {selectedOrder.offerApplied && (
                  <div className="rounded-xl bg-[#f0fdf4] p-3 border border-[#16a34a]/20">
                    <div className="font-bold text-[#16a34a]">🎁 Offer Applied: {selectedOrder.offerApplied.label}</div>
                    <div className="text-sm text-[#16a34a]">Discount: ₹{selectedOrder.offerApplied.discount} {selectedOrder.offerApplied.freeItemValue ? `+ Free item worth ₹${selectedOrder.offerApplied.freeItemValue}` : ''}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}