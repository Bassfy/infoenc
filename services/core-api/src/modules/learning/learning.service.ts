import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";

/**
 * Learning module (Phase 2 doc 03). Enrollment + lesson progress. Completing a lesson emits
 * `learning.lesson.completed` in the SAME transaction as the progress write (transactional outbox)
 * — the XP consumer then awards XP idempotently, closing the learn → progress → XP loop without
 * inline coupling. Course-completion detection emits `learning.course.completed` which drives the
 * certificate consumer.
 */
@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async enroll(userId: string, courseId: string): Promise<{ enrollmentId: string }> {
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ConflictException("already enrolled");
    const enrollment = await this.prisma.enrollment.create({
      data: { userId, courseId, state: "active" },
    });
    return { enrollmentId: enrollment.id };
  }

  /**
   * Marks a lesson complete (idempotent per user+lesson), recomputes course progress, and emits
   * the completion event. If this completes the course, emits course-completed too.
   */
  async completeLesson(userId: string, lessonId: string): Promise<{ progressBps: number; courseCompleted: boolean }> {
    return this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.findUniqueOrThrow({
        where: { id: lessonId },
        include: { module: { select: { courseId: true } } },
      });
      const courseId = lesson.module.courseId;

      // Idempotent completion.
      const already = await tx.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });
      const firstCompletion = !already?.isCompleted;

      await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: { userId, lessonId, isCompleted: true, completedAt: new Date() },
        update: { isCompleted: true, completedAt: already?.completedAt ?? new Date() },
      });

      // Recompute course progress from completed lessons / total lessons.
      const [total, done] = await Promise.all([
        tx.lesson.count({ where: { module: { courseId }, deletedAt: null } }),
        tx.lessonProgress.count({
          where: { userId, isCompleted: true, lesson: { module: { courseId } } },
        }),
      ]);
      const progressBps = total === 0 ? 0 : Math.round((done / total) * 10000);
      const courseCompleted = total > 0 && done >= total;

      await tx.enrollment.updateMany({
        where: { userId, courseId },
        data: {
          progressBps,
          ...(courseCompleted ? { state: "completed", completedAt: new Date() } : {}),
        },
      });

      // Emit events only on the first time a lesson is completed (no XP farming on re-complete).
      if (firstCompletion) {
        await this.outbox.emit(tx, {
          name: "learning.lesson.completed",
          aggregateId: lessonId,
          payload: { userId, lessonId, courseId },
        });
        if (courseCompleted) {
          await this.outbox.emit(tx, {
            name: "learning.course.completed",
            aggregateId: courseId,
            payload: { userId, courseId },
          });
        }
      }

      return { progressBps, courseCompleted };
    });
  }
}
