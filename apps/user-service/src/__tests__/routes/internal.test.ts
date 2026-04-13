import Fastify from "fastify";
import * as sessionRepository from "../../repositories/session.repository";
import internalRoutes from "../../routes/internal/index";

jest.mock("../../repositories/session.repository");

const mockFindByJti = sessionRepository.findByJti as jest.MockedFunction<
  typeof sessionRepository.findByJti
>;

function buildApp() {
  const app = Fastify();
  app.register(internalRoutes, { prefix: "/internal" });
  return app;
}

describe("GET /internal/sessions/:jti", () => {
  beforeEach(() => {
    process.env.INTERNAL_SERVICE_SECRET = "test-secret";
    jest.clearAllMocks();
  });

  it("returns 401 when X-Internal-Secret header is missing", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "GET",
      url: "/internal/sessions/some-jti",
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns 401 when X-Internal-Secret header is wrong", async () => {
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "GET",
      url: "/internal/sessions/some-jti",
      headers: { "x-internal-secret": "wrong-secret" },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns 200 when session exists and is not expired", async () => {
    mockFindByJti.mockResolvedValue({
      id: "jti-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 10_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "GET",
      url: "/internal/sessions/jti-1",
      headers: { "x-internal-secret": "test-secret" },
    });
    expect(res.statusCode).toBe(200);
    await app.close();
  });

  it("returns 404 when session is not found", async () => {
    mockFindByJti.mockResolvedValue(undefined);
    const app = buildApp();
    await app.ready();
    const res = await app.inject({
      method: "GET",
      url: "/internal/sessions/missing-jti",
      headers: { "x-internal-secret": "test-secret" },
    });
    expect(res.statusCode).toBe(404);
    await app.close();
  });
});
