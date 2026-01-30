import { NextResponse } from 'next/server';
import { tables } from '@/lib/airtable';

// Helper to ensure values are primitives for React rendering
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    // If it's an array of objects (like attachments), handle separately or join
    if (value.length > 0 && typeof value[0] === 'object' && value[0].url) {
      return value[0].url; // Usually for screenshots/attachments
    }
    return value.join(', ');
  }
  if (typeof value === 'object') {
    // This handles the {state, errorType, value, isStale} objects from Airtable
    if ('value' in value) return value.value || '';
    return JSON.stringify(value);
  }
  return value;
}

export async function GET() {
  try {
    const [pagesRecords, productsRecords, discrepanciesRecords] = await Promise.all([
      tables.pages.select().all(),
      tables.products.select().all(),
      tables.discrepancies.select().all(),
    ]);

    const pages = pagesRecords.map(record => ({
      id: record.id,
      client: sanitizeValue(record.get('Client Name')),
      url: record.get('Web Page URL'),
      status: sanitizeValue(record.get('Coerenza Offerta vs Pagina (AI)')) || 'Da verificare',
      discrepancies: record.get('# Discrepancies') || 0,
      lastChecked: record.get('Last Checked Date'),
      screenshot: sanitizeValue(record.get('Screenshot')),
      text: record.get('Trascrizione Testo'),
    }));

    const products = productsRecords.map(record => ({
      id: record.id,
      name: sanitizeValue(record.get('Product or Service Name')),
      description: sanitizeValue(record.get('Reference Page')), 
      price: sanitizeValue(record.get('Price')),
      active: record.get('Active'),
      coherence: sanitizeValue(record.get('Coerenza Web vs Offerta Aziendale (AI)')),
    }));

    const discrepancies = discrepanciesRecords.map(record => ({
      id: record.id,
      name: sanitizeValue(record.get('Name')),
      description: sanitizeValue(record.get('Discrepancy Description')),
      severity: sanitizeValue(record.get('Severity Level')),
      client: sanitizeValue(record.get('Client Name (Lookup)')),
      product: sanitizeValue(record.get('Product/Service Name (Lookup)')),
      date: (record as any)._rawJson?.createdTime || new Date().toISOString(),
      resolved: record.get('Resolved'),
      screenshot: sanitizeValue(record.get('Screenshot')),
    }));

    return NextResponse.json({ pages, products, discrepancies });
  } catch (error: any) {
    console.error('Airtable fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
