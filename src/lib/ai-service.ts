interface StudyAnalysis {
  summary: string;
  keyPoints: string[];
  questions: string[];
}

/**
 * Analyzes study content using AI (Groq API)
 */
export async function analyzeStudyContent(text: string): Promise<StudyAnalysis> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('DEBUG: GROQ_API_KEY:', apiKey ? 'LOADED' : 'MISSING');

    if (!apiKey) {
      throw new Error('GROQ API key is missing');
    }

    const model = 'llama-3.1-8b-instant';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `
You are a study assistant.
Return ONLY valid JSON in this format:

{
  "summary": "...",
  "keyPoints": ["..."],
  "questions": ["..."]
}
            `.trim(),
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('--- AI Request Failed ---');
      console.error('Status:', response.status);
      console.error('Body:', errorBody);
      throw new Error(`AI API Error: ${errorBody}`);
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty AI response');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      summary: parsed.summary || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    };

  } catch (error: any) {
    console.error('AI ERROR:', error.message);
    throw error;
  }
}

