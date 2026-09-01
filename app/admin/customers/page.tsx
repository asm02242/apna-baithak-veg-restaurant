'use client';
import { useEffect, useState } from 'react';

interface Customer {
  id: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  addresses: { id: string; label: string; full: string; phone: string }[];
  wishlist: string[];
  favourites: string[];
  createdAt: string;
  banned?: boolean;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (id: string, ban: boolean) => {
    try {
      await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: ban ? 'ban' : 'unban', id }),
      });
      fetchCustomers();
    } catch (error) {
      console.error('Ban/unban failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (error) {
      console.error('Delete failed:', error);
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
        <h1 className="font-display text-3xl font-black">Customers</h1>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-xs font-bold text-black/50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Addresses</th>
                  <th className="p-3">Wishlist</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-[#f7f7f7]">
                    <td className="p-3 font-mono text-sm">{customer.id.slice(-8)}</td>
                    <td className="p-3 font-bold">{customer.name}</td>
                    <td className="p-3">{customer.phone}</td>
                    <td className="p-3 text-xs text-black/60">{customer.username}</td>
                    <td className="p-3">{customer.addresses.length}</td>
                    <td className="p-3">{customer.wishlist.length}</td>
                    <td className="p-3 text-xs text-black/60">{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${customer.banned ? 'bg-red-500/20 text-red-600' : 'bg-[#16a34a]/20 text-[#16a34a]'}`}>
                        {customer.banned ? '🚫 Banned' : '✓ Active'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {customer.banned ? (
                          <button onClick={() => handleBan(customer.id, false)} className="text-xs text-[#16a34a] hover:underline">Unban</button>
                        ) : (
                          <button onClick={() => handleBan(customer.id, true)} className="text-xs text-red-600 hover:underline">Ban</button>
                        )}
                        <button onClick={() => handleDelete(customer.id)} className="text-xs text-[#ea580c] hover:underline ml-2">Delete</button>
                      </div>
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