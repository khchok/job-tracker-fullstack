import * as sessionRepository from "../repositories/session.repository";

export async function updateExpiresAt(jti: string, expiresAt: Date): Promise<void> {
  await sessionRepository.updateExpiresAt(jti, expiresAt);
}

export async function deleteByJti(jti: string): Promise<void> {
  await sessionRepository.deleteByJti(jti);
}
