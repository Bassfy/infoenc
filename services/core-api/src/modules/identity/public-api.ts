/**
 * Identity module facade (Phase 5 doc 01 §1). The ONLY surface other modules may import.
 * Cross-module code depends on these types/services, never on the module's internals — enforced
 * by dependency-cruiser.
 */
export { IdentityService, type AuthResult } from "./identity.service.js";
export { TokenService } from "./token.service.js";
export { SessionService, type SessionMeta, hashIp } from "./session.service.js";
