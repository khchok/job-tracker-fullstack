export async function validateSession(jti: string): Promise<boolean> {
  if (
    process.env.SKIP_SESSION_VALIDATION === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return true;
  }

  const url = `${process.env.USER_SERVICE_URL}/internal/sessions/${jti}`;
  const response = await fetch(url, {
    headers: {
      "x-internal-secret": process.env.INTERNAL_SERVICE_SECRET!,
    },
    signal: AbortSignal.timeout(3000),
  });

  if (response.status === 200) return true;
  if (response.status === 404) return false;

  throw new Error(`Unexpected response from user-service: ${response.status}`);
}
