import { neon } from '@neondatabase/serverless';
import fs from 'fs';
let conn = process.env.DATABASE_URL;
if (!conn) {
  for (const p of ['.env.local','../.env.local']) {
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p,'utf8');
      const m = txt.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
      if (m) { conn=m[1]; break; }
      const m2 = txt.match(/DATABASE_URL\s*=\s*([^\n]+)/);
      if (m2) { conn=m2[1].replace(/"/g,'').trim(); break; }
    }
  }
}
if (!conn) { console.error('no conn'); process.exit(1); }
const sql = neon(conn);
const r = await sql`SELECT key, data FROM app_storage WHERE key='menu.json' LIMIT 1`;
console.log('rows', r.length);
if (r.length) {
  const cats = r[0].data.categories;
  console.log('cats', cats.length, 'items', cats.reduce((a,c)=>a+c.items.length,0));
} else {
  console.log('no menu.json');
  const r2 = await sql`SELECT * FROM app_storage LIMIT 5`;
  console.log(r2);
}
const c = await sql`SELECT COUNT(*)::int as cnt FROM information_schema.tables WHERE table_name='categories'`;
console.log('categories table exists?', c[0].cnt);
