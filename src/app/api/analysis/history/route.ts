import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('analyses')
      .where('userId', '==', userId)
      .limit(20)
      .get();

    const analyses = snapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

return NextResponse.json({ analyses });
  } catch (error: any) {
    console.error('Fetch analysis history error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch analysis history' },
      { status: 500 }
    );
  }
}