# 06 — Requirements: INFOENC Academy

Scope: the learning platform for personas P1–P3, P5, P6. This is the largest requirement surface; the v1/fast-follow split here is the main scope decision of Phase 1 (cutlines justified in doc 10).

## 1. Accounts, identity & onboarding

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-001 | Registration/login: email+password, Google and GitHub OAuth | M |
| FR-AC-002 | MFA: TOTP authenticator apps; recovery codes | M |
| FR-AC-003 | Passkeys (WebAuthn) as first-class login | S |
| FR-AC-004 | Roles: student, instructor, org-admin (corporate), staff roles via RBAC (doc 07) | M |
| FR-AC-005 | Public profile: username, avatar, rank, badges, activity heatmap, completed paths; per-field privacy controls | M |
| FR-AC-010 | Email verification required before community/lab features | M |
| FR-AC-012 | Onboarding: goal + level questions → recommended learning path; skippable | M |
| FR-AC-013 | Account deletion (self-serve) and data export (GDPR/PDPL) | M |

## 2. Learning content

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-020 | Learning paths: ordered sequences of courses/labs with prerequisites, progress %, estimated hours, target role (e.g., SOC Analyst, Web Pentester, Cloud Security) | M |
| FR-AC-021 | Courses: modules → lessons; lesson types: video, article (rich markdown), interactive lab, quiz | M |
| FR-AC-022 | Video lessons: adaptive streaming, playback speed, resume position, subtitles (ar/en), transcript panel | M |
| FR-AC-023 | Quizzes: MCQ, multi-select, fill-in, ordered steps; explanations after answer; pass thresholds; attempt limits configurable | M |
| FR-AC-024 | Exams: timed, randomized question pools, no-back-navigation mode, results with per-domain breakdown | M |
| FR-AC-025 | Proctored certification exams (webcam/screen proctoring) | W — certification program is post-v1 (doc 10) |
| FR-AC-026 | Assignments: instructor-set tasks with file/text submission and instructor grading (corporate/institution cohorts) | S |
| FR-AC-027 | Live classes: scheduled sessions with external video integration (Zoom/Meet embed), attendance tracking | C |
| FR-AC-028 | Content versioning: published lessons keep history; learners see latest, admins can roll back | M |
| FR-AC-029 | Bilingual content model: every content item can exist in ar and en; language fallback with "not yet translated" notice; language completeness visible to admins | M |
| FR-AC-030 | Offline/downloadable lesson materials (PDF/companion files); full offline mode | C (files S, offline mode with mobile app) |

## 3. Hands-on labs

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-040 | Browser labs: containerized environments (attack box + target) accessible in-browser (terminal + optional desktop), time-boxed sessions, state reset | M |
| FR-AC-041 | Guided lab format: task list with flag/answer submission per task, hints (XP cost), completion tracking | M |
| FR-AC-042 | Deployable target machines with per-user instances, start/stop/extend/terminate controls, concurrency limits per plan | M |
| FR-AC-043 | VPN access to lab networks (per-user config download, session-bound) | S |
| FR-AC-044 | Cloud security labs (sandboxed AWS/Azure accounts) | C — expensive; post-v1 |
| FR-AC-045 | Lab builder for content team/instructors: define images, networking, flags, tasks from templates | M (internal), S (instructor self-serve) |
| FR-AC-046 | Anti-abuse: session caps, resource quotas, network egress restrictions from lab environments, cryptomining detection | M |
| FR-AC-090 | One guest-playable showcase lab without an account (rate-limited, ephemeral) | S |
| FR-AC-096 | Free-tier lab quotas: 1 browser lab/day, 60-min cap, no deployable machines (cost control, doc 03) | M |

## 4. CTF & competition

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-050 | Standing challenge library: jeopardy-style (web, crypto, forensics, pwn, reversing, misc) with dynamic per-user flags where feasible | M |
| FR-AC-051 | Scheduled CTF events: time-boxed, team or solo, freeze period, event leaderboard | S |
| FR-AC-052 | Private corporate CTFs (org-scoped events) | S |
| FR-AC-053 | Writeup submissions unlocked after solving; community writeups gated by solve | C |

