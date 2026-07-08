# 02 — Entity-Relationship Diagrams

Per-domain ERDs (the whole schema in one diagram is unreadable). Relationships shown are the load-bearing ones; translation tables are collapsed to a note where they'd add noise. Authoritative source is always `/prisma/schema/`.

## Identity & tenancy

```mermaid
erDiagram
    User ||--o{ Credential : has
    User ||--o{ OAuthIdentity : has
    User ||--o{ Passkey : has
    User ||--o| TotpSecret : has
    User ||--o{ Session : has
    User ||--o{ OrgMembership : "member via"
    Organization ||--o{ OrgMembership : has
    Organization ||--o{ Team : has
    Organization ||--o| OrgSsoConfig : configures
    Organization ||--o{ OrgInvitation : issues
    Organization ||--o{ ApiKey : owns
    User ||--o{ RoleAssignment : granted
    Role ||--o{ RoleAssignment : in
    OrgMembership }o--o| Team : "grouped in"
```

Note: `User` is global; tenancy is expressed via `OrgMembership`. A personal learner = an `Organization(type: personal)` with one membership.

## Catalog & learning

```mermaid
erDiagram
    LearningPath ||--o{ PathItem : contains
    PathItem }o--o| Course : references
    PathItem }o--o| Lab : references
    PathItem ||--o{ PathItemPrereq : "gated by"
    Course ||--o{ CourseModule : has
    CourseModule ||--o{ Lesson : has
    Lesson ||--o{ Assessment : has
    Assessment ||--o{ AssessmentQuestion : has
    AssessmentQuestion ||--o{ QuestionOption : has
    Course ||--o{ Enrollment : "enrolled via"
    LearningPath ||--o{ Enrollment : "enrolled via"
    User ||--o{ Enrollment : enrolls
    User ||--o{ LessonProgress : tracks
    User ||--o{ QuizAttempt : attempts
    Assessment ||--o{ QuizAttempt : receives
    Organization ||--o{ LearningAssignment : assigns
```

Note: every content entity (`Course`, `Lesson`, `LearningPath`, `Assessment`, `Category`, question, option…) has a `*Translation` child keyed `(entityId, locale)` — the bilingual pattern (doc 01 §4).

## Gamification (XP as event log)

```mermaid
erDiagram
    User ||--o{ XpEvent : earns
    User ||--o| UserProgressSummary : "rolled up in"
    UserProgressSummary }o--o| Rank : "at"
    User ||--o{ UserBadge : earns
    Badge ||--o{ UserBadge : awarded
    User ||--o| UserStreak : maintains
    LeaderboardSnapshot }o--|| "scope" : "global/monthly/path/org"
```

`XpEvent` is the source of truth (append-only, idempotent via `(userId, ruleKey, sourceType, sourceId)`); `UserProgressSummary` and `LeaderboardSnapshot` are rebuildable read models.

## Labs & CTF

```mermaid
erDiagram
    Lab ||--o{ LabTask : has
    LabTask ||--o{ LabHint : has
    Lab ||--o{ LabSession : "instantiated as"
    User ||--o{ LabSession : starts
    Lab ||--o{ FlagSubmission : receives
    LabTask ||--o{ LabTaskCompletion : "completed as"
    LabSession ||--o{ LabTaskCompletion : "during"
    Lab ||--o{ LabCompletion : "first-solved as"
    CtfEvent ||--o{ CtfChallenge : has
    CtfChallenge ||--o{ CtfSolve : "solved as"
    User ||--o{ CtfSolve : solves
```

`LabSession.orchestratorRef` is the only link to the lab cluster (Phase 2 doc 07); flag seeds are envelope-encrypted and never leave the server.

## Commerce

```mermaid
erDiagram
    Organization ||--o{ Subscription : holds
    Plan ||--o{ Subscription : "billed on"
    Plan ||--o{ PlanPrice : "priced per currency"
    Organization ||--o{ Entitlement : "granted"
    Subscription ||--o{ Entitlement : "drives"
    Organization ||--o{ Invoice : "billed"
    Subscription ||--o{ Invoice : generates
    Invoice ||--o{ InvoiceLineItem : has
    Invoice ||--o{ Payment : "settled by"
    Coupon ||--o{ CouponRedemption : redeemed
    Affiliate ||--o{ AffiliateConversion : earns
```

`Invoice` is an immutable ledger (numbered at issue); `Payment.providerEventId` and `WebhookEvent.providerEventId` guarantee idempotent settlement.

## Engagements (crown jewel)

```mermaid
erDiagram
    Organization ||--o{ Engagement : "client of"
    Engagement ||--o{ Finding : produces
    Engagement ||--o{ Evidence : holds
    Engagement ||--o{ EngagementReport : delivers
    Engagement ||--o{ PortalMessage : discusses
    Engagement ||--o{ EngagementMilestone : plans
    Finding ||--o{ FindingComment : has
    Evidence ||--o{ EvidenceDownload : "logged as"
    FindingTemplate ||--o{ Finding : "instantiated as"
```

Every row here carries `orgId` (RLS) and the sensitive bodies are `Bytes` cipher columns (field-level encryption, NFR-020). `onDelete: Restrict` on `Engagement`/`Finding`/`Evidence` — retention governs deletion, not user action (doc 05).

## CRM · Support · Community · CMS · Automation · Platform

```mermaid
erDiagram
    Lead ||--o{ LeadActivity : logs
    Lead ||--o{ Proposal : generates
    Organization ||--o{ Ticket : raises
    Ticket ||--o{ TicketMessage : has
    Forum ||--o{ Post : contains
    Post ||--o{ Post : "replies (self)"
    Post ||--o{ PostVote : scored
    Post ||--o{ PostReport : "moderated via"
    AutomationWorkflow ||--o{ AutomationRun : runs
    AutomationRun ||--o| AutomationGate : "gated by"
    OutboxEvent }o--|| "BullMQ" : "relayed to"
    User ||--o{ Notification : receives
    AuditLog }o--|| "hash chain" : "tamper-evident"
```

## Table count by domain

| Domain | Tables (incl. translations) |
|---|---|
| identity | 8 |
| orgs | 6 |
| authz | 2 |
| catalog | 16 |
| learning | 9 |
| gamification | 10 |
| labs & ctf | 17 |
| commerce | 14 |
| engagements | 9 |
| crm | 3 |
| support | 4 |
| community | 6 |
| career | 6 |
| cms | 8 |
| automation | 3 |
| platform | 8 |
| **Total** | **~129 models** |

The MVP's 19 tables become ~129 — the growth is translations (bilingual mandate), the two new platforms (engagements, CRM, commerce, automation), and the integrity refactors (XP event log, invoice ledger, outbox). Every MVP table is accounted for in doc 03.
