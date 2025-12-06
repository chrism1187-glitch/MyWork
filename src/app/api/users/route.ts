import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, createIfNotExists } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Create if doesn't exist and createIfNotExists flag is true
    if (!user && createIfNotExists) {
      user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error with user:', error);
    return NextResponse.json({ error: 'Failed to process user' }, { status: 500 });
  }
}
