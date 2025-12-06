import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('USER_API_REQUEST: Received request');
    const body = await req.json();
    const { email, name, createIfNotExists } = body;

    console.log('USER_API_REQUEST: Body parsed', { email, name, createIfNotExists });

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    // Try to find existing user
    console.log('USER_API_REQUEST: Attempting to find user with email:', email);
    let user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('USER_API_REQUEST: User lookup result:', user ? 'found' : 'not found');

    // Create if doesn't exist and createIfNotExists flag is true
    if (!user && createIfNotExists) {
      console.log('USER_API_REQUEST: Creating new user');
      user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
      console.log('USER_API_REQUEST: User created:', user?.id);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('USER_API_ERROR:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Failed to process user', 
      details: errorMsg,
      stack: errorStack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
