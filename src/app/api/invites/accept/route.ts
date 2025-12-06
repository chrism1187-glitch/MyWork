import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/invites/accept - Accept an invite and create user
export async function POST(req: NextRequest) {
  try {
    const { token, name } = await req.json();

    if (!token || !name) {
      return NextResponse.json(
        { error: 'Token and name are required' },
        { status: 400 }
      );
    }

    // Find the invite
    const invite = await prisma.invite.findUnique({ where: { token } });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite' },
        { status: 404 }
      );
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invite has already been used' },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create the user with "user" role (not admin)
    const newUser = await prisma.user.create({
      data: {
        email: invite.email,
        name: name,
        role: 'user',
      },
    });

    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'accepted', acceptedAt: new Date() },
    });

    return NextResponse.json({
      user: newUser,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Invite acceptance error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite', details: String(error) },
      { status: 500 }
    );
  }
}
