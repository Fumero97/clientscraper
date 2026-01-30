const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function testConnection() {
  console.log('Testing Airtable connection with REAL schema names...');
  try {
    console.log('\nChecking "Client Web Pages" table...');
    const pages = await base('Client Web Pages').select({ maxRecords: 1 }).all();
    console.log('✅ Success! Found', pages.length, 'records in Client Web Pages.');
    
    console.log('\nChecking "Products/Services" table...');
    const products = await base('Products/Services').select({ maxRecords: 1 }).all();
    console.log('✅ Success! Found', products.length, 'records in Products/Services.');

    console.log('\nChecking "Discrepancy Notes" table...');
    const discrepancies = await base('Discrepancy Notes').select({ maxRecords: 1 }).all();
    console.log('✅ Success! Found', discrepancies.length, 'records in Discrepancy Notes.');

    console.log('\n🎉 ALL TABLES ACCESSIBLE! The issue was the table names.');

  } catch (error) {
    console.error('\n❌ Airtable connection failed!');
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.error);
    console.error('Message:', error.message);
  }
}

testConnection();
