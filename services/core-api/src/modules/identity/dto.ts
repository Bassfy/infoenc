import { createZodDto } from "nestjs-zod";
import { loginInput, registerInput } from "@infoenc/contracts/auth";

/**
 * Request DTOs derived from the shared contracts (Phase 5 doc 01 §3). One zod schema becomes
 * validation + OpenAPI + client types — a shape is never defined twice.
 */
export class RegisterDto extends createZodDto(registerInput) {}
export class LoginDto extends createZodDto(loginInput) {}
