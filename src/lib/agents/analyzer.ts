import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Discrepancy {
  name: string;           // Short title for the discrepancy
  description: string;    // MOST IMPORTANT: Detailed, actionable description
  severity?: 'High' | 'Medium' | 'Low';
}

export async function analyzeDiscrepancies(
  clientUrl: string,
  clientText: string, 
  officialUrl: string,
  officialText: string
) {
  const prompt = `
    COMPARE:
    OFFICIAL SOURCE: ${officialUrl}
    ${officialText.substring(0, 15000)}

    TARGET CLIENT PAGE: ${clientUrl}
    ${clientText.substring(0, 15000)}

    TASK: Identify FACTUAL discrepancies (Dates, Prices, Services, Location).
    IGNORE: Style, Marketing text.

    OUTPUT JSON directly (in Italian):
    {
      "discrepancies": [
        { "name": "Short label", "description": "Specific detail: Client says X but Official says Y.", "severity": "High"|"Medium"|"Low" }
      ],
      "summary": "1 sentence summary."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
