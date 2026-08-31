'use client';
import { useEffect, useState, useMemo } from 'react';

export interface MenuItem { id:string; title:string; category:string; priceHalf:number; priceFull:number; image:string; isAvailable:boolean; }
export interface BulkOrder { id:string; customerName:string; phone:string; date:string; status:'Pending'|'Approved'|'Completed'; itemsCount:number; totalAmount:number; message:string; }

type ServerCategory = { id:string; name:string; icon:string; items: { id:string; name:string; category:string; categoryId:string; price:number; half?:number; full?:number; image?:string; isAvailable?:boolean }[] };
type ServerBulk = { id:string; name:string; phone:string; quantity:number; deliveryDate:string; createdAt:string; status:'new'|'quoted'|'confirmed'|'completed'|'cancelled'; items:string; message?:string; quotedPrice?:number };

const CATEGORIES = ['Thali','Combos','Chinese Food','Roasted Chaap','Chaap Rolls','Main Course','Momos','Burgers / Snacks','Beverages','Extras'] as const;
const mapServerToUI = (cats: ServerCategory[]): MenuItem[] => cats.flatMap(c=>c.items.map(i=>({ id:i.id, title:i.name, category:c.name, priceHalf: i.half ?? 0, priceFull: i.full ?? i.price, image:i.image||'', isAvailable: (i as any).isAvailable!==false })));
const bulkStatusToUI = (s: ServerBulk['status']): BulkOrder['status'] => s==='new'?'Pending': s==='quoted'?'Approved': s==='confirmed'?'Approved': s==='completed'?'Completed':'Pending';
const uiStatusToServer = (s: BulkOrder['status']): ServerBulk['status'] => s==='Pending'?'new': s==='Approved'?'quoted':'completed';

const Icon={ Search:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg>, Plus:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={p.className} {...p}><path d="M12 5v14M5 12h14"/></svg>, Edit:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>, Trash:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4h8v2"/></svg>, X:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={p.className} {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>, Download:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}><path d="M12 3v13"/><path d="M7 12l5 5 5-5"/><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/></svg>, Menu:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>, Grid:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>, List:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>, Phone:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className} {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5 10.72 19.8 19.8 0 0 1 2 2.18 2 2 0 0 1 4 0h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.7 2.62a2 2 0 0 1-.57 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.57c.84.35 1.72.58 2.62.7A2 2 0 0 1 22 14v2z"/></svg>, Check:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={p.className} {...p}><path d="M5 13l4 4L19 7"/></svg>, Upload:(p:any)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}><path d="M12 16V3"/><path d="M7 8l5-5 5 5"/><path d="M3 16v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg> };

