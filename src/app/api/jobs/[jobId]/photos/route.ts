import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// POST - Upload a photo to a job
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const userEmail = formData.get('userEmail') as string;
    const caption = formData.get('caption') as string;

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : userEmail
      ? await prisma.user.findUnique({ where: { email: userEmail } })
      : null;

    if (!file || !user) {
      return NextResponse.json(
        { error: 'Missing file or user context' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, buffer);

    // Create photo record in database
    const photo = await prisma.photo.create({
      data: {
        jobId,
        userId: user.id,
        url: `/uploads/${filename}`,
        caption: caption || undefined,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// GET - Get all photos for a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const photos = await prisma.photo.findMany({
      where: { jobId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
