import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing analysis id' },
        { status: 400 }
      );
    }

    await db.collection('analyses').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete analysis error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { fileName } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing analysis id' },
        { status: 400 }
      );
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    await db.collection('analyses').doc(id).update({
      fileName: fileName.trim(),
    });

    return NextResponse.json({
      success: true,
      id,
      fileName: fileName.trim(),
    });
  } catch (error: any) {
    console.error('Rename analysis error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to rename analysis' },
      { status: 500 }
    );
  }
}