## 5. Gamification & progression

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-060 | Single XP spine: XP from lessons, quizzes, labs, challenges; diminishing XP for repeats; anti-farming rules | M |
| FR-AC-061 | Rank ladder (e.g., Novice → Analyst → Operator → Specialist → Elite → Legend) computed from XP + verified skill events | M |
| FR-AC-062 | Badges/achievements: automatic triggers (streaks, firsts, category mastery, event placements); shareable badge images (Open Graph) | M |
| FR-AC-063 | Leaderboards: global, monthly, country, per-path; corporate private boards; opt-out respected | M |
| FR-AC-064 | Streaks with freeze tokens (earned, not bought) | S |
| FR-AC-065 | Certificates: course and path completion certificates, bilingual, PDF + verifiable public URL with unique ID/QR | M |

## 6. Community & career

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-070 | Discussion per lesson/lab (Q&A style, spoiler-shielded for flags), voting, accepted answers | M |
| FR-AC-071 | Contextual paywall: locked content shows learner's own path progress and localized pricing | M |
| FR-AC-072 | Forums/communities by topic; moderation tooling (report, hide, ban) + AI pre-moderation queue (FR-AU-022) | S |
| FR-AC-073 | Direct messaging between users (opt-in, blockable, moderated on report) | C |
| FR-AC-080 | Career roadmaps: role → required paths/skills → typical salaries → job links | S |
| FR-AC-081 | Job board: employer postings, filter by role/region; apply with INFOENC profile | S |
| FR-AC-082 | Resume builder: generates resume from verified platform accomplishments (paths, certs, CTF placements), bilingual templates, PDF export | S |
| FR-AC-083 | Interview prep: question banks per role, mock scenario labs | C |

## 7. Instructor platform

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-100 | Instructor application & review workflow | S |
| FR-AC-101 | Course builder: module/lesson editor (markdown + media), video upload pipeline, quiz builder, pricing/visibility settings | M (internal team), S (external instructors) |
| FR-AC-102 | Instructor dashboard: enrollments, completion funnels, ratings, revenue, payout statements | S |
| FR-AC-103 | Editorial workflow: draft → review (checklist + AI pre-review) → approved → published; rejections with feedback | M |

## 8. Corporate/team features

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-110 | Org workspace: seat management (invite/deactivate/transfer), team grouping, pre-built demo workspace on trial | M |
| FR-AC-111 | Assignments: org-admin assigns paths/courses with due dates; progress dashboard per member/team | M |
| FR-AC-112 | Reporting: exportable progress/skill reports (CSV/PDF); scheduled email reports | M |
| FR-AC-113 | SSO (SAML/OIDC) + SCIM provisioning | S — Enterprise tier |
| FR-AC-114 | Skills matrix: team competency view mapped to frameworks (NICE/MITRE ATT&CK coverage) | C |
| FR-AC-115 | LMS integration (SCORM/xAPI/LTI export) for institutions | C |

## 9. Commerce (learner-facing; admin side in doc 07)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-120 | Plan selection, checkout (Stripe + PayPal v1), upgrade/downgrade/cancel self-serve, billing history with invoice downloads | M |
| FR-AC-121 | Coupons at checkout; referral link generation and tracking dashboard | M |
| FR-AC-122 | Gift card purchase and redemption | C |
| FR-AC-123 | Corporate self-serve seat purchase (≤50 seats) with card or request-invoice flow | S |

## 10. Cross-platform

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AC-130 | Notifications: in-app center + email; per-category preferences; digest options | M |
| FR-AC-131 | Global search: courses, labs, paths, forum (bilingual index) | M |
| FR-AC-132 | Dark mode default, light mode option, persisted per user | M |
| FR-AC-133 | Mobile apps (iOS/Android) with core learning features and offline lessons | W v1 — fast-follow release; responsive web is v1's mobile answer (doc 10) |

## 11. Acceptance criteria — selected

**FR-AC-040 (browser labs)**
- Cold-start to interactive terminal ≤ 25s p95; session survives page refresh; expired session shows clear restart path.
- A learner can never reach another learner's lab instance (verified by automated isolation tests each deploy).
- Session teardown reclaims all resources within 2 minutes of expiry (cost control).

**FR-AC-060 (XP)**
- Identical action never grants XP twice except where rules explicitly allow (e.g., daily challenge).
- XP writes are idempotent and auditable (event log with source, amount, rule ID).
- Leaderboard reflects XP within 60s.

**FR-AC-065 (certificates)**
- Certificate URL verifies name, achievement, date, and revocation status without login; ID is unguessable.
- PDF renders correctly in both Arabic and English including RTL name handling.

**FR-AC-029 (bilingual content)**
- Switching language never loses the learner's place; untranslated items render the fallback language with a notice, not a 404.
