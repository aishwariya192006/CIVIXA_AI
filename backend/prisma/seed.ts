import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create Departments
  const deptWater = await prisma.department.upsert({
    where: { name: 'Water Supply' },
    update: {},
    create: { name: 'Water Supply', description: 'Handles water related issues' },
  });

  const deptElec = await prisma.department.upsert({
    where: { name: 'Electricity' },
    update: {},
    create: { name: 'Electricity', description: 'Handles power outages and electrical issues' },
  });

  const deptRoads = await prisma.department.upsert({
    where: { name: 'Roads & Transport' },
    update: {},
    create: { name: 'Roads & Transport', description: 'Handles road maintenance and transport issues' },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@civixa.ai' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@civixa.ai',
      password: passwordHash,
      roleName: 'ADMIN',
    },
  });

  // Create Official
  await prisma.user.upsert({
    where: { email: 'official@civixa.ai' },
    update: {},
    create: {
      fullName: 'Higher Official',
      email: 'official@civixa.ai',
      password: passwordHash,
      roleName: 'OFFICIAL',
    },
  });

  // Create Officers
  await prisma.user.upsert({
    where: { email: 'officer.water@civixa.ai' },
    update: {},
    create: {
      fullName: 'Water Officer',
      email: 'officer.water@civixa.ai',
      password: passwordHash,
      roleName: 'OFFICER',
      departmentId: deptWater.id,
      district: 'Central',
    },
  });

  await prisma.user.upsert({
    where: { email: 'officer.elec@civixa.ai' },
    update: {},
    create: {
      fullName: 'Electricity Officer',
      email: 'officer.elec@civixa.ai',
      password: passwordHash,
      roleName: 'OFFICER',
      departmentId: deptElec.id,
      district: 'North',
    },
  });

  // Create Citizen
  await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      fullName: 'Jane Citizen',
      email: 'citizen@example.com',
      password: passwordHash,
      roleName: 'CITIZEN',
      address: '123 Main St',
      district: 'Central',
      pincode: '10001',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
