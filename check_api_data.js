const axios = require('axios');

async function checkApiData() {
  try {
    const response = await axios.get('http://localhost:3000/api/data');
    console.log('API Data Sample:');
    
    if (response.data.pages && response.data.pages.length > 0) {
      console.log('\n--- Page 0 ---');
      const page = response.data.pages[0];
      Object.keys(page).forEach(key => {
        console.log(`${key}: ${JSON.stringify(page[key])} (${typeof page[key]})`);
      });
    }

    if (response.data.discrepancies && response.data.discrepancies.length > 0) {
      console.log('\n--- Discrepancy 0 ---');
      const disc = response.data.discrepancies[0];
      Object.keys(disc).forEach(key => {
        console.log(`${key}: ${JSON.stringify(disc[key])} (${typeof disc[key]})`);
      });
    }
  } catch (error) {
    console.error('Failed to fetch API data:', error.message);
  }
}

checkApiData();
