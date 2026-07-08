# 03 — MVP Schema Mapping

Phase 1 doc 09 §5 committed to mapping every one of the MVP's 19 MySQL tables to its successor or documenting its retirement. This is that mapping. Nothing is lost silently.

## Table-by-table

| # | MVP table | Successor(s) | Change of substance |
|---|-----------|--------------|---------------------|
| 1 | `users` | `User` + `Credential` + `OrgMembership` + `UserProgressSummary` | Split: identity vs. credentials vs. tenancy vs. gamification rollup. `role` enum → RBAC (`Role`/`RoleAssignment` + `OrgRole`). `points`/`level` counters → **removed as source of truth**, replaced by `XpEvent` log + summary. `verification_token`/`reset_token` → `VerificationToken`. UUIDv7 PK replaces `INT AUTO_INCREMENT`. |
| 2 | `refresh_tokens` | `Session` | Now carries rotation family, device/geo, `amr`, active-org context, revocation (Phase 2 doc 05 §3). |
| 3 | `categories` | `Category` + `CategoryTranslation` | Name/description move to translation rows; `color`/`icon`/`slug` stay language-neutral. |
| 4 | `courses` | `Course` + `CourseTranslation` + `CourseTag` + `CourseReview` | `tags` JSON → `Tag`/`CourseTag` (filterable). `requirements`/`what_you_learn` JSON → translation arrays. `price`/`is_free` → tier model (`minPlanTier`, commerce). `rating` float → integer x100. `instructor_id` → nullable (in-house content has no single instructor). |
| 5 | `modules` | `CourseModule` + `ModuleTranslation` | Titles localized. |
| 6 | `lessons` | `Lesson` + `LessonTranslation` + `LessonVersion` | `content`/`video_url`/`resources` localized (per-locale video for dubbing/subtitles). `lesson_type` retained. **New:** version history (FR-AC-028). |
| 7 | `enrollments` | `Enrollment` | Extended to enroll in **paths** too (not just courses); `progress_percent` tinyint → `progressBps` (basis points, no rounding). |
| 8 | `lesson_progress` | `LessonProgress` | Direct carry-over; UUIDs + tenant-safe. |
| 9 | `labs` | `Lab` + `LabTranslation` + `LabTask` (+ hints, translations) | **Substantial:** `flag`/`flag_format` → per-task `answerSpec` + dynamic per-session flags (Phase 2 doc 07 §6); single flag → multi-task guided format (FR-AC-041). `docker_image`/`docker_port` → `scenarioKey`/`scenarioVersion` (registry reference; real orchestration replaces the MVP's simulated terminal). `hints` JSON → `LabHint` rows with XP cost. |
| 10 | `lab_submissions` | `FlagSubmission` | Retained (rate-limited attempt log); now task-aware. |
| 11 | `lab_completions` | `LabCompletion` + `LabTaskCompletion` | First-solve row retained; per-task completion added for guided format. |
| 12 | `quizzes` | `Assessment` (+ `AssessmentTranslation`) | Generalized to quiz **and** exam (`AssessmentType`), with time limits, attempt caps, randomization (FR-AC-024). |
| 13 | `quiz_questions` | `AssessmentQuestion` + `QuestionTranslation` + `QuestionOption` (+ translations) | `options` JSON → `QuestionOption` rows (orderable, translatable). `correct_answer` JSON → `answerKey` (typed in contracts). New question types (`fill_in`, `ordered`). |
| 14 | `quiz_attempts` | `QuizAttempt` | Retained; `score` tinyint → `scoreBps`. |
| 15 | `certificates` | `Certificate` | **Upgraded:** path certificates too; public verification (`certificateNumber`), locale, revocation (FR-AC-065). |
| 16 | `achievements` | `Badge` + `BadgeTranslation` | Localized; condition model retained. |
| 17 | `user_achievements` | `UserBadge` | Direct carry-over. |
| 18 | `forum_posts` | `Post` + `PostVote` + `PostReport` (+ `Forum`) | `upvotes` counter → `PostVote` rows + maintained `voteScore`. **New:** moderation state, spoiler shielding, accepted-answer flag. |
| 19 | `notifications` | `Notification` + `NotificationPreference` | **New:** per-category channel preferences + digests (FR-AC-130). |

## Retirements

None outright. Two counters are **deliberately demoted from source-of-truth to derived**:
- `users.points` / `users.level` → derived from `XpEvent` (integrity: the MVP could drift; the event log cannot — FR-AC-060 AC).
- `forum_posts.upvotes` → derived from `PostVote` (prevents double-vote and vote-manipulation drift).

These columns don't disappear conceptually — they reappear as maintained read-model fields (`UserProgressSummary.totalXp`, `Post.voteScore`) rebuilt from the authoritative rows.

## Seed content migration (Phase 1 doc 09 §5 step 3)

The MVP ships seed data: 8 categories, 7 achievements, and course/lab fixtures. Migration path:
1. Export MVP seed rows to JSON.
2. Transform through a one-off script into the new shape: categories → `Category` + `en`/`ar` `CategoryTranslation` (Arabic added — the MVP was English-only); achievements → `Badge` + translations; courses/labs → the new content pipeline (first real test of the authoring tooling, per Phase 1).
3. Load via the seed runner (doc 04 §4), not raw SQL — exercising the same code path production content will use.

The 8 categories and 7 achievements map cleanly; the values become the starting rows of the bilingual seed. Category colors/icons carry over verbatim.

## What the mapping proves

The MVP's domain decomposition was sound (Phase 1 doc 09 §2): courses→modules→lessons, enrollment + progress, labs + submissions + completions, badges all survive structurally. The rebuild's changes are **additive** (translations, two new platforms, versioning, preferences) and **integrity-driven** (event logs replacing counters, rows replacing JSON where querying matters) — not a redesign of what the MVP got right.
