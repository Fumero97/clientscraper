import { NextResponse } from 'next/server';
import { tables } from '@/lib/airtable';

export async function GET() {
  try {
    const [pagesRecords, productsRecords, discrepanciesRecords] = await Promise.all([
      tables.pages.select().all(),
      tables.products.select().all(),
      tables.discrepancies.select().all(),
    ]);

    const pages = pagesRecords.map(record => ({
      id: record.id,
      client: record.get('Client Name'),
      url: record.get('Web Page URL'),
      status: record.get('Stato Revisione'),
      discrepancies: record.get('# Discrepancies') || 0,
      lastChecked: record.get('Last Checked Date'),
      screenshot: record.get('Screenshot'),
      text: record.get('Trascrizione Testo'),
    }));

    const products = productsRecords.map(record => ({
      id: record.id,
      name: record.get('Product or Service Name'),
      description: record.get('Description'),
      price: record.get('Price'),
      active: record.get('Active'),
      coherence: record.get('Coerenza Web vs Offerta Aziendale (AI)'),
    }));

    const discrepancies = discrepanciesRecords.map(record => ({
      id: record.id,
      name: record.get('Name'),
      description: record.get('Discrepancy Description'),
      severity: record.get('Severity Level'),
      client: record.get('Client Name'),
      product: record.get('Product/Service Name'),
      date: record.get('Date') || (record as any)._rawJson?.createdTime || new Date().toISOString(),
      resolved: record.get('Resolved'),
      screenshot: record.get('Screenshot'),
    }));

    return NextResponse.json({ pages, products, discrepancies });
  } catch (error: any) {
    console.error('Airtable fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
