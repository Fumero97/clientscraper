import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Product {
  name: string;
  description: string;
  price: string;
}

export async function analyzeDiscrepancies(pageText: string, products: Product[]) {
  const prompt = `
    You are a professional compliance officer. Compare the following web page content with the official product catalog provided below.
    Identify any discrepancies in pricing, service descriptions, features, or availability.
    
    Official Catalog:
    ${JSON.stringify(products, null, 2)}
    
    Web Page Content (Extracted from Client Site):
    ${pageText.substring(0, 10000)}
    
    Return a VALID JSON array of discrepancies. Format:
    [{ "name": "Short Name", "description": "Detailed difference", "severity": "High/Medium/Low", "product": "Official Product Name" }]
    If no discrepancies are found, return exactly [].
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective and fast
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{"discrepancies": []}';
    const parsed = JSON.parse(content);
    
    // Support both direct array and wrapped object response formats
    return Array.isArray(parsed) ? parsed : (parsed.discrepancies || []);
  } catch (error) {
    console.error('AI Analysis error:', error);
    return [];
  }
}
