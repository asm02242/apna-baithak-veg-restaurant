import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IS_VERCEL = process.env.VERCEL === '1';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    const timestamp = Date.now();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    let imageUrl: string;
    
    if (process.env.VERCEL !== '1') {
      // Local development - save to filesystem
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'foods');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `upload-${Date.now()}.${ext}`;
      const filepath = path.join(uploadDir, `upload-${Date.now()}.${ext}`);
      fs.writeFileSync(filepath, buffer);
      return NextResponse.json({ 
        success: true, 
        url: `/images/foods/${path.basename(filepath)}`,
        filename: file.name 
      });
    } else {
      // On Vercel - store in database as base64, serve via API
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
      
      // Create table if not exists
      await sql`
        CREATE TABLE IF NOT EXISTS uploaded_images (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          data_base64 TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      
      await sql`
        INSERT INTO uploaded_images (id, filename, content_type, data_base64)
        VALUES (${`img-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}, ${file.name}, ${file.type}, ${base64})
      `;
      
      return NextResponse.json({ 
        success: true, 
        url: `/api/images/${`img-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}`,
        filename: file.name 
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Serve images from Neon database
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
  }
  
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    const rows = await sql`SELECT content_type, data_base64 FROM uploaded_images WHERE id = ${id} LIMIT 1`;
    
    if (!rows.length) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    const { content_type, data_base64 } = rows[0];
    const buffer = Buffer.from(data_base64, 'base64');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': content_type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}