const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

async function testDataApi() {
  console.log('Testing direct Data API access for "Pages" table...');
  try {
    const response = await axios.get(`https://api.airtable.com/v0/${baseId}/Pages?maxRecords=1`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log('\n✅ Success! Data API is working.');
    console.log('Sample record from Pages:', JSON.stringify(response.data.records[0], null, 2));

  } catch (error) {
    console.error('\n❌ Data API failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.log('\n💡 CONFIRMED: Your token has access to the BASE, but is missing the SCOPE "data.records:read".');
        console.log('Please edit your token on Airtable and add the "data.records:read" scope.');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDataApi();
