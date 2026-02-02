import { NextResponse } from 'next/server';
import { scrapeWebPage } from '@/lib/agents/scraper';
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
    console.log(`🔍 Scanning: ${clientName}`);
    console.log(`   Client URL: ${clientUrl}`);
    console.log(`   Official URL: ${officialUrl}`);

    const [clientScraped, officialScraped] = await Promise.all([
      scrapeWebPage(clientUrl),
      scrapeWebPage(officialUrl)
    ]);
    
    // 3. Analyze with Comparison Agent
    console.log('🤖 Running AI comparison...');
    const analysis = await analyzeDiscrepancies(
      clientUrl,
      clientScraped.text,
      officialUrl,
      officialScraped.text
    );
    
    console.log(`📊 Analysis complete: ${analysis.discrepancies.length} discrepancies found`);
    
    // 4. Create individual Discrepancy Notes (with duplicate prevention)
    let createdCount = 0;
    let skippedCount = 0;
    
    if (analysis.discrepancies && Array.isArray(analysis.discrepancies)) {
      for (const discrepancy of analysis.discrepancies) {
        // Check for duplicates
        const isDuplicate = await findSimilarDiscrepancy(
          pageId,
          discrepancy.description
        );
        
        if (isDuplicate) {
          console.log(`⏭️  Skipping duplicate: "${discrepancy.name}"`);
          skippedCount++;
          continue;
        }
        
        // Create new discrepancy note
        try {
          await createDiscrepancyNote({
            name: discrepancy.name,
            description: discrepancy.description,
            pageId: pageId,
            severity: discrepancy.severity
          });
          
          createdCount++;
          console.log(`✅ Created: "${discrepancy.name}" (${discrepancy.severity})`);
        } catch (err) {
          console.error(`❌ Failed to create discrepancy: ${discrepancy.name}`, err);
        }
      }
    }
    
    // 5. Update page record
    const dateOnly = clientScraped.timestamp.split('T')[0];
    
    // Note: '# Discrepancies' is a computed field in Airtable (Count), so we don't need to update it manually.
    // It will automatically reflect the number of linked records.

    await tables.pages.update(pageId, {
      'Last Checked Date': dateOnly
    });

    console.log(`\n📝 Summary:`);
    console.log(`   Created: ${createdCount} new discrepancies`);
    console.log(`   Skipped: ${skippedCount} duplicates`);

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
