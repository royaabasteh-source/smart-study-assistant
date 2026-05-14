export interface StudyQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'short-answer' | 'long-answer';
  question: string;
  options?: string[];
  answer: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface StudyAnalysis {
  mode: string;
  summary: string;
  keyPoints: string[];
  questions: StudyQuestion[];
  flashcards: Flashcard[];
}

/**
 * Analyzes study content using AI (Groq API)
 */
export async function analyzeStudyContent(
  text: string,
  difficulty: string = 'medium',
  questionType: string = 'short-answer',
  studyMode: string = 'practice'
): Promise<StudyAnalysis> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('GROQ API key is missing');
    }

    const model = 'llama-3.1-8b-instant';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `
You are a study assistant.

Study mode: ${studyMode}
Difficulty level: ${difficulty}
Question type: ${questionType}

Create study material from the user's text.

Return ONLY valid JSON. Do not include markdown, explanations, or code fences.

The JSON must follow exactly this structure:

{
  "mode": "${studyMode}",
  "summary": "string",
  "keyPoints": ["string"],
  "questions": [
    {
      "id": "q1",
      "type": "${questionType}",
      "question": "string",
      "options": ["string"],
      "answer": "string"
    }
  ],
  "flashcards": [
    {
      "id": "c1",
      "front": "string",
      "back": "string"
    }
  ]
}

Rules by mode:
- If studyMode is "summary", focus on summary and keyPoints. Return questions as [] and flashcards as [].
- If studyMode is "practice", return summary, keyPoints, and 5 practice questions. Return flashcards as [].
- If studyMode is "quiz", return summary, keyPoints, and 8 quiz questions. Prefer multiple-choice questions when possible.
- If studyMode is "flashcards", return summary, keyPoints, and 8 flashcards. Return questions as [].

General rules:
- questions must always be an array of objects.
- flashcards must always be an array of objects.
- every question must include id, type, question, and answer.
- for multiple-choice questions, include exactly 4 options and the correct answer.
- for fill-in-the-blank questions, include the sentence with a blank and the missing answer.
- for short-answer questions, include a concise answer.
- for long-answer questions, include a detailed model answer.
- keyPoints must be an array of strings.
- summary must be a string.
`.trim(),
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.2,
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

    const questions: StudyQuestion[] = Array.isArray(parsed.questions)
      ? parsed.questions.map((q: any, index: number) => {
          if (typeof q === 'string') {
            return {
              id: `q${index + 1}`,
              type: questionType as StudyQuestion['type'],
              question: q,
              options: [],
              answer: 'Answer not provided.',
            };
          }

          return {
            id: q.id || `q${index + 1}`,
            type: q.type || questionType,
            question: q.question || '',
            options: Array.isArray(q.options) ? q.options : [],
            answer: q.answer || q.correctAnswer || 'Answer not provided.',
          };
        })
      : [];

    const flashcards: Flashcard[] = Array.isArray(parsed.flashcards)
      ? parsed.flashcards.map((card: any, index: number) => ({
          id: card.id || `c${index + 1}`,
          front: card.front || card.question || '',
          back: card.back || card.answer || '',
        }))
      : [];

    return {
      mode: parsed.mode || studyMode,
      summary: parsed.summary || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      questions,
      flashcards,
    };
  } catch (error: any) {
    console.error('AI ERROR:', error.message);
    throw error;
  }
}