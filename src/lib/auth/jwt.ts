import { SignJWT, jwtVerify } from "jose";

export const JWT_SECRET = new TextEncoder().encode(
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
 * Sign a POS/Backoffice session token using jose (Edge & Node compatible).
 * @param payload PosSessionPayload
 * @param expiresIn Token validity string (e.g. "30d" for remember-me, "12h" for standard session)
 */
export async function signPosToken(
  payload: PosSessionPayload,
  expiresIn: string = "12h"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verify a POS/Backoffice session token using jose.
 */
export async function verifyPosToken(token: string): Promise<PosSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as PosSessionPayload;
  } catch {
    return null;
  }
}
