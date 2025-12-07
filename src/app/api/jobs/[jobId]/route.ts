import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET a specific job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        assignedTo: true,
        createdBy: true,
        lineItems: true,
        notes: { include: { user: true } },
        photos: { include: { user: true } },
        serviceAlerts: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT - Update a job
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();
    const {
      title,
      description,
      status,
      startDate,
      endDate,
      duration,
      scheduledDate,
      customerName,
      customerAddress,
      customerPhone,
      lineItems,
    } = body;

    const job = await prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(endDate ? { endDate: new Date(endDate) } : {}),
          ...(scheduledDate ? { scheduledDate: new Date(`${scheduledDate}T00:00:00`) } : {}),
          ...(typeof duration === 'number' ? { duration } : {}),
          ...(customerName !== undefined ? { customerName } : {}),
          ...(customerAddress !== undefined ? { customerAddress } : {}),
          ...(customerPhone !== undefined ? { customerPhone } : {}),
        },
      });

      if (Array.isArray(lineItems)) {
        // Replace line items for this job with provided set
        await tx.lineItem.deleteMany({ where: { jobId } });
        if (lineItems.length > 0) {
          await tx.lineItem.createMany({
            data: lineItems.map((item: any) => {
              const quantity = Math.max(1, Number(item.quantity) || 1);
              const rate = typeof item.rate === 'number' ? item.rate : 0;
              return {
                jobId,
                title: item.title || 'Line item',
                description: item.description || '',
                quantity,
                rate,
                total: quantity * rate,
                status: item.status || 'pending',
              };
            }),
          });
        }
      }

      return tx.job.findUnique({
        where: { id: jobId },
        include: {
          assignedTo: true,
          createdBy: true,
          lineItems: true,
          notes: { include: { user: true } },
          photos: { include: { user: true } },
          serviceAlerts: true,
        },
      });
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE a job
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
