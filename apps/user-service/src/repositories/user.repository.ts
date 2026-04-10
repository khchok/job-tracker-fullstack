import { User } from "../generated/prisma/browser";
import prisma from "../lib/prisma";

export async function findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ?? undefined;
}