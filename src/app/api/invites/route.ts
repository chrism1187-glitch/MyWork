import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    // Send email with invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;
    
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'MyWork <onboarding@resend.dev>',
          to: email,
          subject: 'You\'ve been invited to MyWork',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #059669;">Welcome to MyWork!</h1>
              <p>You've been invited to join the MyWork job management platform.</p>
              <p>Click the button below to accept your invitation and create your account:</p>
              <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Accept Invitation</a>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${inviteLink}</p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">This invitation will expire in 7 days.</p>
            </div>
          `,
        });
        console.log(`Email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log(`Email service not configured. Invite link: ${inviteLink}`);
    }

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
