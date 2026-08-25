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

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

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
                  <th className="p-3">Addresses</th>
                  <th className="p-3">Wishlist</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-[#f7f7f7]">
                    <td className="p-3 font-mono text-sm">{customer.id.slice(-8)}</td>
                    <td className="p-3 font-bold">{customer.name}</td>
                    <td className="p-3">{customer.phone}</td>
                    <td className="p-3">{customer.addresses.length}</td>
                    <td className="p-3">{customer.wishlist.length}</td>
                    <td className="p-3 text-xs text-black/60">{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button className="text-xs text-[#ea580c] hover:underline">View</button>
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