export default function AdminPage(){
  const [activeTab,setActiveTab]=useState<'menu'|'bulk'>('menu');
  const [serverCats,setServerCats]=useState<ServerCategory[]>([]);
  const [menuItems,setMenuItems]=useState<MenuItem[]>([]);
  const [bulkOrders,setBulkOrders]=useState<BulkOrder[]>([]);
  const [search,setSearch]=useState(''); const [categoryFilter,setCategoryFilter]=useState('All'); const [viewMode,setViewMode]=useState<'grid'|'list'>('grid');
  const [isModalOpen,setIsModalOpen]=useState(false); const [editing,setEditing]=useState<MenuItem|null>(null); const [isMobileSidebarOpen,setIsMobileSidebarOpen]=useState(false);
  const [bulkSearch,setBulkSearch]=useState(''); const [bulkStatusFilter,setBulkStatusFilter]=useState<'All'|BulkOrder['status']>('All');
  const [toast,setToast]=useState<string|null>(null); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState<MenuItem>({ id:'', title:'', category:CATEGORIES[0], priceHalf:0, priceFull:0, image:'', isAvailable:true }); const [formErrors,setFormErrors]=useState<Record<string,string>>({});
  const [dragOver,setDragOver]=useState(false); const [uploading,setUploading]=useState(false);
  const hasHalf = form.priceHalf > 0;
  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) { showToast('Only images allowed'); return; }
    if (file.size > 5*1024*1024) { showToast('Max 5MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch('/api/upload', { method:'POST', body: fd });
      const j = await r.json();
      if (j.url) { setForm(f=>({...f, image:j.url})); showToast('Photo uploaded'); }
      else showToast(j.error||'Upload failed');
    } catch { showToast('Upload failed'); }
    setUploading(false);
  };

  const fetchAll=async()=>{
    setLoading(true);
    try{
      const [mRes,bRes]=await Promise.all([fetch('/api/menu',{cache:'no-store'}), fetch('/api/admin/bulk',{cache:'no-store'})]);
      if(mRes.ok){ const d=await mRes.json(); if(d.categories?.length){ setServerCats(d.categories); setMenuItems(mapServerToUI(d.categories)); } }
      if(bRes.ok){ const d=await bRes.json(); const arr: ServerBulk[] = d.bulkOrders||[]; setBulkOrders(arr.map((b:ServerBulk)=>({ id:b.id, customerName:b.name, phone:b.phone, date:(b.deliveryDate||b.createdAt||'').slice(0,10), status: bulkStatusToUI(b.status), itemsCount: b.quantity||0, totalAmount: b.quotedPrice||0, message: b.message? `${b.items} — ${b.message}`: b.items })));}
      else if(bRes.status===401){ // fallback to local bulk fetch via /api/admin/bulk may need auth - show empty
      }
    }catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(()=>{ fetchAll(); },[]);
  // also try admin menu authenticated fetch to get latest edits (overrides public)
  useEffect(()=>{
    fetch('/api/admin/menu',{cache:'no-store'}).then(r=> r.ok? r.json(): null).then(d=>{
      if(d?.categories?.length){ setServerCats(d.categories); setMenuItems(mapServerToUI(d.categories)); }
    }).catch(()=>{});
  },[]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(null),2200); return()=>clearTimeout(t);},[toast]);
  const filteredMenu=useMemo(()=> menuItems.filter(it=>{ const ms= it.title.toLowerCase().includes(search.toLowerCase())|| it.category.toLowerCase().includes(search.toLowerCase()); const mc= categoryFilter==='All'|| it.category===categoryFilter; return ms&&mc; }),[menuItems,search,categoryFilter]);
  const filteredBulk=useMemo(()=> bulkOrders.filter(o=>{ const s=bulkSearch.toLowerCase(); const ms=!s|| o.customerName.toLowerCase().includes(s)|| o.phone.includes(s)|| o.id.toLowerCase().includes(s); const mf= bulkStatusFilter==='All'|| o.status===bulkStatusFilter; return ms&&mf; }),[bulkOrders,bulkSearch,bulkStatusFilter]);
  const stats=useMemo(()=>({ total: menuItems.length, available: menuItems.filter(i=>i.isAvailable).length, pendingBulk: bulkOrders.filter(o=>o.status==='Pending').length, revenue: bulkOrders.reduce((a,b)=>a+b.totalAmount,0), cats: serverCats.length||CATEGORIES.length }),[menuItems,bulkOrders,serverCats]);
  const showToast=(m:string)=>setToast(m);
  const openAdd=()=>{ setEditing(null); setForm({ id:'', title:'', category:CATEGORIES[0], priceHalf:0, priceFull:0, image:'', isAvailable:true }); setFormErrors({}); setIsModalOpen(true); };
  const openEdit=(it:MenuItem)=>{ setEditing(it); setForm({...it}); setFormErrors({}); setIsModalOpen(true); };
  const validate=()=>{ const e:Record<string,string>={}; if(!form.title.trim()) e.title='Title required'; if(!form.category) e.category='Category required'; if(form.priceFull<=0) e.priceFull= hasHalf?'Full price must be >0':'Price must be >0'; if(hasHalf && form.priceHalf<=0) e.priceHalf='Half price must be >0'; if(!form.image.trim()) e.image='Photo required — drag & drop or paste URL'; setFormErrors(e); return Object.keys(e).length===0; };
  const refreshMenu=async()=>{ const r=await fetch('/api/menu',{cache:'no-store'}); const d=await r.json(); if(d.categories){ setServerCats(d.categories); setMenuItems(mapServerToUI(d.categories)); window.dispatchEvent(new Event('menu-updated')); } };
  const handleSave=async()=>{
    if(!validate()) return; setSaving(true);
    try{
      let targetCat = serverCats.find(c=>c.name===form.category);
      if(!targetCat){
        const cr=await fetch('/api/admin/menu',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'addCategory', name:form.category, icon:'🍽️' }) });
        if(!cr.ok) throw new Error('Failed to create category');
        const j=await cr.json(); targetCat = j.category;
        // refetch
        const mr=await fetch('/api/admin/menu',{cache:'no-store'}); const md=await mr.json(); if(md.categories){ setServerCats(md.categories); targetCat = md.categories.find((c:ServerCategory)=>c.name===form.category) || targetCat!; }
      }
      if(editing){
        const res=await fetch('/api/admin/menu',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'updateItem', id:editing.id, name:form.title, price:form.priceFull, half:form.priceHalf, full:form.priceFull, image:form.image, isAvailable:form.isAvailable, category:form.category, categoryId:targetCat!.id }) });
        if(!res.ok) throw new Error('Update failed');
        showToast(`Updated "${form.title}" — live on all devices`);
      } else {
        const res=await fetch('/api/admin/menu',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'addItem', categoryId:targetCat!.id, name:form.title, price:form.priceFull, half:form.priceHalf, full:form.priceFull, image:form.image, isAvailable:form.isAvailable, description:'' }) });
        if(!res.ok) throw new Error('Add failed');
        showToast(`Added "${form.title}" — live on all devices`);
      }
      setIsModalOpen(false); await refreshMenu();
    }catch(e:any){ showToast(e.message||'Server error'); }
    setSaving(false);
  };
  const handleDelete=async(id:string)=>{
    if(!confirm('Delete this dish permanently? Visible to all devices.')) return;
    const res=await fetch(`/api/admin/menu?type=item&id=${encodeURIComponent(id)}`,{ method:'DELETE' });
    if(res.ok){ showToast('Dish deleted — updated on all devices'); await refreshMenu(); } else showToast('Delete failed');
  };
  const toggleAvailable=async(id:string)=>{
    const it=menuItems.find(m=>m.id===id); if(!it) return;
    const prevAvail=it.isAvailable; const nv=!prevAvail; setMenuItems(prev=>prev.map(p=> p.id===id? {...p,isAvailable:nv}:p));
    try{
      const r=await fetch('/api/admin/menu',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'updateItem', id, isAvailable:nv }) });
      if(!r.ok) throw new Error('Failed');
      showToast(nv?'Available ✓':'Unavailable ✓');
      window.dispatchEvent(new Event('menu-updated'));
    }catch(e){
      setMenuItems(prevItems=>prevItems.map(p=> p.id===id? {...p,isAvailable:prevAvail}:p));
      showToast('Save failed — Retry');
    }
  };
  const updateBulkStatus=async(id:string,status:BulkOrder['status'])=>{
    const serverStatus= uiStatusToServer(status);
    setBulkOrders(prev=>prev.map(o=> o.id===id? {...o,status}:o));
    try{
      const r=await fetch('/api/admin/bulk',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'updateStatus', id, status:serverStatus }) });
      if(!r.ok) throw new Error('Failed'); showToast(`Order ${id} → ${status}`);
    }catch(e){ showToast('Status update failed'); fetchAll(); }
  };
  const exportConfig=()=>{ const payload=menuItems; const grouped=CATEGORIES.map(cat=>({ category:cat, items:payload.filter(i=>i.category===cat)})); console.log('%c Apna Baithak — Current Static Config ','background:#ea580c;color:white;font-weight:900;padding:6px 12px;border-radius:8px;'); console.log(JSON.stringify(payload,null,2)); console.groupCollapsed('Grouped by Category'); console.log(JSON.stringify(grouped,null,2)); console.groupEnd(); try{ navigator.clipboard.writeText(JSON.stringify(payload,null,2)); showToast('Config copied & logged to console'); }catch{ showToast('Config logged to console'); } };

  const statusBadge=(s:BulkOrder['status'])=> s==='Pending'?'bg-amber-100 text-amber-800 ring-amber-200': s==='Approved'?'bg-emerald-100 text-emerald-700 ring-emerald-200':'bg-sky-100 text-sky-700 ring-sky-200';

  if(loading) return <div className="min-h-[60vh] grid place-items-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-[#ea580c]"/></div>;

  return (
    <div className="min-h-[calc(100vh-72px)] -m-4 sm:-m-6">
      <div className="sticky top-[57px] z-20 backdrop-blur-xl bg-white/80 border-b border-black/5">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setIsMobileSidebarOpen(v=>!v)} className="lg:hidden grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/5 shadow-sm" aria-label="Toggle sidebar"><Icon.Menu className="h-5 w-5"/></button>
            <div className="flex items-center gap-3"><div className="hidden sm:grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ff7a1a] to-[#ea580c] text-white font-black shadow-lg">AB</div><div><h1 className="font-black leading-none text-[18px] sm:text-xl tracking-tight text-[#1c0a00]">Apna Baithak <span className="font-semibold text-black/40">— Admin</span></h1><p className="text-xs font-medium text-black/50">Pure Veg • Live Server • All devices sync</p></div></div>
          </div>
          <div className="flex items-center gap-2"><div className="hidden md:flex items-center gap-2 text-xs font-bold"><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">{stats.available}/{stats.total} Available</span><span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">{stats.pendingBulk} Pending Bulk</span></div><button onClick={exportConfig} className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-black transition"><Icon.Download className="h-4 w-4"/><span className="hidden sm:inline">Export Current Static Config</span><span className="sm:hidden">Export Config</span></button></div>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex gap-6">
        <aside className={`${isMobileSidebarOpen?'flex':'hidden'} lg:flex w-full lg:w-[300px] shrink-0 flex-col gap-4 lg:sticky lg:top-[137px] lg:h-[calc(100vh-150px)]`}>
          <div className="rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="grid gap-2">
              <button onClick={()=>{setActiveTab('menu');setIsMobileSidebarOpen(false);}} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition ${activeTab==='menu'?'bg-[#ea580c] text-white shadow-lg':'bg-[#fff7ed] text-[#1c0a00] hover:bg-orange-50'}`}><span className={`grid h-10 w-10 place-items-center rounded-xl ${activeTab==='menu'?'bg-white/20':'bg-white ring-1 ring-black/5'}`}>🍔</span><div className="flex-1"><div className="text-sm font-black leading-none">Food Menu Manager</div><div className={`text-xs ${activeTab==='menu'?'text-white/80':'text-black/50'}`}>{filteredMenu.length} dishes • {stats.cats} categories</div></div>{activeTab==='menu'&&<span className="h-2 w-2 rounded-full bg-white animate-pulse"/>}</button>
              <button onClick={()=>{setActiveTab('bulk');setIsMobileSidebarOpen(false);}} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition ${activeTab==='bulk'?'bg-[#111827] text-white shadow-lg':'bg-gray-50 text-[#1c0a00] hover:bg-gray-100'}`}><span className={`grid h-10 w-10 place-items-center rounded-xl ${activeTab==='bulk'?'bg-white/15':'bg-white ring-1 ring-black/5'}`}>📦</span><div className="flex-1"><div className="text-sm font-black leading-none">Bulk Order Tracker</div><div className={`text-xs ${activeTab==='bulk'?'text-white/60':'text-black/50'}`}>{bulkOrders.length} enquiries • ₹{stats.revenue.toLocaleString('en-IN')} pipeline</div></div>{activeTab==='bulk'&&<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"/>}</button>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] p-4 ring-1 ring-orange-100"><div className="text-xs font-black tracking-widest text-[#ea580c]">PURE VEG • SINCE 2021</div><div className="mt-1 text-sm font-bold leading-snug">Server-Powered Admin</div><div className="mt-1 text-xs text-black/60">Edits here are saved to server (Vercel /tmp + DB) and instantly visible on all devices via /api/menu.</div><div className="mt-3 flex gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black ring-1 ring-black/5">Server sync</span><span className="rounded-full bg-[#16a34a] px-2.5 py-1 text-[11px] font-black text-white">Live</span></div></div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4 ring-1 ring-black/5"><div className="text-xs font-bold text-black/40">Total Dishes</div><div className="text-2xl font-black">{stats.total}</div><div className="text-xs font-semibold text-emerald-600">{stats.available} available</div></div><div className="rounded-2xl bg-white p-4 ring-1 ring-black/5"><div className="text-xs font-bold text-black/40">Bulk Orders</div><div className="text-2xl font-black">{bulkOrders.length}</div><div className="text-xs font-semibold text-amber-600">{stats.pendingBulk} pending</div></div></div>
        </aside>
        <main className="min-w-0 flex-1">
          {activeTab==='menu'? (
            <div className="space-y-4">
              <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1"><Icon.Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by food title or category..." className="h-11 w-full rounded-xl border border-black/10 bg-[#fffdf8] pl-10 pr-4 text-sm font-medium outline-none placeholder:text-black/30 focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100"/></div>
                    <div className="flex items-center gap-2"><button onClick={()=>setViewMode(viewMode==='grid'?'list':'grid')} className="grid h-11 w-11 place-items-center rounded-xl bg-white ring-1 ring-black/10 hover:bg-black hover:text-white transition" title="Toggle view">{viewMode==='grid'?<Icon.List className="h-5 w-5"/>:<Icon.Grid className="h-5 w-5"/>}</button><button onClick={openAdd} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ea580c] px-5 text-sm font-black text-white shadow-md hover:bg-[#c2410c] transition"><Icon.Plus className="h-4 w-4"/>Add New Dish</button></div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">{['All',...CATEGORIES].map(cat=><button key={cat} onClick={()=>setCategoryFilter(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ring-1 transition ${categoryFilter===cat?'bg-[#ea580c] text-white ring-[#ea580c] shadow':'bg-white text-black/70 ring-black/10 hover:bg-[#fff7ed]'}`}>{cat}</button>)}</div>
              </div>
              <div className="flex items-center justify-between px-1"><p className="text-sm font-semibold text-black/60">Showing <span className="font-black text-black">{filteredMenu.length}</span> of {menuItems.length} dishes{categoryFilter!=='All'&&<span className="ml-1">in <span className="text-[#ea580c]">{categoryFilter}</span></span>}</p><span className="hidden sm:inline text-xs font-bold text-black/40">Server-synced • toggle or edit instantly</span></div>
              {filteredMenu.length===0? <div className="rounded-[22px] bg-white p-12 text-center ring-1 ring-black/5"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-xl">🔍</div><h3 className="mt-4 font-black">No dishes found</h3><p className="mt-1 text-sm text-black/50">Try a different search or category.</p><button onClick={()=>{setSearch('');setCategoryFilter('All');}} className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white">Clear filters</button></div>
              : viewMode==='grid'? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{filteredMenu.map(item=>(
                <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="relative h-44 overflow-hidden bg-[#fff7ed]">
                    {/* eslint-disable @next/next/no-img-element */}<img src={item.image||'/placeholder.svg'} alt={item.title} className="h-full w-full object-cover group-hover:scale-[1.04] transition duration-500" onError={e=>((e.target as HTMLImageElement).src=`https://picsum.photos/seed/${encodeURIComponent(item.id)}/600/400`)}/>
                    <div className="absolute left-3 top-3 flex gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 backdrop-blur ${item.isAvailable?'bg-emerald-500 text-white ring-emerald-600':'bg-white/90 text-black/60 ring-black/10'}`}>{item.isAvailable?'● Available':'○ Unavailable'}</span></div>
                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black ring-1 ring-black/5 backdrop-blur">{item.category}</div>
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between"><span className="rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">{item.priceHalf>0 && item.priceHalf!==item.priceFull? <>Half ₹{item.priceHalf} • Full ₹{item.priceFull}</>: <>₹{item.priceFull}</>}</span><label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" checked={item.isAvailable} onChange={()=>toggleAvailable(item.id)} className="peer sr-only"/><div className="peer h-7 w-12 rounded-full bg-white/90 ring-1 ring-black/10 peer-checked:bg-emerald-500 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5"/></label></div>
                  </div>
                  <div className="p-4 flex flex-1 flex-col"><h3 className="font-black leading-tight line-clamp-1">{item.title}</h3><p className="mt-1 text-xs font-mono text-black/40">{item.id}</p><div className="mt-3 flex gap-2"><button onClick={()=>openEdit(item)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#fff7ed] px-3 py-2.5 text-sm font-bold ring-1 ring-orange-200 hover:bg-[#ea580c] hover:text-white transition"><Icon.Edit className="h-4 w-4"/>Edit</button><button onClick={()=>handleDelete(item.id)} className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-white ring-1 ring-black/10 hover:bg-red-50 hover:text-red-600 hover:ring-red-200 transition"><Icon.Trash className="h-4 w-4"/></button></div></div>
                </div> ))}</div>
              : <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-black/5 shadow-sm"><div className="divide-y divide-black/5">{filteredMenu.map(item=>(
                <div key={item.id} className="flex gap-4 p-4 hover:bg-[#fffdf8] transition">
                  <img src={item.image||'/placeholder.svg'} alt={item.title} className="h-16 w-20 shrink-0 rounded-xl object-cover ring-1 ring-black/5" onError={e=>((e.target as HTMLImageElement).src=`https://picsum.photos/seed/${encodeURIComponent(item.id)}/200/200`)}/>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold leading-none">{item.title}</h4><span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-black ring-1 ring-orange-100">{item.category}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${item.isAvailable?'bg-emerald-50 text-emerald-700 ring-emerald-200':'bg-gray-100 text-black/50 ring-black/10'}`}>{item.isAvailable?'Available':'Unavailable'}</span></div><p className="mt-1 text-xs font-mono text-black/40">{item.id}</p><p className="mt-1 text-sm font-black">{item.priceHalf>0 && item.priceHalf!==item.priceFull? <><span className="text-black/50 font-semibold">Half</span> ₹{item.priceHalf} <span className="mx-1 text-black/20">•</span> <span className="text-black/50 font-semibold">Full</span> ₹{item.priceFull}</>: <>₹{item.priceFull}</>}</p></div>
                  <div className="flex shrink-0 flex-col gap-2 self-center"><label className="relative inline-flex cursor-pointer items-center self-end"><input type="checkbox" checked={item.isAvailable} onChange={()=>toggleAvailable(item.id)} className="peer sr-only"/><div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5"/></label><div className="flex gap-2"><button onClick={()=>openEdit(item)} className="rounded-xl bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ea580c]">Edit</button><button onClick={()=>handleDelete(item.id)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/10 hover:bg-red-50 hover:text-red-600">Delete</button></div></div>
                </div> ))}</div></div>
              }
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between"><h2 className="font-black text-lg flex items-center gap-2">📦 Bulk Order Tracker <span className="rounded-full bg-black px-2.5 py-1 text-xs font-black text-white">{bulkOrders.length}</span></h2><div className="flex gap-2 w-full sm:w-auto"><div className="relative flex-1 sm:w-64"><Icon.Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30"/><input value={bulkSearch} onChange={e=>setBulkSearch(e.target.value)} placeholder="Search customer, phone, ID..." className="h-10 w-full rounded-xl border border-black/10 bg-gray-50 pl-9 pr-3 text-sm font-medium outline-none focus:border-black focus:ring-4 focus:ring-black/5"/></div><select value={bulkStatusFilter} onChange={e=>setBulkStatusFilter(e.target.value as any)} className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none"><option value="All">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Completed">Completed</option></select></div></div>
                <div className="mt-4 grid grid-cols-3 gap-3">{(['Pending','Approved','Completed'] as const).map(s=>{ const cnt=bulkOrders.filter(o=>o.status===s).length; return <div key={s} className={`rounded-2xl p-3 ring-1 ${s==='Pending'?'bg-amber-50 ring-amber-200':s==='Approved'?'bg-emerald-50 ring-emerald-200':'bg-sky-50 ring-sky-200'}`}><div className="text-xs font-bold opacity-60">{s}</div><div className="text-xl font-black">{cnt}</div></div>;})}</div>
              </div>
              <div className="hidden lg:block overflow-hidden rounded-[22px] bg-white ring-1 ring-black/5 shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="bg-[#fff7ed] text-left text-xs font-black uppercase tracking-widest text-black/50"><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Date</th><th className="px-5 py-4 text-center">Guests</th><th className="px-5 py-4 text-right">Total</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-black/5">{filteredBulk.map(o=>(
                <tr key={o.id} className="hover:bg-[#fffdf8] transition"><td className="px-5 py-4"><div className="font-bold leading-none">{o.customerName}</div><div className="mt-1 text-xs font-mono text-black/40">{o.id}</div><div className="mt-1 max-w-[260px] truncate text-xs text-black/60" title={o.message}>{o.message}</div></td><td className="px-5 py-4"><a href={`tel:${o.phone}`} className="inline-flex items-center gap-1.5 font-bold text-[#ea580c] hover:underline"><Icon.Phone className="h-3.5 w-3.5"/>{o.phone}</a></td><td className="px-5 py-4 font-medium whitespace-nowrap">{o.date? new Date(o.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}): '-'}</td><td className="px-5 py-4 text-center"><span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-black text-white">{o.itemsCount} guests</span></td><td className="px-5 py-4 text-right font-black">₹{o.totalAmount.toLocaleString('en-IN')}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusBadge(o.status)}`}>{o.status}</span></td><td className="px-5 py-4"><div className="flex justify-end"><select value={o.status} onChange={e=>updateBulkStatus(o.id,e.target.value as BulkOrder['status'])} className="rounded-xl border border-black/10 bg-white px-2.5 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-black/5"><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Completed">Completed</option></select></div></td></tr>
              ))}{filteredBulk.length===0&&<tr><td colSpan={7} className="px-5 py-12 text-center text-black/50">No bulk orders match filters.</td></tr>}</tbody></table></div></div>
              <div className="grid lg:hidden gap-3">{filteredBulk.map(o=>(
                <div key={o.id} className="rounded-[22px] bg-white p-4 ring-1 ring-black/5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{o.customerName}</div><div className="text-xs font-mono text-black/40">{o.id} • {o.date}</div></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusBadge(o.status)}`}>{o.status}</span></div><div className="mt-3 flex flex-wrap gap-2 text-xs"><a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 font-bold text-[#ea580c] ring-1 ring-orange-200"><Icon.Phone className="h-3.5 w-3.5"/>{o.phone}</a><span className="rounded-full bg-black px-3 py-1.5 font-black text-white">{o.itemsCount} guests</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 font-black text-emerald-700 ring-1 ring-emerald-200">₹{o.totalAmount.toLocaleString('en-IN')}</span></div><p className="mt-3 text-sm leading-snug text-black/70">{o.message}</p><div className="mt-3 flex gap-2"><select value={o.status} onChange={e=>updateBulkStatus(o.id,e.target.value as BulkOrder['status'])} className="flex-1 rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none"><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Completed">Completed</option></select><a href={`tel:${o.phone}`} className="rounded-xl bg-[#ea580c] px-4 py-2.5 text-sm font-black text-white">Call</a></div></div>
              ))}</div>
            </div>
          )}
        </main>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)}/><div className="relative w-full max-w-[560px] max-h-[90vh] overflow-hidden rounded-[26px] bg-white shadow-2xl animate-pop flex flex-col"><div className="flex items-center justify-between border-b border-black/5 px-6 py-5"><div><h3 className="font-black text-lg leading-none">{editing?'Edit Dish':'Add New Dish'}</h3><p className="mt-1 text-xs font-medium text-black/50">Changes save to server and appear on all devices</p></div><button onClick={()=>setIsModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 ring-1 ring-black/5 hover:bg-black hover:text-white transition"><Icon.X className="h-5 w-5"/></button></div>
          <div className="overflow-y-auto p-6 space-y-4">
            <div className="flex gap-4 rounded-2xl bg-[#fff7ed] p-4 ring-1 ring-orange-100"><img src={form.image||`https://picsum.photos/seed/${encodeURIComponent(form.title||'preview')}/200/200`} alt="preview" className="h-20 w-20 rounded-xl object-cover ring-1 ring-black/5 bg-white" onError={e=>((e.target as HTMLImageElement).src=`https://picsum.photos/seed/preview/200/200`)}/><div className="min-w-0"><div className="font-black leading-tight">{form.title||'Dish Title'}</div><div className="text-xs font-bold text-black/50">{form.category}</div><div className="mt-1 text-sm font-black">{form.priceHalf?`Half ₹${form.priceHalf} • `:''}Full ₹{form.priceFull||0}</div><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-black ring-1 ${form.isAvailable?'bg-emerald-500 text-white ring-emerald-600':'bg-white text-black/50 ring-black/10'}`}>{form.isAvailable?'Available':'Unavailable'}</span></div></div>
            <div><label className="text-xs font-black tracking-widest text-black/60">TITLE / FOOD NAME *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g., Malai Chaap" className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold outline-none focus:ring-4 ${formErrors.title?'border-red-300 focus:border-red-400 focus:ring-red-100':'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}/>{formErrors.title&&<p className="mt-1 text-xs font-bold text-red-600">{formErrors.title}</p>}</div>
            <div><label className="text-xs font-black tracking-widest text-black/60">CATEGORY *</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold outline-none focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100">{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div>
              <div className="flex items-center justify-between"><label className="text-xs font-black tracking-widest text-black/60">PRICE MODE</label><span className="text-xs font-bold text-black/40">{hasHalf?'Half & Full':'Single Price'}</span></div>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                <button type="button" onClick={()=>setForm(f=>({...f,priceHalf:0}))} className={`rounded-lg py-2 text-sm font-black transition ${!hasHalf?'bg-white shadow ring-1 ring-black/5 text-black':'text-black/60 hover:text-black'}`}>Single Price</button>
                <button type="button" onClick={()=>setForm(f=>({...f,priceHalf: f.priceHalf|| Math.round((f.priceFull||200)/2)}))} className={`rounded-lg py-2 text-sm font-black transition ${hasHalf?'bg-[#ea580c] text-white shadow':'text-black/60 hover:text-black'}`}>Half & Full</button>
              </div>
            </div>
            {hasHalf ? (
              <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-black tracking-widest text-black/60">MRP HALF (₹) *</label><input type="number" min={0} value={form.priceHalf} onChange={e=>setForm(f=>({...f,priceHalf:Number(e.target.value)||0}))} className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-bold outline-none focus:ring-4 ${formErrors.priceHalf?'border-red-300 focus:ring-red-100':'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}/>{formErrors.priceHalf&&<p className="mt-1 text-xs font-bold text-red-600">{formErrors.priceHalf}</p>}</div><div><label className="text-xs font-black tracking-widest text-black/60">MRP FULL (₹) *</label><input type="number" min={0} value={form.priceFull} onChange={e=>setForm(f=>({...f,priceFull:Number(e.target.value)||0}))} className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-bold outline-none focus:ring-4 ${formErrors.priceFull?'border-red-300 focus:ring-red-100':'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}/>{formErrors.priceFull&&<p className="mt-1 text-xs font-bold text-red-600">{formErrors.priceFull}</p>}</div></div>
            ) : (
              <div><label className="text-xs font-black tracking-widest text-black/60">PRICE (₹) *</label><input type="number" min={0} value={form.priceFull} onChange={e=>setForm(f=>({...f,priceHalf:0,priceFull:Number(e.target.value)||0}))} className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-bold outline-none focus:ring-4 ${formErrors.priceFull?'border-red-300 focus:ring-red-100':'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}/>{formErrors.priceFull&&<p className="mt-1 text-xs font-bold text-red-600">{formErrors.priceFull}</p>}<p className="mt-1 text-xs text-black/40">Thali, rolls, momos — single price items use this</p></div>
            )}
            <div>
              <label className="text-xs font-black tracking-widest text-black/60">PHOTO * — DRAG & DROP UPLOAD</label>
              <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false); const f=e.dataTransfer.files?.[0]; if(f) uploadPhoto(f);}} className={`mt-1.5 relative rounded-xl border-2 border-dashed bg-white p-4 transition ${dragOver?'border-[#ea580c] bg-orange-50':'border-black/10 hover:border-black/20'} ${uploading?'opacity-60 pointer-events-none':''}`}>
                <input type="file" accept="image/*" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadPhoto(f); e.currentTarget.value=''; }} />
                <div className="pointer-events-none flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${dragOver?'bg-[#ea580c] text-white':'bg-[#fff7ed] text-[#ea580c] ring-1 ring-orange-100'}`}><Icon.Upload className="h-5 w-5"/></div>
                  <div className="flex-1"><div className="text-sm font-black">{uploading?'Uploading...': dragOver?'Drop image here':'Drag & drop photo or click to browse'}</div><div className="text-xs text-black/50">PNG, JPG, WebP up to 5MB — auto-optimized</div></div>
                  <span className="hidden sm:inline rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">Browse</span>
                </div>
                {uploading && <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-sm rounded-xl"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-[#ea580c]"/></div>}
              </div>
              <input value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} placeholder="or paste image URL / /images/foods/....jpg" className={`mt-2 h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium outline-none focus:ring-4 ${formErrors.image?'border-red-300 focus:ring-red-100':'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}/>{formErrors.image&&<p className="mt-1 text-xs font-bold text-red-600">{formErrors.image}</p>}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-black/5"><div><div className="text-sm font-black">Available for ordering</div><div className="text-xs text-black/50">Toggle off to hide without deleting</div></div><label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" checked={form.isAvailable} onChange={e=>setForm(f=>({...f,isAvailable:e.target.checked}))} className="peer sr-only"/><div className="peer h-7 w-12 rounded-full bg-gray-300 peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5"/></label></div>
          </div>
          <div className="flex gap-3 border-t border-black/5 bg-gray-50 px-6 py-4"><button onClick={()=>setIsModalOpen(false)} className="flex-1 rounded-xl bg-white px-5 py-3 text-sm font-black ring-1 ring-black/10 hover:bg-gray-100">Cancel</button><button onClick={handleSave} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#c2410c] disabled:opacity-60"><Icon.Check className="h-4 w-4"/>{saving?'Saving...': editing?'Save Changes':'Add Dish'}</button></div>
        </div></div>
      )}
      {toast && <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">✓</span>{toast}</div>}
      <style>{`@keyframes pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}.animate-pop{animation:pop .18s ease-out}`}</style>
    </div>
  );
}
function slug(s:string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
