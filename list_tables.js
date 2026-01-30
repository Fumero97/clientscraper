const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

async function listTables() {
  console.log(`Fetching table structure for Base: ${baseId}...`);
  try {
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log('\n✅ Successfully fetched tables!');
    console.log('Tables in this Base:');
    response.data.tables.forEach(table => {
      console.log(`- Name: "${table.name}", ID: ${table.id}`);
      console.log(`  Fields: ${table.fields.map(f => f.name).join(', ')}`);
    });

  } catch (error) {
    console.error('\n❌ Failed to fetch tables!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

listTables();
