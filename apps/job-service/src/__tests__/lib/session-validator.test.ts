import { validateSession } from "../../lib/session-validator";

describe("validateSession", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.USER_SERVICE_URL = "http://localhost:3031";
    process.env.INTERNAL_SERVICE_SECRET = "test-secret";
    delete process.env.SKIP_SESSION_VALIDATION;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns true when user-service returns 200", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 }) as any;
    const result = await validateSession("valid-jti");
    expect(result).toBe(true);
  });

  it("calls the correct URL with the secret header", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 }) as any;
    await validateSession("abc-jti");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3031/internal/sessions/abc-jti",
      expect.objectContaining({
        headers: { "x-internal-secret": "test-secret" },
      }),
    );
  });

  it("returns false when user-service returns 404", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404 }) as any;
    const result = await validateSession("expired-jti");
    expect(result).toBe(false);
  });

  it("throws when user-service is unreachable", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("ECONNREFUSED")) as any;
    await expect(validateSession("any-jti")).rejects.toThrow();
  });

  it("returns true without calling fetch when SKIP_SESSION_VALIDATION=true and not production", async () => {
    process.env.SKIP_SESSION_VALIDATION = "true";
    global.fetch = jest.fn() as any;
    const result = await validateSession("any-jti");
    expect(result).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does NOT skip validation when SKIP_SESSION_VALIDATION=true but NODE_ENV=production", async () => {
    process.env.SKIP_SESSION_VALIDATION = "true";
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
    });
    global.fetch = jest.fn().mockResolvedValue({ status: 200 }) as any;
    await validateSession("any-jti");
    expect(global.fetch).toHaveBeenCalled();
  });
});
