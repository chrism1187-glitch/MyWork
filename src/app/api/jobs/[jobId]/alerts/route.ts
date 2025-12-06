import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Twilio SMS Helper (conditionally enabled if credentials exist)
async function sendSMSAlert(alert: any, jobTitle: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const recipientPhoneNumber = process.env.ALERT_RECIPIENT_PHONE;

  // Only send if Twilio is configured
  if (!accountSid || !authToken || !twilioPhoneNumber || !recipientPhoneNumber) {
    console.warn('Twilio SMS not configured - skipping SMS alert');
    return;
  }

  try {
    const client = require('twilio')(accountSid, authToken);
    const message = `MyWork Alert: ${alert.title}\nJob: ${jobTitle}\nSeverity: ${alert.severity}\nDetails: ${alert.description || 'N/A'}`;
    
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: recipientPhoneNumber,
    });
    
    console.log('SMS alert sent successfully');
  } catch (error) {
    console.error('Error sending SMS alert:', error);
    // Don't throw - alert was still created even if SMS fails
  }
}

// POST - Create a service alert
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();
    const { title, description, severity } = body;

    // Get job details for SMS
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true, assignedTo: { select: { phone: true } } },
    });

    const alert = await prisma.serviceAlert.create({
      data: {
        jobId,
        title,
        description: description || undefined,
        severity: severity || 'normal',
      },
    });

    // Send SMS if configured and job has assignee with phone
    if (job?.assignedTo?.phone) {
      await sendSMSAlert(alert, job.title);
    }

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating service alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// GET - Get all service alerts for a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const alerts = await prisma.serviceAlert.findMany({
      where: { jobId },
      orderBy: { sentAt: 'desc' },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
