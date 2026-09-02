import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
  }
  
  try {
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