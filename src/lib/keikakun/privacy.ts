import { createCipheriv, createHash, randomBytes } from "node:crypto";

export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
  authTag: string;
  encryptionKeyVersion: string;
}

export function hashText(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function estimateTokenCount(input: string): number {
  const japaneseCharacterCount = Array.from(input).filter((char) =>
    /[\u3040-\u30ff\u3400-\u9fff]/u.test(char)
  ).length;
  const latinWordCount = input.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(japaneseCharacterCount / 2 + latinWordCount * 1.2));
}

export function summarizeForTrace(input: string): string {
  const compact = input.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 177)}...`;
}

export function encryptRawPayload(
  plaintext: string,
  secret: string,
  encryptionKeyVersion = "local-v1"
): EncryptedPayload {
  const key = resolveAes256Key(secret);
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    nonce: nonce.toString("base64"),
    authTag: authTag.toString("base64"),
    encryptionKeyVersion
  };
}

function resolveAes256Key(secret: string): Buffer {
  const trimmedSecret = secret.trim();
  const base64 = Buffer.from(trimmedSecret, "base64");
  if (base64.length === 32) {
    return base64;
  }

  const hex = Buffer.from(trimmedSecret, "hex");
  if (hex.length === 32) {
    return hex;
  }

  return createHash("sha256").update(trimmedSecret, "utf8").digest();
}
