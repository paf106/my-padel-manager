import { afterEach, describe, expect, it, vi } from "vitest";

const { drizzleMock, postgresMock } = vi.hoisted(() => ({
  drizzleMock: vi.fn(() => ({ select: vi.fn(), insert: vi.fn() })),
  postgresMock: vi.fn(() => ({})),
}));

vi.mock("postgres", () => ({ default: postgresMock }));
vi.mock("drizzle-orm/postgres-js", () => ({ drizzle: drizzleMock }));

describe("database client", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("reuses the production database client across repeated accesses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://test.example/padel");

    const { db } = await import("./index");

    void db.select;
    void db.insert;
    void db.select;

    expect(postgresMock).toHaveBeenCalledTimes(1);
    expect(postgresMock).toHaveBeenCalledWith("postgresql://test.example/padel", {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    expect(drizzleMock).toHaveBeenCalledTimes(1);
  });
});
