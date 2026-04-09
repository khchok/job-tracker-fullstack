import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const statusData: Prisma.StatusCreateInput[] = [
  {
    id: "New",
    sequence: 0,
  },
  {
    id: "Pending Interview",
    sequence: 1,
  },
  {
    id: "Pending Offer",
    sequence: 2,
  },
  {
    id: "Rejected",
    sequence: 3,
  },
  {
    id: "Accepted",
    sequence: 4,
  },
];

const jobData: Prisma.JobCreateInput[] = [
  {
    title: "Software Engineer at Acme",
    company: "Acme",
    location: "San Francisco, CA",
    appliedAt: new Date(),
    url: "https://www.acme.com",
    notes: "I applied for this job on 2026-01-01",
    userId: "1",
    jobStatuses: {
      create: [{ status: { connect: { id: "New" } } }],
    },
  },
  {
    title: "Senior Software Engineer at Acme",
    company: "Google",
    location: "Mountain View, CA",
    appliedAt: new Date(),
    url: "https://www.google.com",
    notes: "I applied for this job on 2026-01-01",
    userId: "1",
    jobStatuses: {
      create: [
        { status: { connect: { id: "New" } }, updatedAt: new Date() },
        { status: { connect: { id: "Pending Interview" } } },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data
  await prisma.job.deleteMany();
  for (const s of statusData) {
    const status = await prisma.status.create({
      data: s,
    });
    console.log(`Created status with id: ${status.id}`);
  }
  for (const j of jobData) {
    const job = await prisma.job.create({
      data: j,
    });
    console.log(`Created job with id: ${job.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
