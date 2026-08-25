'use client';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  userId?: string;
  items: { id: string; name: string; price: number; quantity: number }[];
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
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}&limit=100`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id, status }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const statusColors: Record<string, string> = {
    pending: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    confirmed: 'bg-[#0ea5e9]/20 text-[#0ea5e9]',
    preparing: 'bg-[#7c3aed]/20 text-[#7c3aed]',
    delivered: 'bg-[#16a34a]/20 text-[#16a34a]',
    cancelled: 'bg-red-500/20 text-red-600',
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <h1 className="font-display text-3xl font-black">Orders Management</h1>

        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${statusFilter === status ? 'bg-[#ea580c] text-white' : 'bg-white border'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ea580c] animate-spin">⏳</div>
          </div>
        ) : (
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
                    <th className="p-3">Date</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-black/50">No orders found</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-[#f7f7f7]">
                        <td className="p-3 font-mono text-sm">{order.id.slice(-8)}</td>
                        <td className="p-3">
                          <div className="font-bold">{order.name}</div>
                          <div className="text-xs text-black/60">{order.phone}</div>
                        </td>
                        <td className="p-3 text-sm text-black/60">
                          {order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                        </td>
                        <td className="p-3 font-black">₹{order.grandTotal}</td>
                        <td className="p-3 text-xs capitalize">{order.deliveryType}</td>
                        <td className="p-3 text-xs capitalize">{order.payment === 'cod' ? 'COD' : 'Online'}</td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`rounded-full px-2 py-1 text-xs font-bold ${statusColors[order.status]}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-xs text-black/60">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button className="text-xs text-[#ea580c] hover:underline">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}