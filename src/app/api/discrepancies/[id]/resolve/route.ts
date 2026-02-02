import { NextResponse } from 'next/server';
import { markDiscrepancyResolved, tables } from '@/lib/airtable';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { notes } = body;

    // Mark discrepancy as resolved
    await markDiscrepancyResolved(id, notes);

    // Get the page ID to update discrepancy count
    const discRecord = await tables.discrepancies.find(id);
    const pageLinks = discRecord.get('Client Web Page') as string[];
    
    if (pageLinks && pageLinks.length > 0) {
      // We don't need to manually update '# Discrepancies' as it is a computed field in Airtable.
      // The resolving logic is handled by the 'Resolved' field or 'Resolution Notes' content.
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking discrepancy as resolved:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
