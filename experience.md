---
title: Experience
layout: default
---
<!-- # Add/edit projects here. The page auto-renders the grid.
# For each project:
# - title: shown under the image
# - url: where the tile links to
# - image: square-ish image path (recommended: 1200x1200 or larger)
# - blurb: short hover description (2–4 lines)
# - tags: optional, small labels

# Experience -->

<h1>Experience</h1>

<p class="projects-lede">
  My engineering work spanning medical devices, robotics, and ML for healthcare.
</p>

<h2 class="projects-section-title">Ongoing Projects</h2>
{% include project-grid.html items=site.data.experience_featured %}

{% if site.data.experience_internships and site.data.experience_internships.size > 0 %}
<h2 class="projects-section-title">Internships</h2>
{% include project-grid.html items=site.data.experience_internships %}
{% endif %}

<h2 class="projects-section-title">Course Projects</h2>
{% include project-grid.html items=site.data.experience_course %}