---
layout: page
published: false
title: "{{ORG_OR_LAB}} — {{ROLE_TITLE}}"
permalink: /projects/{{SLUG}}/
description: "{{ONE_LINE_FOCUS}}"
tags: [{{TAGS_COMMA_SEPARATED}}]

dates: "{{DATES}}"
role: "{{ROLE_TITLE}}"
context: "{{CONTEXT}}"
team: "{{TEAM}}"
tech: "{{TOOLS_ENV_SHORT}}"
---

## A) Role snapshot

{{ONE_LINE_FOCUS}}

{% include project-meta.html
  dates=page.dates
  role=page.role
  context=page.context
  team=page.team
  tech=page.tech
%}

{% include media-figure.html
  src="/assets/img/projects/{{SLUG}}/hero.png"
  alt="{{ORG_OR_LAB}} snapshot"
  caption="{{HERO_CAPTION}}"
%}

---

## B) What I owned

- {{OWNED_1}}
- {{OWNED_2}}
- {{OWNED_3}}
- {{OWNED_4}}

---

## C) Impact highlights

- {{IMPACT_1_WITH_METRIC_OR_SAFE_PROXY}}
- {{IMPACT_2_WITH_METRIC_OR_SAFE_PROXY}}
- {{IMPACT_3_WITH_METRIC_OR_SAFE_PROXY}}

---

## D) Technical deep dives (optional)

### Deep dive 1 — {{DEEP_DIVE_TITLE}}

- **Problem:** {{DD_PROBLEM}}
- **Approach:** {{DD_APPROACH}}
- **Result:** {{DD_RESULT}}

{% include media-figure.html
  src="/assets/img/projects/{{SLUG}}/results.png"
  alt="Deep dive result"
  caption="Representative result (sanitized if needed)."
%}

---

## E) Collaboration & communication

- {{COLLAB_1}}
- {{COLLAB_2}}
- {{COLLAB_3}}

---

## F) Skills / tools

{{SKILLS_TAG_LINE}}

---

## G) Links (optional)

- {{LINK_1}}
- {{LINK_2}}