import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { RATE_LIMIT_WINDOWS } from "./rateLimitState";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const USERNAME_MIN = 3;
const USERNAME_MAX = 10;
const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const AGE_MIN = 13;
const AGE_MAX = 120;

const registerInput = z.object({
  fullName: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().max(320).email(),
  age: z.number().int().min(AGE_MIN).max(AGE_MAX),
  profession: z.string().trim().min(2).max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(USERNAME_MIN)
    .max(USERNAME_MAX)
    .regex(USERNAME_REGEX),
});

// معدل بسيط في الذاكرة لمنع السبام: نافذة زمنية / عنوان IP
function checkRateLimit(ip: string) {
  const { hits, windowStart } = RATE_LIMIT_WINDOWS.get(ip) ?? { hits: 0, windowStart: Date.now() };
  if (Date.now() - windowStart > RATE_LIMIT_WINDOW_MS) {
    RATE_LIMIT_WINDOWS.set(ip, { hits: 1, windowStart: Date.now() });
    return;
  }
  if (hits >= RATE_LIMIT_MAX) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "RATE_LIMITED" });
  }
  RATE_LIMIT_WINDOWS.set(ip, { hits: hits + 1, windowStart });
}

setInterval(() => {
  const now = Date.now();
  RATE_LIMIT_WINDOWS.forEach((val, key) => {
    if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) RATE_LIMIT_WINDOWS.delete(key);
  });
}, 60_000);

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  registration: router({
    /** التحقق الفوري من توفر اسم المستخدم */
    checkUsername: publicProcedure
      .input(z.object({ username: z.string().trim().toLowerCase().min(USERNAME_MIN).max(USERNAME_MAX) }))
      .query(async ({ input }) => {
        if (!USERNAME_REGEX.test(input.username)) {
          return { available: false };
        }
        const taken = await db.usernameExists(input.username);
        return { available: !taken };
      }),

    /** تسجيل مسبق جديد مع تحقق كامل وحماية من التكرار */
    registerUser: publicProcedure.input(registerInput).mutation(async ({ ctx, input }) => {
      // Rate limiting حسب عنوان الطلب
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        (ctx.req.socket?.remoteAddress ?? "unknown");
      checkRateLimit(ip);

      const existingUser = await db.usernameExists(input.username);
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "USERNAME_TAKEN" });
      }
      const existingEmail = await db.emailExists(input.email);
      if (existingEmail) {
        throw new TRPCError({ code: "CONFLICT", message: "EMAIL_TAKEN" });
      }

      // توليد رقم حجز فريد بصيغة ERKAN-XXXXX
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let registrationId = "";
      for (let i = 0; i < 5; i++) {
        registrationId += chars[Math.floor(Math.random() * chars.length)];
      }
      registrationId = `ERKAN-${registrationId}`;
      const exists = await db.registrationById(registrationId);
      if (exists) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Regenerate ID" });
      }

      await db.createRegistration({
        fullName: input.fullName,
        email: input.email,
        age: input.age,
        profession: input.profession,
        username: input.username,
        registrationId,
        status: "active",
      });

      return { success: true, username: input.username, registrationId } as const;
    }),

    /** عدد المسجلين الحقيقي — يُعرض للعامة دون أي بيانات شخصية */
    getCount: publicProcedure.query(async () => {
      const count = await db.registrationCount();
      return { count };
    }),
  }),
});

export type AppRouter = typeof appRouter;
