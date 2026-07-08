# 03 — Business Model & Pricing

> Prices below are a **working hypothesis** benchmarked against TryHackMe (~$14/mo), HTB Academy (~$18/mo student tier), Coursera Plus (~$59/mo), and regional purchasing power. Final numbers get validated in the pricing-strategy phase; what Phase 2 architecture depends on is the **structure** (tiers, periods, seats, coupons, regional pricing), which is fixed here.

## 1. Revenue streams

1. **Academy B2C subscriptions** — Free, Learner, Pro tiers; monthly/quarterly/yearly.
2. **Academy B2B** — Corporate (per-seat, self-serve) and Enterprise (contract, SSO, custom).
3. **Services engagements** — fixed-scope packages, T&M, and annual retainers.
4. **Managed services** — MSSP/SOC monthly contracts.
5. **Marketplace** (fast-follow) — third-party instructor courses, revenue share.
6. **Gift cards & bundles** — prepaid subscriptions, course+voucher bundles.

## 2. Academy plan matrix

| Capability | Free | Learner | Pro | Corporate | Enterprise |
|---|---|---|---|---|---|
| Price (USD, monthly) | $0 | $12.99 | $24.99 | $39/seat (min 5) | Custom |
| Yearly (≈2 months free) | — | $129 | $249 | $390/seat | Custom |
| Quarterly | — | $35 | $67 | — | — |
| Courses & paths | Intro tier only | All | All | All | All + private content |
| Browser labs | 1/day, 1h cap | Unlimited | Unlimited | Unlimited | Unlimited |
| Deployable machines | — | 2 concurrent | 4 concurrent, extended time | 4/seat | Custom pools |
| VPN lab access | — | ✓ | ✓ | ✓ | ✓ + dedicated subnets |
| CTF events | Public only | All | All + early access | Private team CTFs | Private team CTFs |
| Certificates | Course completion only | ✓ | ✓ + path certificates | ✓ | ✓ + co-branded |
| Career services (job board, resume builder, interview prep) | Browse only | ✓ | ✓ + priority listing | ✓ | ✓ |
| Team management, assignments, reporting | — | — | — | ✓ | ✓ + API/LMS export |
| SSO (SAML/OIDC), SCIM | — | — | — | — | ✓ |
| Private leaderboards | — | — | — | ✓ | ✓ |
| Support | Community | Standard | Priority | Priority | Dedicated CSM, SLA |

**Design intents behind the matrix:**
- Free tier is an acquisition funnel with hard resource caps (lab compute is the marginal cost that can sink us — see NFR-042 cost controls).
- Pro's value is concurrency, early access, and career priority — upgrades driven by ambition, not artificial locks.
- Corporate is self-serve with a credit card up to 50 seats; beyond that, sales-assisted Enterprise.
- Instructors have a **separate account role, not a paid plan**: revenue share (proposed 70/30 instructor/platform for marketplace content; commissioned in-house content is work-for-hire).

## 3. Billing structure (architecture-relevant)

- **Payment providers:** Stripe (cards, Apple Pay, Google Pay, SEPA), PayPal; regional gateways (e.g., Moyasar/Tap/HyperPay for KSA/GCC, Paymob for Egypt) behind a provider-abstraction layer — v1 ships Stripe + PayPal, regional rails fast-follow (FR-AD-040s).
- **Currency & regional pricing:** USD base; SAR/EGP/AED price books with PPP-adjusted tiers. Prices stored per plan+currency, never converted at display time.
- **Tax:** VAT handling per jurisdiction (15% KSA, 14% EG, 5% AE…), tax-inclusive display where legally required; invoices are legal documents with sequential numbering per jurisdiction.
- **Proration & lifecycle:** upgrade prorates immediately; downgrade applies at period end; cancellation retains access to period end; dunning (3 retries + grace) before suspension.
- **Refunds:** 7-day no-questions on first subscription; otherwise case-by-case via support with admin approval flow.
- **Coupons:** percentage or fixed, scoped (plan/duration/first-N-cycles), stackability off by default, campaign-tagged for attribution.
- **Referrals:** give-get (referrer gets 1 free month per converted referral, capped 12/yr; referee gets 20% first cycle).
- **Affiliates:** tracked links, 25% first-year revenue share, monthly payout above $50 threshold, self-serve dashboard.
- **Gift cards:** fixed denominations, redeemable against any B2C plan, 12-month expiry where law permits.

## 4. Services pricing structure

| Offering | Model | Proposed anchor |
|---|---|---|
| External pentest (network/web) | Fixed-scope package by asset count | from $6,000 |
| Web app / API assessment | Fixed-scope per app | from $8,000 |
| Mobile app assessment | Fixed per platform | from $7,000 |
| Cloud security review (AWS/Azure/GCP) | Fixed per account/subscription | from $9,000 |
| Active Directory security assessment | Fixed per forest | from $10,000 |
| Red team engagement | Scoped T&M, 3–6 weeks | from $30,000 |
| Purple team program | Quarterly retainer | from $12,000/qtr |
| Compliance readiness (ISO 27001, PCI DSS, NCA ECC, SAMA CSF) | Fixed phases + audit support | from $15,000 |
| Incident response retainer | Annual retainer + incident T&M | from $18,000/yr |
| MSSP / SOC monitoring | Monthly per-asset tiering | from $4,000/mo |
| Secure code review / SDLC consulting | T&M day rate | $1,200–1,800/day |
| Awareness training | Per-cohort or bundled with Academy corporate seats | from $3,500 |

**Bundle mechanics (the flywheel):** every completed engagement's closing report includes a scoped corporate Academy proposal at 20% first-year discount targeting the skill gaps found; Academy Enterprise contracts include preferred services rates. Cross-sell attribution is tracked in CRM (FR-AD-021).

## 5. Unit economics — working assumptions

| Assumption | Value | Basis |
|---|---|---|
| Free→paid conversion | 3–5% | TryHackMe-class benchmark |
| B2C gross margin | 75–85% | Lab compute is the main COGS; caps keep free-tier cost <$0.40/user/mo |
| B2C monthly churn | 6–8% early, target <4% | Gamification + path lock-in reduce churn |
| Blended B2C ARPU | ~$15/mo | Learner-heavy mix |
| Corporate ACV | $6k–30k | 15–60 seats typical |
| CAC (B2C) | <$25 organic-led | Content/SEO/community strategy |
| Services gross margin | 45–55% | Consultant utilization ≥65% |

**Break-even sketch:** platform fixed costs (infra + tooling) estimated $8–15k/mo at v1 scale → covered by ~900 Learner-equivalent subscribers **or** 2 mid-size corporate accounts **or** 1–2 services engagements/month. The services arm de-risks the Academy's ramp — this is the core financial argument for the dual model.

## 6. Pricing decisions needed from stakeholders

1. Confirm USD anchors above or direct a regional-first price book (SAR anchor).
2. Marketplace revenue share: 70/30 proposed — approve or adjust before instructor outreach.
3. Free tier depth: intro courses only (proposed) vs. first module of every course (better conversion data, higher content leak).
4. Whether quarterly billing is worth the SKU complexity (data from competitors is mixed; recommended: keep, it converts students paid per-semester).
