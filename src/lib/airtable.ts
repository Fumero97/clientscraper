import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not defined');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID || 'appf2nVQ59VKwyRjq'
);

export const tables = {
  pages: base('Client Web Pages'),
  products: base('Centres'),
  discrepancies: base('Discrepancy Notes'),
};

// Helper: Calculate similarity between two strings (simple approach)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1.0;
  
  // Simple word overlap similarity
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Check if a similar discrepancy already exists for this page
export async function findSimilarDiscrepancy(
  pageId: string,
  description: string,
  threshold: number = 0.7
): Promise<boolean> {
  try {
    const records = await tables.discrepancies
      .select({
        filterByFormula: `{Client Web Page} = '${pageId}'`
      })
      .all();
    
    for (const record of records) {
      const existingDesc = record.get('Discrepancy Description') as string;
      if (existingDesc) {
        const similarity = calculateSimilarity(description, existingDesc);
        if (similarity >= threshold) {
          console.log(`Duplicate found: ${similarity.toFixed(2)} similarity`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false;
  }
}

// Create a new Discrepancy Note
export async function createDiscrepancyNote(data: {
  name: string;
  description: string;
  pageId: string;
  severity?: string;
}) {
  try {
    const fields: any = {
      'Name': data.name,
      'Discrepancy Description': data.description,
      'Date Detected': new Date().toISOString().split('T')[0],
      'Client Web Page': [data.pageId]
    };

    if (data.severity) {
      fields['Severity Level'] = data.severity;
    }

    const record = await tables.discrepancies.create(fields) as any;
    
    return record.id;
  } catch (error) {
    console.error('Error creating discrepancy note:', error);
    throw error;
  }
}

// Mark a discrepancy as resolved
export async function markDiscrepancyResolved(
  discrepancyId: string,
  notes?: string
) {
  try {
    await tables.discrepancies.update(discrepancyId, {
      'Resolution Notes': notes || 'Risolto'
    });
    
    return true;
  } catch (error) {
    console.error('Error marking discrepancy as resolved:', error);
    throw error;
  }
}

export default base;
