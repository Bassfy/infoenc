import { Injectable } from "@nestjs/common";
import type { Locale } from "@infoenc/contracts";
import { PrismaService } from "../../platform/prisma/prisma.service.js";

/**
 * Catalog reads (Phase 2 doc 03 catalog module). Public content is NOT tenant-scoped, so these use
 * the base client and filter by published status. Bilingual resolution follows the translation-row
 * pattern (Phase 3 doc 01 §4): request the row for the active locale, fall back to the other with
 * a flag so the UI can show the "not yet translated" notice (FR-AC-029) rather than a 404.
 */
export interface CourseListItem {
  id: string;
  slug: string;
  difficulty: string;
  title: string;
  shortDescription: string | null;
  localeFallback: boolean; // true when shown in the non-requested locale
  enrolledCount: number;
  ratingAvg: number; // stored x100
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses(params: {
    locale: Locale;
    cursor?: string;
    limit: number;
    difficulty?: string;
  }): Promise<{ items: CourseListItem[]; nextCursor: string | null }> {
    const rows = await this.prisma.course.findMany({
      where: {
        status: "published",
        deletedAt: null,
        ...(params.difficulty ? { difficulty: params.difficulty as never } : {}),
      },
      // both locales' translations so we can fall back without a second query
      include: { translations: true },
      orderBy: { id: "asc" },
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > params.limit;
    const page = hasMore ? rows.slice(0, params.limit) : rows;

    const items: CourseListItem[] = page.map((c) => {
      const primary = c.translations.find((t) => t.locale === params.locale);
      const fallback = c.translations.find((t) => t.locale !== params.locale);
      const t = primary ?? fallback;
      return {
        id: c.id,
        slug: c.slug,
        difficulty: c.difficulty,
        title: t?.title ?? c.slug,
        shortDescription: t?.shortDescription ?? null,
        localeFallback: primary === undefined && fallback !== undefined,
        enrolledCount: c.enrolledCount,
        ratingAvg: c.ratingAvg,
      };
    });

    return { items, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null };
  }
}
