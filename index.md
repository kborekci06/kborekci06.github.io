---
layout: default
title: "Home"
description: "Kaan Borekci Engineering Portfolio"
---

{% include hero.html %}


<div style="display: flex; align-items: center; justify-content: space-between;">
  <h2 class="projects-section-title">Ongoing Projects</h2>
  <div class="hero__cta">
    <a class="btn btn--secondary" href="/experience/">More projects →</a>
  </div>
</div>
{% include project-grid.html items=site.data.experience_featured %}
