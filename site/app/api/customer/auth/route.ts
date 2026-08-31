import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

function getSql() {
  const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
  return neon(conn);
}
function hash(p: string) { return crypto.createHash('sha256').update(p).digest('hex'); }
function genId(prefix='usr') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export async function POST(req: NextRequest) {
  const { action, name, email, phone, password } = await req.json();
  const sql = getSql();
  // Ensure users table exists (idempotent)
  await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE, email TEXT UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;

  if (action === 'signup') {
    if (!name || !email || !phone || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const emailLower = email.toLowerCase().trim();
    const phoneDigits = phone.replace(/\D/g,'');
    const exists = await sql`SELECT id FROM users WHERE email=${emailLower} OR phone=${phoneDigits} LIMIT 1`;
    if (exists.length) return NextResponse.json({ error: 'Email or phone already exists' }, { status: 409 });
    const id = genId('user');
    const pwdHash = hash(password);
    await sql`INSERT INTO users (id, name, phone, email, password_hash, role) VALUES (${id}, ${name}, ${phoneDigits}, ${emailLower}, ${pwdHash}, 'customer')`;
    const token = `cust_${id}_${Date.now()}`;
    const res = NextResponse.json({ success: true, user: { id, name, email: emailLower, phone: phoneDigits } });
    res.cookies.set('customer_session', token, { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'lax', maxAge: 60*60*24*30, path:'/' });
    return res;
  }
  if (action === 'login') {
    if (!email || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    const emailLower = email.toLowerCase().trim();
    const rows: any[] = await sql`SELECT id, name, email, phone, password_hash FROM users WHERE email=${emailLower} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const u = rows[0];
    if (u.password_hash !== hash(password) && u.password_hash !== password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = `cust_${u.id}_${Date.now()}`;
    const res = NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email, phone: u.phone } });
    res.cookies.set('customer_session', token, { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'lax', maxAge: 60*60*24*30, path:'/' });
    return res;
  }
  if (action === 'loginPhone') {
    if (!phone || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    const phoneDigits = phone.replace(/\D/g,'');
    const rows: any[] = await sql`SELECT id, name, email, phone, password_hash FROM users WHERE phone=${phoneDigits} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const u = rows[0];
    if (u.password_hash !== hash(password) && u.password_hash !== password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = `cust_${u.id}_${Date.now()}`;
    const res = NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email, phone: u.phone } });
    res.cookies.set('customer_session', token, { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'lax', maxAge: 60*60*24*30, path:'/' });
    return res;
  }
  if (action === 'me') {
    const token = req.cookies.get('customer_session')?.value;
    if (!token) return NextResponse.json({ user: null });
    const id = token.split('_')[1];
    const rows: any[] = await sql`SELECT id, name, email, phone FROM users WHERE id=${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ user: null });
    return NextResponse.json({ user: rows[0] });
  }
  if (action === 'logout') {
    const res = NextResponse.json({ success: true });
    res.cookies.delete('customer_session');
    return res;
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
