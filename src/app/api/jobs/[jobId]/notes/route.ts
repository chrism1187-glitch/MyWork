import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Add a note to a job
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();
    const { userId, userEmail, content, isPrivate } = body;

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : userEmail
      ? await prisma.user.findUnique({ where: { email: userEmail } })
      : null;

    if (!user) {
      return NextResponse.json({ error: 'User not found for note' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        jobId,
        userId: user.id,
        content,
        isPrivate: isPrivate || false,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

// GET - Get all notes for a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const notes = await prisma.note.findMany({
      where: { jobId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
