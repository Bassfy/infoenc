# 01 — Executive Summary

## What INFOENC is

INFOENC is a cybersecurity company with two mutually reinforcing lines of business:

1. **INFOENC Services** — a professional security services firm delivering offensive security (penetration testing, red/purple teaming), defensive services (SOC, incident response, forensics, managed security), advisory (compliance, risk, secure SDLC), and specialized assessments (cloud, Active Directory, mobile, web, API).
2. **INFOENC Academy** — a hands-on cybersecurity learning platform combining structured learning paths and courses (Coursera/Udemy model) with interactive labs, deployable machines, and CTF challenges (TryHackMe/Hack The Box model), wrapped in a gamified progression system (XP, ranks, badges, leaderboards) and career services (job board, roadmaps, resume and interview preparation).

The two businesses share one brand, one identity platform, and one back office. Each feeds the other:

- Services engagements surface real-world attack patterns that become Academy labs and course material — content competitors cannot copy.
- The Academy is a talent pipeline for the services firm and a lead source (a company that trains its team with INFOENC will shortlist INFOENC for its next pentest).
- The consulting brand gives the Academy credibility that pure e-learning platforms lack; the Academy gives the consulting firm reach and recurring revenue that project-based firms lack.

## Why now

- Global cybersecurity workforce shortage remains in the millions of unfilled roles; demand for practical (not certificate-mill) training keeps growing.
- The MENA region — a primary early market for INFOENC, hence first-class Arabic/RTL support — is investing heavily in national cybersecurity capability (Saudi Vision 2030, national cyber authorities, university programs) while quality Arabic-language, hands-on training remains scarce. Cyberani and NetRiders validate demand; neither combines a consulting arm, gamified labs, and bilingual delivery in one product.
- Enterprises increasingly buy training and assessment from the same trusted vendor ("assess, then upskill the gaps") — a bundle INFOENC is structurally built for.

## Business model at a glance

| Stream | Model | Character |
|--------|-------|-----------|
| Academy subscriptions | Free tier + Learner/Pro monthly, quarterly, yearly | Recurring, high-margin, scales with content |
| Academy B2B | Corporate seats + Enterprise (SSO, private leaderboards, reporting) | Recurring, larger ACV, stickier |
| Services engagements | Fixed-scope packages + time & materials + retainers | Project revenue, high day rates |
| Managed services (MSSP/SOC) | Monthly contracts | Recurring B2B |
| Marketplace & instructors (fast-follow) | Revenue share on third-party courses | Long-tail content growth |

Full plan matrix, pricing proposal, and unit-economics assumptions: [doc 03](03-business-model-and-pricing.md).

## Product principles

1. **Hands-on beats video.** Every learning concept gets an interactive component — a lab, a quiz, a challenge. Video-only courses are the floor, not the ceiling.
2. **Bilingual by construction.** Arabic (RTL) and English (LTR) are both first-class across every page, email, certificate, and invoice — not a bolted-on translation layer.
3. **Practitioner credibility.** Content authored and reviewed by working consultants; labs derived from anonymized real engagements.
4. **Premium craft.** Design quality at the level of Linear, Stripe, and Vercel. Dark-mode-first, cinematic but performant. The product must *feel* expensive.
5. **AI-operated back office.** Support triage, lead qualification, proposal/report generation, and content-production assistance are automated from day one, so a small team operates like a large one.

## Where we are today

A functional MVP exists (Express/React/MySQL: courses, CTF-style labs, leaderboard, achievements, JWT auth). It validated the core loop but was built as a prototype, not the enterprise platform described above. Phase 1 recommends **rebuilding on the target stack** (Next.js 15 / NestJS / PostgreSQL) while porting the MVP's content model and lessons learned. Full audit and rationale: [doc 09](09-current-state-assessment.md).

## The ask

Approve this Phase 1 package — scope, pricing structure, cutlines, migration decision — so Phase 2 (System Architecture) can begin against a stable requirements baseline.
