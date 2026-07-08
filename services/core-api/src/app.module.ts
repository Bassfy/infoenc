import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { PlatformModule } from "./platform/platform.module.js";
import { AuthGuard } from "./platform/auth/auth.guard.js";
import { TenantInterceptor } from "./platform/auth/tenant.interceptor.js";
import { HealthController } from "./modules/health/health.controller.js";
import { IdentityModule } from "./modules/identity/identity.module.js";
import { GamificationModule } from "./modules/gamification/gamification.module.js";
import { CatalogModule } from "./modules/catalog/catalog.module.js";
import { LearningModule } from "./modules/learning/learning.module.js";
import { CommerceModule } from "./modules/commerce/commerce.module.js";
import { LabsModule } from "./modules/labs/labs.module.js";
import { CrmModule } from "./modules/crm/crm.module.js";
import { EngagementsModule } from "./modules/engagements/engagements.module.js";

/**
 * Root module. Domain modules register here as they land (Phases 6–8); boundaries between them are
 * enforced by dependency-cruiser (Phase 2 doc 02 §2.3).
 *
 * The AuthGuard (authenticate + attach Principal) and TenantInterceptor (bind RLS tenant context)
 * are registered GLOBALLY — every route is authenticated and tenant-scoped by default; @Public()
 * opts a route out. This is the deny-by-default posture that makes tenant isolation the norm, not
 * something each handler must remember to apply.
 */
@Module({
  imports: [
    PlatformModule,
    IdentityModule,
    GamificationModule,
    CatalogModule,
    LearningModule,
    CommerceModule,
    LabsModule,
    CrmModule,
    EngagementsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
})
export class AppModule {}
