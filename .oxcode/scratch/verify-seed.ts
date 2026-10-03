import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../.env')].find(
  (p) => fs.existsSync(p)
);
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const clientCount = await prisma.client.count();
  const campaignCount = await prisma.campaign.count();
  const leadCount = await prisma.lead.count();
  const taskCount = await prisma.task.count();
  const activityCount = await prisma.activity.count();
  const notificationCount = await prisma.notification.count();

  console.log('Record counts:');
  console.log(`  Users:         ${userCount}`);
  console.log(`  Clients:       ${clientCount}`);
  console.log(`  Campaigns:     ${campaignCount}`);
  console.log(`  Leads:         ${leadCount}`);
  console.log(`  Tasks:         ${taskCount}`);
  console.log(`  Activities:    ${activityCount}`);
  console.log(`  Notifications: ${notificationCount}`);

  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true, passwordHash: true },
  });

  console.log('\nUsers:');
  for (const user of users) {
    const valid = bcrypt.compareSync('NexLevr@2025', user.passwordHash);
    console.log(`  ${user.email} | ${user.name} | ${user.role} | password valid: ${valid}`);
  }

  const leadStatuses = await prisma.lead.groupBy({ by: ['status'], _count: { status: true } });
  console.log('\nLead status distribution:');
  for (const group of leadStatuses) {
    console.log(`  ${group.status}: ${group._count.status}`);
  }

  const taskStatuses = await prisma.task.groupBy({ by: ['status'], _count: { status: true } });
  console.log('\nTask status distribution:');
  for (const group of taskStatuses) {
    console.log(`  ${group.status}: ${group._count.status}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
