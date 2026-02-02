import { NextResponse } from 'next/server';
import { scrapeWebPage } from '@/lib/agents/scraper';
import { extractOfficialFacts, OfficialFactSheet } from '@/lib/agents/factExtractor';
import { analyzeDiscrepancies } from '@/lib/agents/analyzer';
import { tables, createDiscrepancyNote, findSimilarDiscrepancy } from '@/lib/airtable';

export async function POST(request: Request) {
  const { pageId } = await request.json();
  
  try {
    // 1. Get record from Airtable
    const pageRecord = await tables.pages.find(pageId);
    if (!pageRecord) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const clientUrl = pageRecord.get('Web Page URL') as string;
    const clientName = pageRecord.get('Client Name') as string;
    const centreIds = pageRecord.get('Centres') as string[];
    
    // Get Reference Page URL
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

    // --- STEP 2: LOAD OR EXTRACTION OFFICIAL FACTS ---
    let officialFacts: OfficialFactSheet | null = null;
    let centreRecord = null;

    if (centreIds && centreIds.length > 0) {
      try {
        centreRecord = await tables.products.find(centreIds[0]);
        const cachedData = centreRecord.get('Official Data Cache') as string;
        if (cachedData) {
          try {
            officialFacts = JSON.parse(cachedData);
            console.log(`📦 Using cached facts for centre: ${centreRecord.get('Product or Service Name')}`);
          } catch (e) {
            console.warn('Failed to parse cached data, re-extracting...');
          }
        }
      } catch (e) {
        console.warn('Could not find or read centre record for caching');
      }
    }

    // --- STEP 3: FETCH PREVIOUS RESOLUTIONS (MEMORY) ---
    const previousDiscrepancies = await tables.discrepancies.select({
      filterByFormula: `AND({Client Web Page} = '${pageId}', NOT({Resolution Notes} = ''))`
    }).all();
    
    const previousResolutions = previousDiscrepancies
      .map(d => ({
        description: d.get('Discrepancy Description') as string,
        resolution: d.get('Resolution Notes') as string
      }))
      .filter(d => d.resolution);

    // 4. Scrape and Extract if not cached
    const clientScraped = await scrapeWebPage(clientUrl);
    
    if (!officialFacts) {
      console.log(`🌐 Scraping official page for facts: ${officialUrl}`);
      const officialScraped = await scrapeWebPage(officialUrl);
      officialFacts = await extractOfficialFacts(officialScraped.text, officialUrl);
      
      // Save to cache if possible
      if (centreRecord && officialFacts) {
        try {
          await tables.products.update(centreRecord.id, {
            'Official Data Cache': JSON.stringify(officialFacts)
          });
          console.log('✅ Official facts saved to Airtable cache.');
        } catch (e) {
          console.warn('Could not save to Airtable cache.');
        }
      }
    }

    // 5. Analyze with Comparison Agent (passing memory)
    console.log('🤖 Running AI comparison with memory...');
    const analysis = await analyzeDiscrepancies(
      clientUrl,
      clientScraped.text,
      officialUrl,
      officialFacts,
      previousResolutions
    );
    
    console.log(`📊 Analysis complete: ${analysis.discrepancies.length} discrepancies found`);
    
    // 5. Create individual Discrepancy Notes (with duplicate prevention)
    let createdCount = 0;
    let skippedCount = 0;
    
    if (analysis.discrepancies && Array.isArray(analysis.discrepancies)) {
      for (const discrepancy of analysis.discrepancies) {
        const isDuplicate = await findSimilarDiscrepancy(pageId, discrepancy.description);
        
        if (isDuplicate) {
          skippedCount++;
          continue;
        }
        
        try {
          await createDiscrepancyNote({
            name: discrepancy.name,
            description: discrepancy.description,
            pageId: pageId
          });
          createdCount++;
        } catch (err) {
          console.error(`❌ Failed to create discrepancy: ${discrepancy.name}`, err);
        }
      }
    }
    
    // 6. Update page record
    const dateOnly = new Date().toISOString().split('T')[0];
    await tables.pages.update(pageId, {
      'Last Checked Date': dateOnly
    });

    return NextResponse.json({ 
      success: true, 
      newDiscrepanciesCount: createdCount,
      skippedDuplicates: skippedCount,
      summary: analysis.summary
    });

  } catch (error: any) {
    console.error('❌ Scan failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

