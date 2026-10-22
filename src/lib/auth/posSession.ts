import { hash, verify } from "@node-rs/argon2";
export {
  signPosToken,
  verifyPosToken,
  JWT_SECRET,
  type PosSessionPayload,
} from "./jwt";

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

