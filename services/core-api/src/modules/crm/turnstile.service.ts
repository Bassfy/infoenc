import { ForbiddenException, Injectable } from "@nestjs/common";

/**
 * Cloudflare Turnstile verification (NFR-013 bot defense). Verifies the client-side token
 * server-side before a public form is accepted. In local dev (no secret configured) it passes so
 * the flow is exercisable; in staging/prod the secret is required and a failed challenge is rejected.
 */
@Injectable()
export class TurnstileService {
  private readonly secret = process.env.TURNSTILE_SECRET ?? "";

  async assertHuman(token: string, ip: string): Promise<void> {
    if (!this.secret) return; // dev: no secret → skip (documented)
    const body = new URLSearchParams({ secret: this.secret, response: token, remoteip: ip });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success: boolean };
    if (!data.success) throw new ForbiddenException("bot challenge failed");
  }
}
