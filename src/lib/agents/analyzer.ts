import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeDiscrepancies(
  clientUrl: string,
  clientText: string, 
  officialUrl: string,
  officialText: string
) {
  const prompt = `
    You are a corporate compliance analyst specializing in reviewing reseller websites.
    Your goal is to compare the "Official Offering" with the "Client Web Page" to ensure factual accuracy.

    **Input Data**:
    1. OFFICIAL OFFERING (Reference):
    - URL: ${officialUrl}
    - Content:
    ${officialText.substring(0, 15000)}

    2. CLIENT WEB PAGE (Reseller):
    - URL: ${clientUrl}
    - Content:
    ${clientText.substring(0, 15000)}

    **Comparison Criteria**:
    Verify the following key elements. Focus ONLY on factual content, ignore style/formatting.
    - **Dates**: Departure/arrival dates, duration, availability periods.
    - **Age**: Allowed age ranges, min/max requirements.
    - **Excursions**: Included trips, frequency, specific destinations.
    - **Addresses**: Exact location of campus/residence.
    - **English Hours**: Weekly hours, course type, certifications.
    - **Other Details**: Accommodation type, meals, transfers, included activities.

    **Output Format**:
    Return a JSON object with the following fields:
    - "discrepancySummary": A concise plain text analysis of discrepancies found (in Italian). If aligned, say "Nessuna discrepanza rilevata."
    - "coherenceScore": One of ["Piena Coerenza", "Discrepanze Minori", "Critico"].
    - "discrepancies": An array of objects [{ "name": "Short Title", "description": "Technical detailed description of the error", "severity": "High/Medium/Low", "actionRecommendation": "Short action for account manager (max 15 words)" }]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      discrepancySummary: "Errore durante l'analisi AI.",
      coherenceScore: "Da verificare",
      discrepancies: []
    };
  }
}
