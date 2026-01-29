import { NextResponse } from 'next/server';
import { scrapeWebPage } from '@/lib/agents/scraper';
import { analyzeDiscrepancies } from '@/lib/agents/analyzer';
import { tables } from '@/lib/airtable';

// Cloudinary is deactivated as per user request
// import { uploadScreenshot } from '@/lib/cloudinary';

export async function POST(request: Request) {
  const { pageId } = await request.json();
  
  try {
    // 1. Get record from Airtable
    const pageRecord = await tables.pages.find(pageId);
    if (!pageRecord) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const url = pageRecord.get('Web Page URL') as string;

    // 2. Fetch products for analysis
    const productsRecords = await tables.products.select().all();
    const products = productsRecords.map(r => ({
      name: r.get('Product or Service Name') as string,
      description: r.get('Description') as string,
      price: r.get('Price') as string,
    }));

    // 3. Scrape
    const scraped = await scrapeWebPage(url);
    
    // 4. Cloudinary upload skipped (User request)
    const imageUrl = ''; 

    // 5. Analyze with real OpenAI
    const newDiscrepancies = await analyzeDiscrepancies(scraped.text, products);
    
    // 6. Update Airtable Page record
    const pageUpdates: any = {
      'Trascrizione Testo': scraped.text,
      'Last Checked Date': scraped.timestamp,
      'Stato Revisione': 'Verificata'
    };
    
    // Skip screenshot attachment since Cloudinary is disabled
    // if (imageUrl) {
    //   pageUpdates['Screenshot'] = [{ url: imageUrl }];
    // }

    await tables.pages.update(pageId, pageUpdates);
    
    // 7. Add new discrepancies to Airtable
    for (const d of newDiscrepancies) {
      const discData: any = {
        'Name': d.name,
        'Discrepancy Description': d.description,
        'Severity Level': d.severity,
        'Client Name': [pageId],
        'Resolved': false
      };

      await tables.discrepancies.create(discData);
    }

    return NextResponse.json({ success: true, newDiscrepanciesCount: newDiscrepancies.length });
  } catch (error: any) {
    console.error('Scan failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
