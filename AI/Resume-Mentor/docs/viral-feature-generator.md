# Prompt 09 - Viral Feature Generator

Version 1.0

## Role

You are a Viral Growth Board made of:

- Product Hunt Hunter
- Reddit Power User
- GitHub Maintainer
- Growth Hacker

Your job is to make Resume-Mentor shareable without turning user resumes into privacy risks.

## Goal

Design:

1. Viral Features
2. Sharing Mechanisms
3. Achievement System
4. Leaderboard
5. Career Score
6. Agent Battle

Final output:

```text
Top 20 Viral Ideas
```

## Core Viral Principle

Resume-Mentor should not ask users to share private resumes.

It should help users share:

- anonymized scores
- before/after improvements
- agent critiques
- career progress badges
- public proof assets
- open-source prompt workflows
- learning progress

## Privacy Rules

Every viral feature must support:

- anonymization
- private-by-default sharing
- user approval before publishing
- redaction of names, companies, email, phone, location, salary, and confidential projects
- no public ranking by sensitive identity
- no claim that scores guarantee interviews or offers

## 1. Viral Features

### AI Resume Roast

Users receive a short, shareable critique from multiple agents.

Share format:

```text
My resume got roasted by:
Recruiter: 6/10
ATS: 7/10
Hiring Manager: 5/10
Devil Advocate: 4/10
```

Risk:

Can feel negative or humiliating.

Guardrail:

Make sharing opt-in and anonymized.

### Before / After Bullet Card

Show one resume bullet before and after evidence-backed rewrite.

Share format:

```text
Before:
Responsible for product coordination.

After:
Led 3 cross-functional product launches and reduced requirement handoff time by 28%.
```

Risk:

May reveal confidential metrics.

Guardrail:

Add redaction and "hide company / metric" controls.

### Career Knowledge Base Snapshot

Shows progress building reusable career assets.

Share format:

```text
Career KB Progress:
Achievements: 12
Leadership Stories: 4
Interview Stories: 8
Skill Evidence: 21
```

Risk:

Low, if no details are exposed.

Guardrail:

Share aggregate counts only.

### Agent Battle

Two agents debate a resume bullet or career positioning.

Example:

```text
Recruiter: This is too vague.
Hiring Manager: The ownership is unclear.
Evidence Agent: Ask for baseline and result.
```

Risk:

Could expose resume text.

Guardrail:

Allow anonymized prompt mode and redacted text.

### Career Score

Composite score based on clarity, evidence, JD match, ATS readability, interview readiness, and brand strength.

Risk:

Fake precision.

Guardrail:

Call it a diagnostic score, not a hiring probability.

## 2. Sharing Mechanisms

### Shareable Diagnostic Card

One-click export as image.

Fields:

```text
Career Score
Top Improvement
Agent Verdict
Next Action
```

### Public Anonymized Report

Creates a link with all personal details removed.

Sections:

```text
Score
Top gaps
Before / after
Agent comments
```

### LinkedIn Share

Share career progress, not private resume content.

Example:

```text
I turned 8 vague resume bullets into evidence-backed career stories this week.
```

### GitHub Badge

For developers:

```text
Career KB: 82% Complete
Interview Stories: 10
GitHub Profile Reviewed
```

### Referral Unlock

Users invite a friend to unlock:

- one extra agent critique
- one extra before/after card
- one interview simulator round

## 3. Achievement System

Achievement badges:

```text
Evidence Builder
Added proof to 5 achievements.

No-Fluff Resume
Removed 10 vague claims.

ATS Ready
Fixed critical parsing risks.

Interview Ready
Built 5 STAR stories.

Leadership Signal
Created 3 leadership stories.

Career OS Builder
Completed Career Knowledge Base.

LinkedIn Upgrade
Optimized Headline, About, and Experience.

Salary Proof Builder
Connected achievements to compensation evidence.
```

## 4. Leaderboard

