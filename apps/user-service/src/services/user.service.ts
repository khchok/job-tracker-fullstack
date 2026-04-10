import bcrypt from "bcrypt";
import { User } from "../generated/prisma/browser";
import * as userRepository from "../repositories/user.repository";

export async function findByEmail(email: string): Promise<User | undefined> {
  return userRepository.findByEmail(email);
}

export async function signIn(
  email: string,
  password: string,
): Promise<User | undefined> {
  const user = await findByEmail(email);
  if (!user) {
    return undefined;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return undefined;
  }
  return user;
}
