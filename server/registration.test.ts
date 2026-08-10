import { beforeEach, describe, expect, it, vi } from "vitest";
import { RATE_LIMIT_WINDOWS } from "./rateLimitState";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

vi.mock("./db");
vi.mock("./emailService", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue({ sent: true }),
}));

import { sendWelcomeEmail } from "./emailService";

function createContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "1.2.3.4" },
      socket: { remoteAddress: "1.2.3.4" },
    } as unknown as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const validInput = {
  fullName: "أحمد محمد",
  email: "ahmed@example.com",
  age: 25,
  profession: "مطور برمجيات",
  username: "ahmed_dev",
};

describe("registration.checkUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns available=true when username not taken", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.checkUsername({ username: "new_user" });
    expect(res.available).toBe(true);
  });

  it("returns available=false when username is taken", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(true);
    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.checkUsername({ username: "taken_name" });
    expect(res.available).toBe(false);
  });

  it("returns available=false for invalid characters", async () => {
    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.checkUsername({ username: "bad name!" });
    expect(res.available).toBe(false);
  });
});

describe("registration.registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RATE_LIMIT_WINDOWS.clear();
  });

  it("registers successfully and returns registrationId", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.registerUser(validInput);

    expect(res.success).toBe(true);
    expect(res.username).toBe("ahmed_dev");
    expect(res.registrationId).toMatch(/^ERKAN-[A-Z0-9]{5}$/);
    expect(db.createRegistration).toHaveBeenCalledOnce();
  });

  it("sends welcome email after successful registration", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.registerUser(validInput);

    expect(sendWelcomeEmail).toHaveBeenCalledOnce();
    expect(sendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: validInput.email,
        email: validInput.email,
        fullName: validInput.fullName,
        age: validInput.age,
        profession: validInput.profession,
        username: "ahmed_dev",
        registrationId: res.registrationId,
      })
    );
  });

  it("still succeeds when welcome email sending fails", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);
    vi.mocked(sendWelcomeEmail).mockRejectedValueOnce(new Error("SMTP down"));

    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.registerUser(validInput);

    expect(res.success).toBe(true);
    expect(res.registrationId).toMatch(/^ERKAN-[A-Z0-9]{5}$/);
  });

  it("marks emailSent=true in database after successful email", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);
    vi.mocked(db.setEmailSent).mockResolvedValue(undefined);
    vi.mocked(sendWelcomeEmail).mockResolvedValue({ sent: true });

    const caller = appRouter.createCaller(createContext());
    await caller.registration.registerUser(validInput);

    expect(db.setEmailSent).toHaveBeenCalledOnce();
    expect(db.setEmailSent).toHaveBeenCalledWith(
      expect.stringMatching(/^ERKAN-[A-Z0-9]{5}$/)
    );
  });

  it("does not mark emailSent when email sending fails", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);
    vi.mocked(db.setEmailSent).mockResolvedValue(undefined);
    vi.mocked(sendWelcomeEmail).mockResolvedValue({ sent: false, error: "SMTP down" });

    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.registerUser(validInput);

    expect(res.success).toBe(true);
    expect(db.setEmailSent).not.toHaveBeenCalled();
  });

  it("rejects duplicate email", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(true);

    const caller = appRouter.createCaller(createContext());
    await expect(caller.registration.registerUser(validInput)).rejects.toThrow(TRPCError);
    expect(db.createRegistration).not.toHaveBeenCalled();
  });

  it("rejects duplicate username", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(true);

    const caller = appRouter.createCaller(createContext());
    await expect(caller.registration.registerUser(validInput)).rejects.toThrow(TRPCError);
    expect(db.emailExists).not.toHaveBeenCalled();
  });

  it("rejects invalid username length", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.registration.registerUser({ ...validInput, username: "ab" })
    ).rejects.toThrow();
  });

  it("rejects username with invalid characters", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.registration.registerUser({ ...validInput, username: "bad name!" })
    ).rejects.toThrow();
  });

  it("rejects invalid age", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.registration.registerUser({ ...validInput, age: 8 })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.registration.registerUser({ ...validInput, email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("stores username in lowercase", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createContext());
    await caller.registration.registerUser({ ...validInput, username: "Ahmed_Dev" });

    const stored = vi.mocked(db.createRegistration).mock.calls[0][0];
    expect(stored.username).toBe("ahmed_dev");
    expect(stored.email).toBe("ahmed@example.com");
  });

  it("applies rate limiting after repeated rapid requests", async () => {
    vi.mocked(db.usernameExists).mockResolvedValue(false);
    vi.mocked(db.emailExists).mockResolvedValue(false);
    vi.mocked(db.registrationById).mockResolvedValue(undefined);
    vi.mocked(db.createRegistration).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createContext());
    // نافذة جديدة كل عنوان IP — 10 طلبات متتالية من نفس المصدر
    for (let i = 0; i < 10; i++) {
      await caller.registration.registerUser({ ...validInput, username: `user_${i}` });
    }
    await expect(
      caller.registration.registerUser({ ...validInput, username: "user_10" })
    ).rejects.toThrow(TRPCError);
  });
});

describe("registration.getCount", () => {
  it("returns real count from database", async () => {
    vi.mocked(db.registrationCount).mockResolvedValue(42);
    const caller = appRouter.createCaller(createContext());
    const res = await caller.registration.getCount();
    expect(res.count).toBe(42);
  });
});
