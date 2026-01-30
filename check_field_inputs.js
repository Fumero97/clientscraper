const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

const base = new Airtable({ apiKey }).base(baseId);

async function checkCentroField() {
  try {
    const pages = await base('Client Web Pages').select({ maxRecords: 1 }).all();
    if (pages.length > 0) {
      console.log('Sample Record Fields:');
      console.log('Centro:', pages[0].get('Centro'));
      console.log('Web Page URL:', pages[0].get('Web Page URL'));
      
      // Check if 'Reference page' exists or if it comes from Centro linkage
      // list_tables.js showed 'Centro', but not 'Reference page' explicitly in 'Client Web Pages', 
      // but user prompt says "Centre : Reference page (from centres) (field in airtable)"
      // implying a lookup field that might be named 'Centro' but contains the reference page? 
      // Or maybe the field name is different.
    }
  } catch (err) {
    console.error(err);
  }
}

checkCentroField();
