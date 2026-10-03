import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const counts = {
    User: await prisma.user.count(),
    Client: await prisma.client.count(),
    Campaign: await prisma.campaign.count(),
    Lead: await prisma.lead.count(),
    Task: await prisma.task.count(),
    Activity: await prisma.activity.count(),
    Notification: await prisma.notification.count(),
  };

  console.log('Database record counts:');
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(14)} ${count}`);
  }

  const allNonZero = Object.values(counts).every((c) => c > 0);
  if (!allNonZero) {
    throw new Error('One or more tables have zero records');
  }

  console.log('\nAll tables have non-zero record counts.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
