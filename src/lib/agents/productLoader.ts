import { scrapeWebPage } from './scraper';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractProductDetails(sourceUrl?: string, rawText?: string) {
  let content = rawText || '';
  
  if (sourceUrl && !rawText) {
    const scraped = await scrapeWebPage(sourceUrl);
    content = scraped.text;
  }

  const prompt = `
    TASK: Extract products/services from text.
    SOURCE:
    ${content.substring(0, 12000)}
    
    OUTPUT JSON:
    [{ "name": "Exact Name", "description": "Short desc", "price": "Price string or null" }]
    
    If nothing found: []
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const respContent = response.choices[0].message.content || '{"products": []}';
    const parsed = JSON.parse(respContent);
    return Array.isArray(parsed) ? parsed : (parsed.products || []);
  } catch (error) {
    console.error('Extraction error:', error);
    return [];
  }
}
