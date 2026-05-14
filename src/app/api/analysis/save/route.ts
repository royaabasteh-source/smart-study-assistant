import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();

       const {
  userId,
  userEmail,
  fileName,
  summary,
  keyPoints,
  questions,
  flashcards,
  studyMode,
  difficulty,
  questionType,
} = body;
if (!userId || typeof userId !== 'string') {
  return NextResponse.json(
    { error: 'User ID is required' },
    { status: 400 }
  );
}

        if (!summary || !Array.isArray(keyPoints) || !Array.isArray(questions)) {
            return NextResponse.json(
                { error: 'Invalid analysis data' },
                { status: 400 }
            );
        }

        const docRef = await db.collection('analyses').add({
            userId,
userEmail: userEmail || null,
flashcards: Array.isArray(flashcards) ? flashcards : [],
studyMode: studyMode || 'practice',
difficulty: difficulty || 'medium',
questionType: questionType || 'short-answer',
            fileName: fileName || 'Untitled document',
            summary,
            keyPoints,
            questions,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            id: docRef.id,
        });
    } catch (error: any) {
        console.error('Save analysis error:', error);

        return NextResponse.json(
            { error: error.message || 'Failed to save analysis' },
            { status: 500 }
        );
    }
}