import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "dicon_admin_session";
const sessionDuration = 8 * 60 * 60 * 1000;

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? "development-only-change-me";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createAdminSession() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${signature(issuedAt)}`;
}

export function isValidAdminSession(value?: string) {
  if (!value) return false;
  const [issuedAt, providedSignature] = value.split(".");
  if (!issuedAt || !providedSignature || Date.now() - Number(issuedAt) > sessionDuration) return false;
  const expected = signature(issuedAt);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function hasAdminPassword() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}
