const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;

async function listBases() {
  console.log('Fetching accessible bases for the provided token...');
  try {
    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log('\n✅ Successfully fetched bases!');
    console.log('Available Bases:');
    response.data.bases.forEach(base => {
      console.log(`- Name: ${base.name}, ID: ${base.id}`);
    });

    const currentBaseId = process.env.AIRTABLE_BASE_ID;
    const found = response.data.bases.find(b => b.id === currentBaseId);
    
    if (found) {
      console.log(`\n🔍 The current Base ID (${currentBaseId}) WAS FOUND in the list.`);
    } else {
      console.log(`\n❌ The current Base ID (${currentBaseId}) WAS NOT FOUND in the list.`);
      console.log('Please update AIRTABLE_BASE_ID in .env.local with one of the IDs above.');
    }

  } catch (error) {
    console.error('\n❌ Failed to fetch bases!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      if (error.response.status === 403) {
        console.log('\n💡 Tip: This token lacks the "schema.bases:read" scope required to list bases.');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

listBases();
