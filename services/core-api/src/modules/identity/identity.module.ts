import { Module } from "@nestjs/common";
import { IdentityService } from "./identity.service.js";
import { IdentityController } from "./identity.controller.js";
import { PasswordService } from "./password.service.js";
import { TokenService } from "./token.service.js";
import { SessionService } from "./session.service.js";

/**
 * Identity module (Phase 2 doc 05). Password auth is implemented here; OAuth, passkey (WebAuthn),
 * and TOTP add credential providers that reuse SessionService/TokenService for session issuance
 * (Phase 6 status matrix). PlatformModule (global) supplies PrismaService.
 */
@Module({
  controllers: [IdentityController],
  providers: [IdentityService, PasswordService, TokenService, SessionService],
  exports: [IdentityService, TokenService, SessionService],
})
export class IdentityModule {}