Leaderboards should rank improvement behavior, not sensitive personal status.

Recommended leaderboards:

```text
Most Improved Career Score
Most Evidence Added
Most Vague Bullets Fixed
Most Interview Stories Completed
Top Anonymous Resume Roast
Top Open-Source Career Pack Contributor
```

Avoid:

```text
Highest Salary
Best Company
Most Elite School
Real Name Ranking
Public Resume Ranking
```

## 5. Career Score

Career Score should be explainable and modular.

Score dimensions:

```text
Career Clarity: 0-100
Evidence Strength: 0-100
JD Match: 0-100
ATS Readability: 0-100
Interview Readiness: 0-100
Leadership Signal: 0-100
LinkedIn Visibility: 0-100
```

Output:

```text
Career Score:
Strongest Area:
Weakest Area:
Top 3 Fixes:
Next Best Action:
```

Rule:

Never say:

```text
You have an 82% chance of getting hired.
```

Say:

```text
Your current profile has an 82/100 diagnostic score for this target role.
```

## 6. Agent Battle

Agent Battle makes critique entertaining and shareable.

Battle modes:

```text
Recruiter vs Hiring Manager
ATS vs Designer Resume
Devil Advocate vs Career Coach
Executive Recruiter vs Startup Founder
Evidence Agent vs Resume Writer
```

Output:

```text
Claim:
Agent A Verdict:
Agent B Verdict:
Conflict:
Final Decision:
Question To Ask User:
```

Best use cases:

- vague bullet
- controversial career gap
- startup failure
- inflated leadership claim
- salary negotiation claim

## Top 20 Viral Ideas

### 1. AI Resume Roast

Multi-agent critique that users can share as an anonymized card.

### 2. Before / After Bullet Card

Turns one weak bullet into an evidence-backed bullet.

### 3. Career Score Diagnostic

A modular score with clear next actions.

### 4. Agent Battle

Two agents debate whether a claim belongs in the resume.

### 5. No-Fluff Resume Challenge

Users remove vague claims and earn a badge.

### 6. Evidence Builder Streak

Users add one proof-backed achievement per day.

### 7. Anonymous Resume Benchmark

Compare profile completeness against anonymized peers in same role.

### 8. Recruiter 10-Second Test

Share whether a recruiter can understand the profile in 10 seconds.

### 9. ATS Risk Snapshot

Share critical ATS issues fixed without exposing resume content.

### 10. Interview Readiness Score

Shows how many STAR stories are ready for target role.

### 11. Career KB Completion Badge

Share progress toward a complete Career Knowledge Base.

### 12. LinkedIn Glow-Up Card

Shows old headline vs optimized headline.

### 13. Career Gap Quest

Turns role gaps into quests users can complete.

### 14. Skill Proof Map

Shows which skills have evidence and which are unsupported.

### 15. Promotion Case Builder Badge

For users preparing internal promotion.

### 16. Salary Proof Score

Scores whether the user's compensation ask has evidence.

### 17. GitHub Profile Roast

For developers, reviews GitHub profile and pinned repos.

### 18. Public Career Pack Template

Users can publish sanitized career pack templates.

### 19. Community Agent Packs

Users create and share custom agent teams.

### 20. Open-Source Skill Contribution Leaderboard

GitHub contributors add industry skills and get ranked by accepted contributions.

## Viral Feature Priority

Build first:

```text
1. AI Resume Roast
2. Before / After Bullet Card
3. Career Score Diagnostic
4. Recruiter 10-Second Test
5. Career KB Completion Badge
```

These are the fastest to understand, easiest to screenshot, and safest to share when anonymized.

## Final Output Format

```text
Viral Feature Plan

1. Viral Features
2. Sharing Mechanisms
3. Achievement System
4. Leaderboard
5. Career Score
6. Agent Battle
7. Top 20 Viral Ideas
8. Privacy Guardrails
9. MVP Viral Feature Priority
```
