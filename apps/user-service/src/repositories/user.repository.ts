import { User } from "../generated/prisma/browser";
import { Session } from "../generated/prisma/client";
import prisma from "../lib/prisma";

export async function findByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user ?? undefined;
}

export async function createSession(
  userId: string,
  expiresAt?: Date,
): Promise<Session> {
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
  return session ?? undefined;
}
