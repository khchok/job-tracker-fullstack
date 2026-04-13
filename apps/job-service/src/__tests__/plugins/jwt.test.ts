import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import jwtPlugin from "../../plugins/jwt";
import * as sessionValidator from "../../lib/session-validator";

jest.mock("../../lib/session-validator");

const mockValidateSession = sessionValidator.validateSession as jest.MockedFunction<
  typeof sessionValidator.validateSession
>;

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  await app.register(cookie);
  await app.register(jwtPlugin);
  app.get(
    "/protected",
    { onRequest: [(app as any).authenticate] },
    async () => ({ ok: true }),
  );
  await app.ready();
  return app;
}

describe("authenticate decorator", () => {
  let app: FastifyInstance;
  let validToken: string;

  beforeEach(async () => {
    process.env.JWT_PUBLIC_KEY = "test-secret";
    jest.clearAllMocks();
    app = await buildApp();
    validToken = app.jwt.sign({
      id: "user-1",
      email: "test@example.com",
      jti: "session-1",
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 200 when token is valid and session is active", async () => {
    mockValidateSession.mockResolvedValue(true);
    const res = await app.inject({
      method: "GET",
      url: "/protected",
      cookies: { token: validToken },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });

  it("returns 401 when session is invalid (logged out)", async () => {
    mockValidateSession.mockResolvedValue(false);
    const res = await app.inject({
      method: "GET",
      url: "/protected",
      cookies: { token: validToken },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: "Invalid session" });
  });

  it("returns 503 when user-service is unreachable", async () => {
    mockValidateSession.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await app.inject({
      method: "GET",
      url: "/protected",
      cookies: { token: validToken },
    });
    expect(res.statusCode).toBe(503);
    expect(JSON.parse(res.body)).toEqual({
      error: "Authentication service unavailable",
    });
  });

  it("returns 401 when no token cookie is present", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/protected",
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when token is malformed", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/protected",
      cookies: { token: "not-a-valid-jwt" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("calls validateSession with the jti from the token", async () => {
    mockValidateSession.mockResolvedValue(true);
    await app.inject({
      method: "GET",
      url: "/protected",
      cookies: { token: validToken },
    });
    expect(mockValidateSession).toHaveBeenCalledWith("session-1");
  });
});
