import { NextResponse } from 'next/server';
import { tables } from '@/lib/airtable';

// Helper to ensure values are primitives for React rendering
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object' && value[0].url) {
      return value[0].url; // For screenshots
    }
    return value.join(', ');
  }
  if (typeof value === 'object') {
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


    // Fetch all centres to create a lookup map
    const centresRecords = await tables.products.select().all();
    const centresMap = new Map(
      centresRecords.map(record => [
        record.id,
        sanitizeValue(record.get('Product or Service Name'))
      ])
    );

    // Map discrepancies to pages to calculate accurate counts
    const discrepancyCounts = new Map<string, number>();
    
    discrepanciesRecords.forEach(record => {
      const pageIds = record.get('Client Web Page') as string[];
      // Check resolved status using our robust logic
      const isResolved = record.get('Resolved') || !!record.get('Resolution Notes');
      
      if (Array.isArray(pageIds) && !isResolved) {
        pageIds.forEach(id => {
          const current = discrepancyCounts.get(id) || 0;
          discrepancyCounts.set(id, current + 1);
        });
      }
    });

    const pages = pagesRecords.map(record => {
      const centreIds = record.get('Centres');
      let centreName = 'N/A';
      
      if (Array.isArray(centreIds) && centreIds.length > 0) {
        // Get the first centre name from the map
        centreName = centresMap.get(centreIds[0]) || 'N/A';
      }
      
      // Use our calculated count instead of the Airtable field
      const calculatedCount = discrepancyCounts.get(record.id) || 0;
      
      return {
        id: record.id,
        client: sanitizeValue(record.get('Client Name')),
        url: record.get('Web Page URL'),
        centres: centreName,
        discrepancies: calculatedCount,
        lastChecked: record.get('Last Checked Date'),
      };
    });

    // Updated to use 'Centres' fields
    const products = productsRecords.map(record => ({
      id: record.id,
      name: sanitizeValue(record.get('Product or Service Name')), // Assuming this field exists or needs checking
      description: sanitizeValue(record.get('Reference Page')), 
      price: 'N/A', // 'Price' field not in Centres based on list_tables.js
      active: true, // No 'Active' field in Centres
      coherence: sanitizeValue(record.get('Coerenza Web vs Offerta Aziendale (AI)')),
    }));

    const discrepancies = discrepanciesRecords.map(record => ({
      id: record.id,
      name: sanitizeValue(record.get('Name')),
      description: sanitizeValue(record.get('Discrepancy Description')),
      severity: sanitizeValue(record.get('Severity Level')), // Might be missing based on list_tables.js?
      client: sanitizeValue(record.get('Client Web Page')), // Using Link field
      product: sanitizeValue(record.get('Product or Service')), // Using Link field
      date: (record as any)._rawJson?.createdTime || new Date().toISOString(),
      resolved: record.get('Resolved') || !!record.get('Resolution Notes'),
      screenshot: sanitizeValue(record.get('Screenshot')),
    }));

    return NextResponse.json({ pages, products, discrepancies });
  } catch (error: any) {
    console.error('Airtable fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
