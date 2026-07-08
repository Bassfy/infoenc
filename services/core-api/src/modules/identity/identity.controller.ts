import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { IdentityService } from "./identity.service.js";
import { hashIp } from "./session.service.js";
import { LoginDto, RegisterDto } from "./dto.js";
import { Public } from "../../platform/auth/auth.guard.js";

/**
 * REST auth endpoints (Phase 2 doc 05 §4). The refresh token is set as an httpOnly, Secure,
 * SameSite=Lax cookie scoped to the auth domain; the access token is returned in the body for
 * the client to hold in memory only (never in storage — doc 05 §3).
 */
@Controller("api/v1/auth")
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.identity.register(dto, meta(req));
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, expiresAt: result.expiresAt };
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.identity.login(dto, meta(req));
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, expiresAt: result.expiresAt };
  }
}

function meta(req: Request) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "";
  return {
    userAgent: req.headers["user-agent"] ?? undefined,
    ipHash: ip ? hashIp(ip) : undefined,
    amr: ["pwd"],
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie("infoenc_rt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}
