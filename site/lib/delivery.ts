import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
function getSql(){ return neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!); }
export async function ensureDeliveryTables(){
  const sql=getSql();
  await sql`CREATE TABLE IF NOT EXISTS delivery_partners (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL, email TEXT UNIQUE, password_hash TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, is_online BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS delivery_assignments (id TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE, delivery_partner_id TEXT NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED','ACCEPTED','PICKED_UP','ON_THE_WAY','ARRIVED','DELIVERED','CANCELLED')), assigned_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS delivery_locations (id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL REFERENCES delivery_assignments(id) ON DELETE CASCADE, partner_id TEXT NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS delivery_otps (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, assignment_id TEXT NOT NULL REFERENCES delivery_assignments(id) ON DELETE CASCADE, otp_hash TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, attempts INT NOT NULL DEFAULT 0, verified BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS delivery_payments (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, partner_id TEXT NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE, amount INT NOT NULL, method TEXT NOT NULL CHECK (method IN ('cash','razorpay_qr','online')), collected_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE INDEX IF NOT EXISTS idx_delivery_assignments_partner ON delivery_assignments(delivery_partner_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_delivery_locations_assignment ON delivery_locations(assignment_id)`;
}
export function getDeliveryPartnerId(req: NextRequest): string | null {
  const t=req.cookies.get('delivery_session')?.value;
  if(!t||!t.startsWith('delivery_')) return null;
  return t.split('_')[1]||null;
}
export async function verifyDeliverySession(req: NextRequest){
  const id=getDeliveryPartnerId(req);
  if(!id) return null;
  const sql=getSql();
  await ensureDeliveryTables();
  const rows:any[] = await sql`SELECT id, name, phone, email, is_active, is_online FROM delivery_partners WHERE id=${id} LIMIT 1`;
  if(!rows.length || !rows[0].is_active) return null;
  return rows[0];
}
export async function verifyAdminSession(req: NextRequest){
  const t=req.cookies.get('admin_session')?.value;
  if(!t||!t.startsWith('admin_')) return null;
  const sql=getSql();
  const adminId=t.split('_')[1];
  if(!adminId) return null;
  // Check Neon admins table first, fallback to app_storage
  try{
    const rows:any[] = await sql`SELECT id FROM admins WHERE id=${adminId} LIMIT 1`;
    if(rows.length) return {id:adminId};
  }catch{}
  // fallback to storage
  try{
    const { storage } = await import('@/data/storage');
    const admins=await storage.getAdminsAsync();
    return admins.find((a:any)=>a.id===adminId)||null;
  }catch{ return null; }
}
export function getCustomerId(req: NextRequest): string | null {
  const t=req.cookies.get('customer_session')?.value;
  if(!t) return null;
  return t.split('_')[1]||null;
}
