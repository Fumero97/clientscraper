import { NextResponse } from 'next/server';
import { tables } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

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
    // Handle Airtable specific object structures if any
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
    
    // Create a lookup for Client Name by Page ID
    const clientNameMap = new Map<string, string>();
    // Create a lookup for Centre Name by Page ID
    const pageIdToCentreNameMap = new Map<string, string>();

    pagesRecords.forEach(record => {
      const clientName = sanitizeValue(record.get('Client Name'));
      clientNameMap.set(record.id, clientName);
      
      const centreIds = record.get('Centres');
      if (Array.isArray(centreIds) && centreIds.length > 0) {
        const firstCentreName = centresMap.get(centreIds[0]);
        if (firstCentreName) {
          pageIdToCentreNameMap.set(record.id, firstCentreName);
        }
      }
    });

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

    const pages = pagesRecords
      .map(record => {
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
          url: sanitizeValue(record.get('Web Page URL')), // Added sanitization
          centres: centreName,
          discrepancies: calculatedCount,
          lastChecked: record.get('Last Checked Date'),
          createdTime: (record as any)._rawJson?.createdTime, // For sorting
        };
      })
      .sort((a, b) => {
        // Sort by createdTime descending (newest first)
        const dateA = new Date(a.createdTime || 0).getTime();
        const dateB = new Date(b.createdTime || 0).getTime();
        return dateB - dateA; 
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

    const discrepancies = discrepanciesRecords.map(record => {
      // Resolve Client Name and Centre Name from Linked Page ID
      const pageIds = record.get('Client Web Page') as string[];
      let clientName = null;
      let centreName = null;
      
      if (Array.isArray(pageIds) && pageIds.length > 0) {
        const pageId = pageIds[0];
        clientName = clientNameMap.get(pageId);
        centreName = pageIdToCentreNameMap.get(pageId);
      }

      return {
        id: record.id,
        name: sanitizeValue(record.get('Name')),
        description: sanitizeValue(record.get('Discrepancy Description')),
        severity: sanitizeValue(record.get('Severity Level')), 
        client: clientName || sanitizeValue(record.get('Client Web Page')), 
        product: centreName || sanitizeValue(record.get('Product or Service')), // Resolved Name or Fallback
        date: (record as any)._rawJson?.createdTime || new Date().toISOString(),
        resolved: record.get('Resolved') || !!record.get('Resolution Notes'),
        screenshot: sanitizeValue(record.get('Screenshot')),
      };
    });

    return NextResponse.json({ pages, products, discrepancies });
  } catch (error: any) {
    console.error('Airtable fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
