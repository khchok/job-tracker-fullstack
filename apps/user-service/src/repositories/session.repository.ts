import { Session } from "../generated/prisma/client";
import prisma from "../lib/prisma";

export async function findByJti(jti: string): Promise<Session | undefined> {
  const session = await prisma.session.findUnique({
    where: { id: jti, expiresAt: { gt: new Date() } },
  });
  return session ?? undefined;
}

export async function updateExpiresAt(
  jti: string,
  expiresAt: Date,
): Promise<Session> {
  const updatedSession = await prisma.session.update({
    where: { id: jti },
    data: { expiresAt },
  });
  return updatedSession ?? undefined;
}

export async function deleteByJti(jti: string): Promise<void> {
  await prisma.session.delete({ where: { id: jti } });
}

export async function create(
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
