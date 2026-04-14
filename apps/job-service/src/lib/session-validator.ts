export async function validateSession(jti: string): Promise<boolean> {
  if (
    process.env.SKIP_SESSION_VALIDATION === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return true;
  }

  const secret = process.env.INTERNAL_SERVICE_SECRET;
  const baseUrl = process.env.USER_SERVICE_URL;
  if (!secret || !baseUrl) {
    throw new Error(
      "Missing required env vars: USER_SERVICE_URL or INTERNAL_SERVICE_SECRET",
    );
  }

  if (!jti || !/^[\w-]+$/.test(jti)) {
    throw new Error(`Invalid jti format: ${jti}`);
  }

  const url = `${baseUrl.replace(/\/$/, "")}/internal/sessions/${jti}`;
  const response = await fetch(url, {
    headers: {
      "x-internal-secret": secret,
    },
    signal: AbortSignal.timeout(3000),
  });

  if (response.status === 200) return true;
  if (response.status === 404) return false;

  throw new Error(
    `Unexpected response from user-service: ${response.status} (jti: ${jti})`,
  );
}
