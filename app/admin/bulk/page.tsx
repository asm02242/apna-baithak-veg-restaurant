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
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBulkOrders();
  }, []);

  const fetchBulkOrders = async () => {
    try {
      // Mock data since we don't have a real bulk order API yet
      // In real implementation, this would come from a database
      const mockData = [
        {
          id: 'bulk-1',
          name: 'ABC Corporation',
          phone: '9876543210',
          email: 'orders@abc.com',
          company: 'ABC Corp',
          items: 'Thali x50, Special Thali x30, Mini Combo x20',
          quantity: 100,
          deliveryDate: '2024-02-15',
          message: 'Need for office lunch event',
          status: 'quoted',
          createdAt: '2024-01-20T10:30:00Z',
          quotedPrice: 25000,
        },
        {
          id: 'bulk-2',
          name: 'XYZ School',
          phone: '9876543211',
          email: 'admin@xyzschool.edu',
          company: 'XYZ School',
          items: 'Mini Combo x100, Family Combo x50',
          quantity: 150,
          deliveryDate: '2024-02-20',
          message: 'Annual day function',
          status: 'new',
          createdAt: '2024-01-22T14:20:00Z',
        },
        {
          id: 'bulk-3',
          name: 'Tech Solutions Pvt Ltd',
          phone: '9876543212',
          email: 'hr@techsolutions.com',
          company: 'Tech Solutions',
          items: 'Family Combo x30, Party Combo x10',
          quantity: 40,
          deliveryDate: '2024-02-10',
          message: 'Team lunch every Friday',
          status: 'confirmed',
          createdAt: '2024-01-18T09:15:00Z',
          quotedPrice: 18500,
        },
      ];
      setBulkOrders(mockData);
    } catch (error) {
      console.error('Failed to fetch bulk orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const statusColors: Record<string, string> = {
    new: 'bg-[#ea580c]/20 text-[#ea580c]',
    quoted: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    confirmed: 'bg-[#16a34a]/20 text-[#16a34a]',
    completed: 'bg-[#16a34a]/20 text-[#16a34a]',
    cancelled: 'bg-red-500/20 text-red-600',
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <h1 className="font-display text-3xl font-black">Bulk Orders</h1>

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
                {bulkOrders.map((order) => (
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
                        onChange={(e) => alert(`Status updated to: ${e.target.value} (backend integration needed)`)}
                        className={`rounded-full px-2 py-1 text-xs font-bold ${({
                          new: 'bg-[#ea580c]/20 text-[#ea580c]',
                          quoted: 'bg-[#f59e0b]/20 text-[#f59e0b]',
                          confirmed: 'bg-[#16a34a]/20 text-[#16a34a]',
                          completed: 'bg-[#16a34a]/20 text-[#16a34a]',
                          cancelled: 'bg-red-500/20 text-red-600',
                        }[order.status]}`}
                      >
                        <option value="new">New</option>
                        <option value="quoted">Quoted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-xs text-black/60">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <button className="text-xs text-[#ea580c] hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}