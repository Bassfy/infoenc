import { Module } from "@nestjs/common";
import { PlatformModule } from "./platform/platform.module.js";
import { HealthController } from "./modules/health/health.controller.js";

/**
 * Root module. Domain modules (identity, orgs, catalog, learning, …) register here as they land
 * in Phases 6–8; boundaries between them are enforced by dependency-cruiser (Phase 2 doc 02 §2.3).
 * The health controller and PlatformModule are the Phase 5 skeleton.
 */
@Module({
  imports: [PlatformModule],
  controllers: [HealthController],
})
export class AppModule {}
