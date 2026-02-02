import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import { OfficialFactSheet } from './factExtractor';

export interface Discrepancy {
  name: string;           // Short title for the discrepancy
  description: string;    // MOST IMPORTANT: Detailed, actionable description
}

export async function analyzeDiscrepancies(
  clientUrl: string,
  clientText: string, 
  officialUrl: string,
  officialFacts: OfficialFactSheet
) {
  const prompt = `
    COMPARE:
    
    OFFICIAL SOURCE OF TRUTH (Fact Sheet from ${officialUrl}):
    - Date: ${officialFacts.dates.join(', ')}
    - Durata: ${officialFacts.duration}
    - Prezzo: ${officialFacts.price}
    - Location: ${officialFacts.location}
    - Servizi: ${officialFacts.services.join(', ')}
    - Altre info: ${officialFacts.rawSummary}

    TARGET CLIENT PAGE (${clientUrl}):
    ${clientText.substring(0, 15000)}

    TASK: Identify FACTUAL discrepancies. 
    Focus on:
    - Dates (Are they the same? Or does the client page show dates not in the official list?)
    - Duration (Does it match the official stay period?)
    - Location/College (Is it the correct campus?)
    - Inclusion (Meals, hours of study, etc.)

    CRITICAL: If the official source mentions multiple dates and the client shows one of them, it is NOT a discrepancy unless the client explicitly excludes the others.
    
    OUTPUT JSON directly (in Italian):
    {
      "discrepancies": [
        { "name": "...", "description": "Specific detail in Italian. Mention exactly what's on the client page vs official facts." }
      ],
      "summary": "1 sentence summary."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    return {
      discrepancies: result.discrepancies || [],
      summary: result.summary || "Analisi completata."
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      discrepancies: [],
      summary: "Errore durante l'analisi AI."
    };
  }
}

