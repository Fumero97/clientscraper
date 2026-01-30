import { NextResponse } from 'next/server';
import { scrapeWebPage } from '@/lib/agents/scraper';
import { analyzeDiscrepancies } from '@/lib/agents/analyzer';
import { tables } from '@/lib/airtable';

export async function POST(request: Request) {
  const { pageId } = await request.json();
  
  try {
    // 1. Get record from Airtable
    const pageRecord = await tables.pages.find(pageId);
    if (!pageRecord) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const clientUrl = pageRecord.get('Web Page URL') as string;
    
    // Get Reference Page URL (Lookup field returns array)
    const refPageValue = pageRecord.get('Reference Page (from Centres)');
    let officialUrl = '';
    
    if (Array.isArray(refPageValue) && refPageValue.length > 0) {
      officialUrl = refPageValue[0];
    } else if (typeof refPageValue === 'string') {
      officialUrl = refPageValue;
    }

    if (!officialUrl) {
      return NextResponse.json({ error: 'Reference Page URL missing in Airtable record.' }, { status: 400 });
    }

    // 2. Double Scrape (Parallel)
    console.log(`Scraping Client: ${clientUrl}`);
    console.log(`Scraping Official: ${officialUrl}`);

    const [clientScraped, officialScraped] = await Promise.all([
      scrapeWebPage(clientUrl),
      scrapeWebPage(officialUrl)
    ]);
    
    // 3. Analyze with Comparator Agent
    const analysis = await analyzeDiscrepancies(
      clientUrl,
      clientScraped.text,
      officialUrl,
      officialScraped.text
    );
    
    // 4. Update Airtable Page record
    const pageUpdates: any = {
      'Trascrizione Testo': clientScraped.text,
      'Last Checked Date': clientScraped.timestamp,
      'Discrepancy Summary (AI)': analysis.discrepancySummary,
      'Coerenza Offerta vs Pagina (AI)': analysis.coherenceScore
    };
    
    await tables.pages.update(pageId, pageUpdates);
    
    // 5. Add new discrepancies to Airtable
    let createdDiscrepancies = 0;
    if (analysis.discrepancies && Array.isArray(analysis.discrepancies)) {
      for (const d of analysis.discrepancies) {
        const discData: any = {
          'Name': d.name,
          'Discrepancy Description': d.description,
          'Severity Level': d.severity,
          'Client Web Page': [pageId],
          'Action Recommendation (AI)': d.actionRecommendation,
          'Resolved': false
        };

        await tables.discrepancies.create(discData);
        createdDiscrepancies++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      newDiscrepanciesCount: createdDiscrepancies,
      summary: analysis.discrepancySummary
    });

  } catch (error: any) {
    console.error('Scan failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
