import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OfficialFactSheet {
  dates: string[];
  duration: string;
  price: string;
  location: string;
  services: string[];
  rawSummary: string;
}

export async function extractOfficialFacts(text: string, url: string): Promise<OfficialFactSheet> {
  const prompt = `
    TASK: Extract canonical facts from this OFFICIAL STUDY HOLIDAY/CAMPUS page.
    URL: ${url}
    TEXT: ${text.substring(0, 15000)}

    EXTRACT THE FOLLOWING IN ITALIAN:
    1. Dates (specific departure/arrival dates if present)
    2. Duration (e.g., 2 weeks, 15 days)
    3. Price (if present)
    4. Location (specific centre/college)
    5. Key Services (e.g., full board, 15h english)

    OUTPUT JSON directly:
    {
      "dates": ["date1", "date2"],
      "duration": "...",
      "price": "...",
      "location": "...",
      "services": ["...", "..."],
      "rawSummary": "Brief overview"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use a better model for extraction
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content) as OfficialFactSheet;
  } catch (error) {
    console.error('Fact Extraction error:', error);
    return {
      dates: [],
      duration: 'N/A',
      price: 'N/A',
      location: 'N/A',
      services: [],
      rawSummary: 'Extraction failed'
    };
  }
}
