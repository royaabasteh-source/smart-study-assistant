import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function PATCH(req: Request) {
  try {
    const { id, fileName } = await req.json();

    if (!id || !fileName) {
      return NextResponse.json(
        { error: 'ID and fileName are required.' },
        { status: 400 }
      );
    }

    await db.collection('analyses').doc(id).update({
      fileName,
    });

    return NextResponse.json({
      success: true,
      message: 'Analysis renamed successfully.',
    });
  } catch (error) {
    console.error('Rename analysis error:', error);

    return NextResponse.json(
      { error: 'Failed to rename analysis.' },
      { status: 500 }
    );
  }
}