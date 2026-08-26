'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  half?: number;
  full?: number;
  rating: number;
  bestSeller?: boolean;
  veg: boolean;
  image?: string;
  description?: string;
}

interface FormData {
  name: string;
  categoryId: string;
  price: number;
  half?: number;
  full?: number;
  rating: number;
  bestSeller: boolean;
  image: string;
  description: string;
}

export default function AdminMenu() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    categoryId: '',
    price: 0,
    half: undefined,
    full: undefined,
    rating: 4.5,
    bestSeller: false,
    image: '',
    description: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        const allItems = data.categories.flatMap((c: any) => c.items);
        setItems(allItems);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImagePreview(data.url);
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const itemData = {
      ...formData,
      half: formData.half || undefined,
      full: formData.full || undefined,
    };

    try {
      const action = editingItem ? 'updateItem' : 'addItem';
      const body = { action, item: itemData, categoryId: formData.categoryId };
      
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        // Refresh data
        const res = await fetch('/api/admin/menu');
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
          const allItems = data.categories.flatMap((c: any) => c.items);
          setItems(allItems);
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      await fetch(`/api/admin/menu?id=${id}&type=item`, { method: 'DELETE' });
      await fetchCategories();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEditItem = (item: any, categoryId: string) => {
    setEditingItem(item);
    setSelectedCategory(categoryId);
    setFormData({
      name: item.name,
      categoryId,
      price: item.price,
      half: item.half,
      full: item.full,
      rating: item.rating,
      bestSeller: item.bestSeller || false,
      image: item.image || '',
      description: item.description || '',
    });
    setImagePreview(item.image || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setSelectedCategory('');
    setFormData({
      name: '',
      categoryId: '',
      price: 0,
      half: undefined,
      full: undefined,
      rating: 4.5,
      bestSeller: false,
      image: '',
      description: '',
    });
    setImagePreview('');
  };

  const handleAddCategory = async (name: string, icon: string) => {
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addCategory', name, icon }),
      });
      const data = await res.json();
      if (data.success) fetchCategories();
    } catch (error) {
      console.error('Add category failed:', error);
    }
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
          <h1 className="font-display text-3xl font-black">Menu Management</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">
            + Add Item
          </button>
        </div>

        {/* Categories */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 mb-6">
          <h2 className="font-black text-lg mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/admin/menu?cat=${cat.id}`} className={`rounded-full px-3 py-1.5 text-sm font-bold ${selectedCategory === cat.id ? 'bg-[#ea580c] text-white' : 'bg-white border'}`}>
                {cat.icon} {cat.name} ({cat.items?.length || 0})
              </Link>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="New category name" className="flex-1 rounded-xl border px-3 py-2 text-sm" id="newCatName" />
            <input type="text" placeholder="Icon (emoji)" className="w-[80px] rounded-xl border px-3 py-2 text-sm" id="newCatIcon" defaultValue="🍽️" />
            <button onClick={() => {
              const name = (document.getElementById('newCatName') as HTMLInputElement).value;
              const icon = (document.getElementById('newCatIcon') as HTMLInputElement).value || '🍽️';
              if (name) handleAddCategory(name, icon);
            }} className="rounded-xl bg-[#ea580c] px-4 py-2 text-sm font-black text-white">Add Category</button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-black text-lg">Items ({items.length})</h2>
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-[300px] rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-xs font-bold text-black/50">
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-[#f7f7f7]">
                    <td className="p-3">
                      <img src={item.image || '/logo-neon.svg'} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    </td>
                    <td className="p-3 font-bold">{item.name}</td>
                    <td className="p-3 text-xs text-black/60">{item.category}</td>
                    <td className="p-3 font-black">₹{item.price}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${item.bestSeller ? 'bg-[#ea580c]/20 text-[#ea580c]' : 'bg-green-100 text-green-700'}`}>
                        {item.bestSeller ? '⭐ Best Seller' : 'Available'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleEditItem(item, item.categoryId)} className="rounded-lg bg-[#ea580c] px-3 py-1.5 text-xs font-black text-white hover:bg-[#c2410c]">Edit</button>
                      <button onClick={() => handleDeleteItem(item.id)} className="ml-2 rounded-lg bg-red-500/20 text-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Item Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-black">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-xl hover:text-black/50">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black">Name *</label>
                  <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Item name" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                </div>

                <div>
                  <label className="text-xs font-black">Category *</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black">Price *</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs font-black">Half Price</label>
                    <input type="number" value={formData.half || ''} onChange={(e) => setFormData({...formData, half: Number(e.target.value) || undefined})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-black">Full Price</label>
                    <input type="number" value={formData.full || ''} onChange={(e) => setFormData({...formData, full: Number(e.target.value) || undefined})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-black">Rating</label>
                    <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black">Image URL</label>
                  <div className="mt-1">
                    <div className={`border-2 rounded-xl p-4 ${dragActive ? 'bg-[#ea580c]/10 border-[#ea580c]' : ''} transition`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center text-black/40 py-4">
                          <div className="text-3xl mb-2">📁</div>
                          <div>Drag & drop image here</div>
                          <div className="text-xs mt-1">or click to select</div>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImageUpload(f); }} className="hidden" id="imageUpload" />
                    </div>
                    <input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="mt-2 w-full rounded-xl border px-3 py-2 text-xs" placeholder="Or paste image URL" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" placeholder="Item description..." />
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#ea580c] py-2.5 text-sm font-black text-white hover:bg-[#c2410c] disabled:opacity-60">
                    {saving ? 'Saving…' : (editingItem ? 'Update' : 'Add Item')}
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