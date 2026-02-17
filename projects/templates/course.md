---
layout: page
title: "{{PROJECT_TITLE}}"
permalink: /projects/{{SLUG}}/
description: "{{ONE_LINE_OVERVIEW}}"
tags: [{{TAGS_COMMA_SEPARATED}}]

dates: "{{DATES}}"
role: "{{ROLE}}"
context: "{{CONTEXT}}"
team: "{{TEAM}}"
tech: "{{TECH_STACK_SHORT}}"
---

## Summary

{{ONE_LINE_OVERVIEW}}

{% include project-meta.html
  dates=page.dates
  role=page.role
  context=page.context
  team=page.team
  tech=page.tech
%}

{% include media-figure.html
  src="/assets/img/projects/{{SLUG}}/hero.png"
  alt="{{PROJECT_TITLE}} hero visual"
  caption="{{HERO_CAPTION}}"
%}

---

## What I did

- {{DID_1}}
- {{DID_2}}
- {{DID_3}}
- {{DID_4}}

---

## Outcome

- {{OUTCOME_1}}
- {{OUTCOME_2}}
- {{OUTCOME_3}}

---

## Tools / Skills

{{TOOLS_SKILLS_TAG_LINE}}

---

## Media (optional)

{% include media-video.html
  src="/assets/video/projects/{{SLUG}}/demo.mp4"
  poster="/assets/img/projects/{{SLUG}}/poster.png"
  caption="Demo: {{DEMO_CAPTION}}"
%}

---

## Links

- **Repo/Report:** {{PRIMARY_LINK}}