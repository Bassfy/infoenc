import { Module } from "@nestjs/common";
import { PlatformModule } from "./platform/platform.module.js";
import { HealthController } from "./modules/health/health.controller.js";
import { IdentityModule } from "./modules/identity/identity.module.js";
import { GamificationModule } from "./modules/gamification/gamification.module.js";
import { CatalogModule } from "./modules/catalog/catalog.module.js";

/**
 * Root module. Domain modules register here as they land (Phases 6–8); boundaries between them are
 * enforced by dependency-cruiser (Phase 2 doc 02 §2.3). Phase 6 adds identity (auth), gamification
 * (XP), and catalog; more academy modules follow.
 */
@Module({
  imports: [PlatformModule, IdentityModule, GamificationModule, CatalogModule],
  controllers: [HealthController],
})
export class AppModule {}
