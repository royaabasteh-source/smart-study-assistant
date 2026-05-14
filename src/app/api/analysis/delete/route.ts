import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required.' },
        { status: 400 }
      );
    }

    await db.collection('analyses').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully.',
    });
  } catch (error) {
    console.error('Delete analysis error:', error);

    return NextResponse.json(
      { error: 'Failed to delete analysis.' },
      { status: 500 }
    );
  }
}