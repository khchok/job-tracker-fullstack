import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";

const pool = new PrismaPg({ connectionString: process.env.USER_SERVICE_DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const userData: Pick<Prisma.UserCreateInput, "name" | "email">[] = [
  {
    name: "Alice",
    email: "alice@job-tracker.com",
  },
  {
    name: "Bob",
    email: "bob@job-tracker.com",
  },
  {
    name: "Charlie",
    email: "charlie@job-tracker.com",
  },
];

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data
  await prisma.user.deleteMany();

  for (const u of userData) {
    const pwHash = await bcrypt.hash("password", 10);
    const user = await prisma.user.create({
      data: { ...u, passwordHash: pwHash },
    });
    console.log(`Created user with id: ${user.id}`);
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
