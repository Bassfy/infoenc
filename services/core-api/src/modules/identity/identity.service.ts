import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { LoginInput, Principal, RegisterInput } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { PasswordService } from "./password.service.js";
import { SessionService, type SessionMeta } from "./session.service.js";
import { TokenService } from "./token.service.js";

/**
 * Identity orchestration (Phase 2 doc 05). Registration creates the user, their personal
 * org-of-one (Phase 3 doc 06 §1), and the password credential; login verifies and issues a
 * session + access token. OAuth/passkey/MFA add credential paths onto this same core (scaffolded
 * in oauth.service.ts / webauthn.service.ts / totp.service.ts — same session issuance).
 */
export interface AuthResult {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
  principal: Principal;
}

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly tokens: TokenService,
  ) {}

  async register(input: RegisterInput, meta: SessionMeta): Promise<AuthResult> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
    });
    if (existing) throw new ConflictException("email or username already in use");

    if (input.password) {
      const breached = await this.passwords.breachCount(input.password);
      if (breached > 0) {
        throw new ConflictException("this password has appeared in a breach — choose another");
      }
    }

    // Create user + personal org + membership + password credential atomically.
    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: input.email,
          username: input.username,
          locale: input.locale,
        },
      });
      const org = await tx.organization.create({
        data: { type: "personal", name: input.username, slug: `u-${u.id}`, locale: input.locale },
      });
      await tx.orgMembership.create({
        data: { orgId: org.id, userId: u.id, role: "owner", seatActive: true },
      });
      if (input.password) {
        await tx.credential.create({
          data: { userId: u.id, type: "password", secretHash: await this.passwords.hash(input.password) },
        });
      }
      await tx.userProgressSummary.create({ data: { userId: u.id } });
      // outbox: identity.user.registered (consumers send verification email, seed lifecycle)
      await tx.outboxEvent.create({
        data: { type: "identity.user.registered", aggregateId: u.id, orgId: org.id, payload: { userId: u.id } },
      });
      return { ...u, orgId: org.id };
    });

    return this.issue(
      {
        userId: user.id,
        orgId: user.orgId,
        roles: ["org:owner"],
        amr: ["pwd"],
        locale: user.locale,
        isStaff: user.isStaff,
      },
      meta,
    );
  }

  async login(input: LoginInput, meta: SessionMeta): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { credentials: { where: { type: "password" } }, memberships: true },
    });
    // Constant-ish work whether or not the user exists (avoid user-enumeration timing).
    const hash = user?.credentials[0]?.secretHash ?? "$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const ok = await this.passwords.verify(hash, input.password);
    if (!user || !ok || !user.isActive) throw new UnauthorizedException("invalid credentials");

    const personalOrg = user.memberships.find((m) => m.role === "owner") ?? user.memberships[0];
    if (!personalOrg) throw new UnauthorizedException("no organization context");

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return this.issue(
      {
        userId: user.id,
        orgId: personalOrg.orgId,
        roles: [`org:${personalOrg.role}`],
        amr: ["pwd"],
        locale: user.locale,
        isStaff: user.isStaff,
      },
      meta,
    );
  }

  private async issue(base: Omit<Principal, "sessionId">, meta: SessionMeta): Promise<AuthResult> {
    const { sessionId, refreshToken } = await this.sessions.create(base.userId, base.orgId, meta);
    const principal: Principal = { ...base, sessionId };
    const { token, expiresAt } = this.tokens.signAccess(principal);
    return { accessToken: token, expiresAt, refreshToken, principal };
  }
}
