import { NextResponse } from 'next/server';
import { extractProductDetails } from '@/lib/agents/productLoader';
import { tables } from '@/lib/airtable';

export async function POST(request: Request) {
  const { url, text } = await request.json();
  
  try {
    const extracted = await extractProductDetails(url, text);
    
    for (const p of extracted) {
      await tables.products.create({
        'Product or Service Name': p.name,
        'Reference Page': url
      });
    }

    return NextResponse.json({ success: true, count: extracted.length });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
