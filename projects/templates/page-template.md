---
layout: page
title: "Project Page Templates (Snippets)"
permalink: /templates/
published: false
---

# Project Page Cookbook (Snippets)

Use this page as a library of copy/paste blocks when writing project pages.

---

## 1) Minimal Page Front Matter

```yaml
---
layout: page
title: "Project Title"
permalink: /projects/project-slug/
description: "One-line overview."
tags: ["Tag1", "Tag2"]

dates: "2025–Ongoing"
role: "Your role"
context: "Personal / Course / Internship"
team: "Solo / Team of X"
tech: "Tools/stack in a short phrase"
---
```

## Metadata:
{% include project-meta.html
  dates=page.dates
  role=page.role
  context=page.context
  team=page.team
  tech=page.tech
%}

## Bullets
- Bullet 1
- Bullet 2
- Bullet 3


## 2 Videos Side by Side
{% include media-2up.html
  left_src="/assets/video/projects/x/demo1.mp4"
  left_poster="/assets/img/projects/x/poster1.png"
  left_caption="Controller A"

  right_src="/assets/video/projects/x/demo2.mp4"
  right_poster="/assets/img/projects/x/poster2.png"
  right_caption="Controller B"
%}

## 1 Video 1 Image Side by Side:
{% include media-2up.html
  left_src="/assets/img/projects/x/architecture.png"
  left_caption="Architecture"

  right_src="/assets/video/projects/x/demo.mp4"
  right_poster="/assets/img/projects/x/poster.png"
  right_caption="Demo"
%}

## 3 Images Side by Side:
{% include media-3up.html
  a_src="/assets/img/projects/project-slug/arch.png"
  a_alt="Architecture diagram"
  a_caption="System architecture."

  b_src="/assets/img/projects/project-slug/test.png"
  b_alt="Test setup"
  b_caption="Hardware test setup."

  c_src="/assets/img/projects/project-slug/results.png"
  c_alt="Results plot"
  c_caption="Tracking performance results."
%}

## 3 Videos Side by Side:
{% include media-3up.html
  a_src="/assets/video/projects/project-slug/demo1.mp4"
  a_poster="/assets/img/projects/project-slug/poster1.png"
  a_caption="Critically damped response."

  b_src="/assets/video/projects/project-slug/demo2.mp4"
  b_poster="/assets/img/projects/project-slug/poster2.png"
  b_caption="Underdamped oscillation."

  c_src="/assets/video/projects/project-slug/demo3.mp4"
  c_poster="/assets/img/projects/project-slug/poster3.png"
  c_caption="Torque-limited case."
%}


## Results at a glance:
{% capture results_html %}
<ul>
  <li><strong>Latency:</strong> 12 ms end-to-end</li>
  <li><strong>Throughput:</strong> 20 Hz sustained</li>
  <li><strong>Accuracy:</strong> 92% on validation set</li>
</ul>
{% endcapture %}

{% include callout.html
  kind="results"
  title="Results at a glance"
  content=results_html
%}

## Warnings/Callouts:
{% include callout.html
  kind="note"
  title="Note"
  content="This build log uses sanitized data due to confidentiality."
%}

## Clean links section:
{% include link-list.html slug="robotic-manipulation" %}

## Text formatting:
### Narrow:
<div class="text-narrow">
  <p>Put dense text here…</p>
</div>

### Wide:
<div class="text-wide">
  <p>Put wide content here (tables/grids)…</p>
</div>

## Spec Table:
{% include spec-table.html slug="robotic-manipulation" %}

## Timeline:
{% include timeline.html slug="robotic-manipulation" %}

## Accordion:
{% include accordion.html slug="robotic-manipulation" %}

## Tag Row:
{% include tag-row.html slug="robotic-manipulation" %}

## Must add the following to the bottom of the page for autoplay of videos in page:
<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>
