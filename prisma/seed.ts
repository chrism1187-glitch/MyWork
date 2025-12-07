import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data...');

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'John Smith',
      phone: '(412) 555-0123',
      company: '3 Rivers Painting',
      role: 'user',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Sarah Johnson',
      phone: '(412) 555-0456',
      company: '3 Rivers Painting',
      role: 'admin',
    },
  });

  // Create demo jobs
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const job1 = await prisma.job.create({
    data: {
      title: 'Interior Painting - Kitchen',
      description: 'Full kitchen interior painting project with prep work and trim',
      status: 'in-progress',
      scheduledDate: today,
      duration: 2,
      customerName: 'Mike Anderson',
      customerAddress: '123 Oak Street, Pittsburgh, PA 15213',
      customerPhone: '(412) 555-7890',
      assignedToId: user1.id,
      createdById: user2.id,
      lineItems: {
        create: [
          {
            title: 'Wall Prep & Priming',
            description: 'Clean, sand, and prime all walls',
            quantity: 1,
            rate: 500,
            total: 500,
          },
          {
            title: 'Wall Painting',
            description: 'Paint walls with 2 coats',
            quantity: 1,
            rate: 750,
            total: 750,
          },
          {
            title: 'Trim & Ceilings',
            description: 'Paint trim and ceiling',
            quantity: 1,
            rate: 400,
            total: 400,
          },
        ],
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Exterior Painting - House',
      description: 'Full house exterior repaint including siding and trim',
      status: 'pending',
      scheduledDate: tomorrow,
      duration: 5,
      customerName: 'Jennifer Wilson',
      customerAddress: '456 Maple Avenue, Pittsburgh, PA 15232',
      customerPhone: '(412) 555-3456',
      assignedToId: user1.id,
      createdById: user2.id,
      lineItems: {
        create: [
          {
            title: 'Surface Prep',
            description: 'Power wash, scrape, and prep all surfaces',
            quantity: 1,
            rate: 1200,
            total: 1200,
          },
          {
            title: 'Primer Application',
            description: 'Apply primer coat',
            quantity: 1,
            rate: 800,
            total: 800,
          },
          {
            title: 'Paint Application',
            description: 'Apply 2 coats of exterior paint',
            quantity: 1,
            rate: 2000,
            total: 2000,
          },
        ],
      },
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Cabinet Refinishing',
      description: 'Sand and refinish kitchen cabinets',
      status: 'pending',
      scheduledDate: nextWeek,
      duration: 3,
      customerName: 'Robert Davis',
      customerAddress: '789 Pine Road, Pittsburgh, PA 15206',
      customerPhone: '(412) 555-1122',
      assignedToId: user1.id,
      createdById: user2.id,
      lineItems: {
        create: [
          {
            title: 'Cabinet Removal',
            description: 'Remove all cabinet doors and hardware',
            quantity: 1,
            rate: 300,
            total: 300,
          },
          {
            title: 'Sanding & Prep',
            description: 'Sand all surfaces and prep for staining',
            quantity: 1,
            rate: 600,
            total: 600,
          },
          {
            title: 'Staining & Sealing',
            description: 'Apply stain and polyurethane seal',
            quantity: 1,
            rate: 800,
            total: 800,
          },
        ],
      },
    },
  });

  // Add a demo note
  await prisma.note.create({
    data: {
      jobId: job1.id,
      userId: user2.id,
      content: 'Customer requested specific paint color - Benjamin Moore Aura in Pale Oak. Make sure to use the sample they approved.',
      isPrivate: false,
    },
  });

  console.log('✅ Demo data created successfully!');
  console.log(`- Created ${[user1, user2].length} users`);
  console.log(`- Created ${[job1, job2, job3].length} jobs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
