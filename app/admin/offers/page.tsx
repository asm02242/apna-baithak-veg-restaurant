'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Offer {
  id: string;
  label: string;
  type: 'flat' | 'freeItem' | 'bulk';
  minOrder: number;
  value: number;
  freeItemValue?: number;
  desc: string;
  priority: number;
  active: boolean;
}

export default function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    type: 'flat',
    minOrder: 0,
    value: 0,
    freeItemValue: undefined,
    desc: '',
    priority: 1,
    active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/offers');
      const data = await res.json();
      if (data.offers) setOffers(data.offers);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const offerData = {
      ...formData,
      minOrder: Number(formData.minOrder),
      value: Number(formData.value),
      freeItemValue: formData.freeItemValue ? Number(formData.freeItemValue) : undefined,
      priority: Number(formData.priority),
      active: formData.active,
    };

    try {
      const action = editingOffer ? 'update' : 'add';
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, offer: formData }),
      });
      
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingOffer(null);
        resetForm();
        fetchOffers();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
      fetchOffers();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, active: !active }),
      });
      fetchOffers();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      label: offer.label,
      type: offer.type,
      minOrder: offer.minOrder,
      value: offer.value,
      freeItemValue: offer.freeItemValue || '',
      desc: offer.desc,
      priority: offer.priority,
      active: offer.active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      label: '',
      type: 'flat',
      minOrder: 0,
      value: 0,
      freeItemValue: undefined,
      desc: '',
      priority: 1,
      active: true,
    });
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
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-black">Offers & Coupons</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">
            + Add Offer
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-black text-lg">Offers ({offers.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-xs font-bold text-black/50">
                  <th className="p-3">Type</th>
                  <th className="p-3">Label</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-t hover:bg-[#f7f7f7]">
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${offer.type === 'flat' ? 'bg-[#ea580c]/20 text-[#ea580c]' : offer.type === 'freeItem' ? 'bg-[#16a34a]/20 text-[#16a34a]' : 'bg-[#7c3aed]/20 text-[#7c3aed]'}`}>
                        {offer.type === 'flat' ? '💰' : offer.type === 'freeItem' ? '🎁' : '📦'}
                        {offer.type}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{offer.label}</td>
                    <td className="p-3 text-xs text-black/60">Order ≥ ₹{offer.minOrder}</td>
                    <td className="p-3 font-bold">
                      {offer.type === 'flat' ? `₹${offer.value} off` : offer.type === 'freeItem' ? `Free item ₹${offer.freeItemValue}` : 'Custom quote'}
                    </td>
                    <td className="p-3 text-center text-xs font-bold">{offer.priority}</td>
                    <td className="p-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={offer.active} onChange={(e) => {
                          fetch('/api/admin/offers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'toggle', id: offer.id, active: !offer.active }),
                          }).then(() => window.location.reload());
                        }} />
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${offer.active ? 'bg-[#16a34a] text-white' : 'bg-red-500/20 text-red-600'}`}>
                          {offer.active ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="p-3">
                      <button onClick={() => {
                        setFormData({
                          label: offer.label,
                          type: offer.type,
                          minOrder: offer.minOrder,
                          value: offer.value,
                          freeItemValue: offer.freeItemValue || '',
                          desc: offer.desc,
                          priority: offer.priority,
                          active: offer.active,
                        });
                        setShowForm(true);
                      }} className="rounded-lg bg-[#ea580c] px-3 py-1.5 text-xs font-black text-white hover:bg-[#c2410c]">Edit</button>
                      <button onClick={() => { if (confirm('Delete?')) fetch(`/api/admin/offers?id=${offer.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }} className="ml-2 rounded-lg bg-red-500/20 text-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-black">{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-xl hover:text-black/50">✕</button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveForm(); }} className="space-y-4">
                <div>
                  <label className="text-xs font-black">Label *</label>
                  <input value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} placeholder="e.g. ₹75 OFF" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black">Type *</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required>
                      <option value="flat">Flat Discount</option>
                      <option value="freeItem">Free Item</option>
                      <option value="bulk">Bulk Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black">Priority</label>
                    <input type="number" min="1" value={formData.priority} onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black">Min Order Amount *</label>
                    <input type="number" min="0" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: Number(e.target.value)})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs font-black">Discount Value *</label>
                    <input type="number" min="0" value={formData.value} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black">Free Item Value (for freeItem type)</label>
                  <input type="number" min="0" value={formData.freeItemValue || ''} onChange={(e) => setFormData({...formData, freeItemValue: e.target.value ? Number(e.target.value) : undefined})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="text-xs font-black">Description</label>
                  <textarea value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} rows={2} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" placeholder="e.g. ₹75 off on orders above ₹499" />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                  <label htmlFor="active" className="text-sm">Active</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button>
                  <button type="submit" className="flex-1 rounded-xl bg-[#ea580c] py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">
                    {editingOffer ? 'Update' : 'Add Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function resetForm() {
  // This will be called from the form's onSubmit or cancel
}