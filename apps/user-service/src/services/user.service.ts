import bcrypt from "bcryptjs";
import { User } from "../generated/prisma/browser";
import { Session } from "../generated/prisma/client";
import * as sessionRepository from "../repositories/session.repository";
import * as userRepository from "../repositories/user.repository";
export async function findByEmail(email: string): Promise<User | undefined> {
  return userRepository.findByEmail(email);
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User; session: Session } | undefined> {
  const user = await findByEmail(email);
  if (!user) {
    return undefined;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return undefined;
  }

  const session = await sessionRepository.create(user.id);
  return { user, session };
}
