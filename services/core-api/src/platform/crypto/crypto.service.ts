import { Injectable } from "@nestjs/common";
import { createCipheriv, createDecipheriv, randomBytes, hkdfSync } from "node:crypto";
import { loadEnv } from "../../config/env.js";

/**
 * Field-level envelope encryption (Phase 2 doc 06 §4, NFR-020). Used for crown-jewel engagement
 * data, TOTP secrets, SSO configs, and lab flag seeds — anything that must be ciphertext at rest.
 *
 * Envelope pattern: a per-record data key encrypts the plaintext (AES-256-GCM); the data key is
 * wrapped by a root key held in KMS. Deleting the wrapped key crypto-shreds the record (NFR-025).
 * This implementation derives the wrapping key from KMS_DATA_KEY_ID via HKDF for local/dev; in
 * staging/prod the wrap/unwrap round-trips to KMS (same encrypt/decrypt surface, swapped by DI).
 *
 * Ciphertext layout: [1B version][12B iv][16B tag][wrapped data key len...][wrapped key][ciphertext]
 * Simplified single-key form below stores: [version][iv][tag][ciphertext] with the data key derived
 * per-call from the root + a random salt embedded — the production KMS envelope replaces the derive.
 */
@Injectable()
export class CryptoService {
  private readonly rootKeyId = loadEnv().KMS_DATA_KEY_ID;
  private static readonly VERSION = 1;

  async encrypt(plaintext: string): Promise<Buffer> {
    const salt = randomBytes(16);
    const key = this.deriveKey(salt);
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([Buffer.from([CryptoService.VERSION]), salt, iv, tag, ct]);
  }

  async decrypt(blob: Buffer): Promise<string> {
    const version = blob.readUInt8(0);
    if (version !== CryptoService.VERSION) throw new Error(`unsupported crypto version ${version}`);
    const salt = blob.subarray(1, 17);
    const iv = blob.subarray(17, 29);
    const tag = blob.subarray(29, 45);
    const ct = blob.subarray(45);
    const key = this.deriveKey(salt);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  }

  /**
   * Derives a 256-bit data key from the root key id + salt via HKDF. The production path replaces
   * this with a KMS GenerateDataKey/Decrypt round-trip; the on-disk format is unchanged.
   */
  private deriveKey(salt: Buffer): Buffer {
    return Buffer.from(hkdfSync("sha256", Buffer.from(this.rootKeyId), salt, Buffer.from("infoenc-fle"), 32));
  }
}
