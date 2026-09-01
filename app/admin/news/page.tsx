'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/admin/news');
      const data = await res.json();
      if (data.news) setNews(data.news);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const action = editingNews ? 'update' : 'add';
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, news: formData }),
      });
      
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingNews(null);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news post?')) return;
    try {
      await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
      fetchNews();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, active: !active }),
      });
      fetchNews();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      image: item.image || '',
      active: item.active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      image: '',
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
          <h1 className="font-display text-3xl font-black">News & Updates</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">
            + Add News
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-black text-lg">News Posts ({news.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-xs font-bold text-black/50">
                  <th className="p-3">Image</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Content</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-[#f7f7f7]">
                    <td className="p-3">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-12 w-20 rounded-lg object-cover" />
                      ) : (
                        <div className="h-12 w-20 rounded-lg bg-[#f7f7f7] flex items-center justify-center text-black/30">No image</div>
                      )}
                    </td>
                    <td className="p-3 font-bold max-w-[200px] truncate">{item.title}</td>
                    <td className="p-3 text-xs text-black/60 max-w-[300px] truncate">{item.content}</td>
                    <td className="p-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={item.active} onChange={(e) => {
                          fetch('/api/admin/news', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'toggle', id: item.id, active: !item.active }),
                          }).then(() => window.location.reload());
                        }} />
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.active ? 'bg-[#16a34a] text-white' : 'bg-red-500/20 text-red-600'}`}>
                          {item.active ? 'Published' : 'Draft'}
                        </span>
                      </label>
                    </td>
                    <td className="p-3 text-xs text-black/60">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => { setFormData({ title: item.title, content: item.content, image: item.image || '', active: item.active }); setShowForm(true); }} className="rounded-lg bg-[#ea580c] px-3 py-1.5 text-xs font-black text-white hover:bg-[#c2410c]">Edit</button>
                      <button onClick={() => { if (confirm('Delete?')) fetch(`/api/admin/news?id=${item.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }} className="ml-2 rounded-lg bg-red-500/20 text-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30">Delete</button>
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
                <h2 className="font-display text-xl font-black">{editingNews ? 'Edit News' : 'Add News'}</h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-xl hover:text-black/50">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black">Title *</label>
                  <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="News title" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                </div>

                <div>
                  <label className="text-xs font-black">Image URL</label>
                  <input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="text-xs font-black">Content *</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={6} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" required />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                  <label htmlFor="active" className="text-sm">Published</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button>
                  <button type="submit" className="flex-1 rounded-xl bg-[#ea580c] py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">
                    {editingNews ? 'Update' : 'Publish'}
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
  // This will be handled by the form's onSubmit or cancel
}