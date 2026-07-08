import { Module } from "@nestjs/common";
import { CatalogService } from "./catalog.service.js";

/**
 * Catalog module (Phase 2 doc 03). Serves paths, courses, lessons, assessments to the academy.
 * GraphQL resolvers (first-party UI) and the public REST catalog API attach here; reads use the
 * base Prisma client since catalog content is global/public (Phase 3 doc 05 §2).
 */
@Module({
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
