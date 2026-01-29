import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not defined');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID || 'appf2nVQ59VKwyRjq'
);

export const tables = {
  pages: base('Pages'),
  products: base('Products Reference'),
  discrepancies: base('Discrepancy Notes'),
};

export default base;
