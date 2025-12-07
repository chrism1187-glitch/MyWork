import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) where.assignedToId = userId;
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        lineItems: true,
        notes: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        photos: true,
        serviceAlerts: true,
        durationChangeRequests: {
          where: { status: 'pending' },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Add hasPendingDurationRequest flag to each job
    const jobsWithFlags = jobs.map(job => ({
      ...job,
      hasPendingDurationRequest: job.durationChangeRequests.length > 0,
    }));

    return NextResponse.json(jobsWithFlags);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      scheduledDate,
      assignedToId,
      assignedToEmail,
      createdById,
      createdByEmail,
      lineItems,
      duration,
    } = body;

    const assigneeId = assignedToId
      ? assignedToId
      : assignedToEmail
      ? (await prisma.user.findUnique({ where: { email: assignedToEmail } }))?.id
      : undefined;
    const creatorId = createdById
      ? createdById
      : createdByEmail
      ? (await prisma.user.findUnique({ where: { email: createdByEmail } }))?.id
      : undefined;

    if (!assigneeId || !creatorId) {
      return NextResponse.json(
        { error: 'Missing assignedTo or createdBy user. Seed the database or provide valid emails.' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        assignedToId: assigneeId,
        createdById: creatorId,
        duration: duration || 1,
        lineItems: {
          create: (lineItems || []).map((item: any) => ({
            ...item,
            total: item.quantity * item.rate,
          })),
        },
      },
      include: {
        assignedTo: true,
        lineItems: true,
        notes: true,
        photos: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
