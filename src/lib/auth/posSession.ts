import { SignJWT, jwtVerify } from "jose";
import { hash, verify } from "@node-rs/argon2";

const JWT_SECRET = new TextEncoder().encode(
  process.env.POS_JWT_SECRET || "kipp-market-super-secret-pos-jwt-key-32-bytes!!"
);

export interface PosSessionPayload {
  memberId: string;
  tenantId: string;
  branchId: string;
  terminalId: string;
  displayName: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
}

/**
 * Hash a numeric PIN (4-6 digits) using Argon2id.
 */
export async function hashPin(pin: string): Promise<string> {
  return hash(pin, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verify a plain PIN against an Argon2id hash.
 */
export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  try {
    return await verify(pinHash, pin);
  } catch {
    return false;
  }
}

/**
 * Sign a 12-hour POS session token using jose.
 */
export async function signPosToken(payload: PosSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(JWT_SECRET);
}

/**
 * Verify a POS session token.
 */
export async function verifyPosToken(token: string): Promise<PosSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as PosSessionPayload;
  } catch {
    return null;
  }
}
