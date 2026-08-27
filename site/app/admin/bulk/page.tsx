'use client';
import { useEffect, useState } from 'react';

interface BulkOrder {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  items: string;
  quantity: number;
  deliveryDate: string;
  message?: string;
  status: 'new' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  quotedPrice?: number;
}

export default function AdminBulkOrders() {
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BulkOrder | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    new: 'bg-[#ea580c]/20 text-[#ea580c]',
    quoted: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    confirmed: 'bg-[#16a34a]/20 text-[#16a34a]',
    completed: 'bg-[#16a34a]/20 text-[#16a34a]',
    cancelled: 'bg-red-500/20 text-red-600',
  };

  const statusOrder = ['new', 'quoted', 'confirmed', 'completed', 'cancelled'] as const;

  useEffect(() => {
    fetchBulkOrders();
  }, []);

  const fetchBulkOrders = async () => {
    try {
      const res = await fetch('/api/admin/bulk');
      const data = await res.json();
      if (data.bulkOrders) setBulkOrders(data.bulkOrders);
    } catch (error) {
      console.error('Failed to fetch bulk orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: BulkOrder['status']) => {
    setUpdating(orderId);
    try {
      await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id: orderId, status: newStatus }),
      });
      setBulkOrders(bulkOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleQuote = async (orderId: string) => {
    const price = prompt('Enter quoted price (₹):');
    if (!price) return;
    const quotedPrice = parseInt(price);
    if (isNaN(quotedPrice)) return alert('Invalid price');
    
    try {
      await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quote', id: orderId, quotedPrice }),
      });
      setBulkOrders(bulkOrders.map(o => o.id === orderId ? { ...o, quotedPrice, status: 'quoted' } : o));
    } catch (error) {
      console.error('Quote failed:', error);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ea580c] animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <h1 className="font-display text-3xl font-black">Bulk Orders ({bulkOrders.length})</h1>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-xs font-bold text-black/50">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Delivery</th>
                  <th className="p-3">Quoted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bulkOrders.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-black/50">No bulk orders</td></tr>
                ) : (
                  bulkOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-[#f7f7f7]">
                      <td className="p-3 font-mono text-sm">{order.id.slice(-6)}</td>
                      <td className="p-3">
                        <div className="font-bold">{order.name}</div>
                        <div className="text-xs text-black/60">{order.phone}</div>
                        {order.email && <div className="text-xs text-black/50">{order.email}</div>}
                        {order.company && <div className="text-xs text-black/40">{order.company}</div>}
                      </td>
                      <td className="p-3 text-sm text-black/60 max-w-[200px] truncate">{order.items}</td>
                      <td className="p-3 font-bold">{order.quantity}</td>
                      <td className="p-3 text-sm text-black/60">{order.deliveryDate}</td>
                      <td className="p-3 font-black">
                        {order.quotedPrice ? `₹${order.quotedPrice.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as BulkOrder['status'])}
                          disabled={updating === order.id}
                          className={`rounded-full px-2 py-1 text-xs font-bold ${statusColors[order.status]}`}
                        >
                          {statusOrder.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-xs text-black/60">{formatDate(order.createdAt)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="text-xs text-[#ea580c] hover:underline">View</button>
                          {!order.quotedPrice && order.status === 'new' && (
                            <button onClick={() => handleQuote(order.id)} className="text-xs text-[#16a34a] hover:underline">Quote</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-black">Bulk Order #{selectedOrder.id.slice(-6)}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-xl hover:text-black/50">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f7f7f7] p-4">
                  <div className="text-xs font-bold text-black/50">Customer</div>
                  <div className="font-bold">{selectedOrder.name}</div>
                  <div className="text-sm text-black/60">{selectedOrder.phone}</div>
                  {selectedOrder.email && <div className="text-sm text-black/60">{selectedOrder.email}</div>}
                  {selectedOrder.company && <div className="text-sm text-black/60">{selectedOrder.company}</div>}
                </div>
                <div className="rounded-xl bg-[#f7f7f7] p-4">
                  <div className="text-xs font-bold text-black/50">Order Details</div>
                  <div className="text-sm">Quantity: <span className="font-bold">{selectedOrder.quantity}</span></div>
                  <div className="text-sm">Delivery: <span className="font-bold">{selectedOrder.deliveryDate}</span></div>
                  <div className="text-sm">Status: <span className={`font-bold ${statusColors[selectedOrder.status].replace('/20', '')}`}>{selectedOrder.status}</span></div>
                  <div className="text-sm">Quoted: <span className="font-bold">{selectedOrder.quotedPrice ? `₹${selectedOrder.quotedPrice.toLocaleString()}` : 'Not quoted'}</span></div>
                  <div className="text-sm">Created: <span className="font-bold">{formatDate(selectedOrder.createdAt)}</span></div>
                </div>
              </div>

              {selectedOrder.message && (
                <div className="rounded-xl bg-[#f7f7f7] p-4">
                  <div className="text-xs font-bold text-black/50">Message</div>
                  <div className="text-sm mt-1">{selectedOrder.message}</div>
                </div>
              )}

              <div className="rounded-xl bg-white ring-1 ring-black/5 p-4">
                <div className="text-xs font-bold text-black/50">Items Requested</div>
                <div className="text-sm mt-1 text-black/60">{selectedOrder.items}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}