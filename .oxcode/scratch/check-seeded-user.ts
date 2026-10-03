import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: 'admin@nexlevr.com' } });
  console.log('User found:', !!user);
  if (user) {
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Password hash prefix:', user.passwordHash.substring(0, 30));

    const password = 'NexLevr@2025';
    const match = await bcrypt.compare(password, user.passwordHash);
    console.log('Password matches NexLevr@2025:', match);

    const match2 = await bcrypt.compare('password123', user.passwordHash);
    console.log('Password matches password123:', match2);
  }
  const count = await prisma.user.count();
  console.log('Total users:', count);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
