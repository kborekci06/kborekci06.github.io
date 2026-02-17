---
layout: page
title: "Template"
published: false
permalink: /projects/{{SLUG}}/
description: "{{ONE_LINE_OVERVIEW}}"
tags: [{{TAGS_COMMA_SEPARATED}}]

dates: "{{DATES}}"
role: "{{ROLE}}"
context: "{{CONTEXT}}"
team: "{{TEAM}}"
tech: "{{TECH_STACK_SHORT}}"
---

<!--
HOW TO USE
1) Copy this file to: projects/{{SLUG}}.md
2) Replace placeholders (search for {{ ... }})
3) Add tile entry in _data/experience_featured.yml (or internships/course)
4) Drop media into:
   - assets/img/projects/{{SLUG}}/
   - assets/video/projects/{{SLUG}}/
-->

## A) Overview

**One-line overview:** {{ONE_LINE_OVERVIEW}}

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

## B) Problem & Motivation

{{PROBLEM_2_TO_5_SENTENCES}}

---

## C) Requirements & Goals

- **Performance targets:** {{PERFORMANCE_TARGETS}}
- **Constraints:** {{CONSTRAINTS}}
- **Success criteria:** {{SUCCESS_CRITERIA}}

---

## D) Approach & Design Process

### D1) System architecture

{% include media-figure.html
  src="/assets/img/projects/{{SLUG}}/arch.png"
  alt="System architecture"
  caption="High-level architecture and data flow."
%}

### D2) Key technical decisions (tradeoffs)

- {{DECISION_1}}
- {{DECISION_2}}
- {{DECISION_3}}

### D3) Implementation highlights

- {{HIGHLIGHT_1}}
- {{HIGHLIGHT_2}}
- {{HIGHLIGHT_3}}
- {{HIGHLIGHT_4}}

### D4) Testing & validation

- {{VALIDATION_1}}
- {{VALIDATION_2}}
- {{VALIDATION_3}}

{% include media-figure.html
  src="/assets/img/projects/{{SLUG}}/results.png"
  alt="Key results plot"
  caption="Representative results / validation plot."
%}

### D5) Challenges & how I solved them

- {{CHALLENGE_1}}
- {{CHALLENGE_2}}
- {{CHALLENGE_3}}

### D6) Collaboration & ownership

- **Worked with:** {{WHO_YOU_WORKED_WITH}}
- **My ownership:** {{YOUR_OWNERSHIP_ONE_SENTENCE}}

---

## E) Results & Current Status

**Results at a glance**
- {{RESULT_1_WITH_NUMBER_IF_POSSIBLE}}
- {{RESULT_2_WITH_NUMBER_IF_POSSIBLE}}
- {{RESULT_3_WITH_NUMBER_IF_POSSIBLE}}

{{RESULTS_PARAGRAPH_WHAT_IT_MEANS}}

**Current status:** {{CURRENT_STATUS}}  
**Next milestone:** {{NEXT_MILESTONE}}

---

## F) Future Steps & Reflections

- {{NEXT_STEP_1}}
- {{NEXT_STEP_2}}
- {{NEXT_STEP_3}}

**Lessons learned (optional)**
- {{LESSON_1}}
- {{LESSON_2}}

---

## G) Media Gallery (optional)

{% include media-video.html
  src="/assets/video/projects/{{SLUG}}/demo.mp4"
  poster="/assets/img/projects/{{SLUG}}/poster.png"
  caption="Demo: {{DEMO_CAPTION}}"
%}

{% include media-side-by-side.html
  left_src="/assets/img/projects/{{SLUG}}/arch.png"
  left_alt="Architecture diagram"
  left_caption="Architecture."
  right_src="/assets/img/projects/{{SLUG}}/results.png"
  right_alt="Results plot"
  right_caption="Key results."
%}

---

## H) Skills & Tools Used

- **Embedded:** {{EMBEDDED_SKILLS}}
- **Data/ML:** {{ML_SKILLS}}
- **Mechanical/Fluids:** {{FLUIDS_SKILLS}}
- **Process:** {{PROCESS_SKILLS}}

---

## I) Links

- **GitHub:** {{GITHUB_LINK}}
- **Docs:** {{DOCS_LINK}}
- **Poster/Report:** {{REPORT_LINK}}
- **Demo:** {{DEMO_LINK}}