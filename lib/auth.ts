import { SignJWT, jwtVerify } from "jose";
import { Redis } from "@upstash/redis";

// ── Redis client ──
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
    _redis = new Redis({ url, token });
  }
  return _redis;
}

// ── JWT ──
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "probrief-default-secret-change-me");
const MAX_USES = Number(process.env.MAX_FREE_USES || "3");

export async function createToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

// ── Verification code ──
export async function storeCode(email: string, code: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`code:${email}`, code, { ex: 300 }); // 5 min expiry
}

export async function checkCode(email: string, code: string): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get<string>(`code:${email}`);
  if (stored === code) {
    await redis.del(`code:${email}`);
    return true;
  }
  return false;
}

// ── Quota ──
export async function getUsageCount(email: string): Promise<number> {
  const redis = getRedis();
  const count = await redis.get<number>(`usage:${email}`);
  return count ?? 0;
}

export async function incrementUsage(email: string): Promise<{ remaining: number; allowed: boolean }> {
  const redis = getRedis();
  const current = await getUsageCount(email);
  if (current >= MAX_USES) {
    return { remaining: 0, allowed: false };
  }
  await redis.incr(`usage:${email}`);
  return { remaining: MAX_USES - current - 1, allowed: true };
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export { MAX_USES };
