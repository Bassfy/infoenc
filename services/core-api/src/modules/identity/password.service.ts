import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import * as argon2 from "argon2";

/**
 * Password credential handling (Phase 2 doc 05 §2, NFR-003).
 * Argon2id, NIST 800-63B policy (length over composition), and a k-anonymity breach check
 * against the HaveIBeenPwned range API on set/change. No forced rotation.
 */
@Injectable()
export class PasswordService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65_536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  };

  hash(plain: string): Promise<string> {
    return argon2.hash(plain, this.options);
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Returns the number of times a password appears in the breach corpus (0 = not found).
   * Uses k-anonymity: only the first 5 SHA-1 chars are sent; the full hash never leaves us.
   * Callers reject on count > 0 at registration and warn on login (Phase 2 doc 05 §4).
   */
  async breachCount(plain: string, fetchImpl: typeof fetch = fetch): Promise<number> {
    const sha1 = createHash("sha1").update(plain).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const res = await fetchImpl(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) return 0; // fail-open on availability, never block signup on a 3rd-party outage
    const body = await res.text();
    for (const line of body.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) return Number.parseInt(count ?? "0", 10);
    }
    return 0;
  }
}
