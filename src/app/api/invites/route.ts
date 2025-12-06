import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// POST /api/invites - Create a new invite
export async function POST(req: NextRequest) {
  try {
    const { email, createdBy } = await req.json();

    if (!email || !createdBy) {
      return NextResponse.json(
        { error: 'Email and createdBy are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if invite already exists and is pending
    const existingInvite = await prisma.invite.findFirst({
      where: { email, status: 'pending' },
    });

    if (existingInvite) {
      // Regenerate token for existing pending invite
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const updatedInvite = await prisma.invite.update({
        where: { id: existingInvite.id },
        data: { token, expiresAt },
      });

      return NextResponse.json(updatedInvite);
    }

    // Create new invite
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        createdBy,
        expiresAt,
      },
    });

    // In production, send email with invite link
    // For now, just return the token
    console.log(`Invite link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${token}`);

    return NextResponse.json(invite);
  } catch (error) {
    console.error('Invite creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invite', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/invites - List pending invites
export async function GET(req: NextRequest) {
  try {
    const invites = await prisma.invite.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites', details: String(error) },
      { status: 500 }
    );
  }
}
