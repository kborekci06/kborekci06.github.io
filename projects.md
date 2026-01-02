---
title: Projects
layout: default

# Add/edit projects here. The page auto-renders the grid.
# For each project:
# - title: shown under the image
# - url: where the tile links to
# - image: square-ish image path (recommended: 1200x1200 or larger)
# - blurb: short hover description (2–4 lines)
# - tags: optional, small labels

featured_projects:
  - title: "BioNexus"
    url: "/projects/bionexus/"
    image: "/assets/img/projects/bionexus.jpg"
    blurb: "A modular, documentation-first medical embedded systems build with weekly milestones, verification, and open hardware/firmware releases."
    tags: ["Embedded", "MedTech", "Weekly Updates"]

  - title: "Diaphragm Control Device (Patent Pending, BMES 2025)"
    url: "/projects/diaphragm-control/"
    image: "/assets/img/projects/diaphragm-control.jpg"
    blurb: "Patent-pending embedded device work for pediatric CCHS: first-step data-collection platform toward closed-loop diaphragm pacer regulation."
    tags: ["Embedded", "Clinical", "PCB"]

  - title: "Infant Pose Lifting Evaluation (SRAL)"
    url: "/projects/infant-pose-pipeline/"
    image: "/assets/img/projects/infant-pose.jpg"
    blurb: "Reproducible evaluation pipeline for 3D pose lifting on retrospective infant videos, including alignment, anatomical metrics, and CUDA acceleration."
    tags: ["ML", "Biomechanics", "CUDA"]

mini_projects:
  - title: "Evolutionary Computation: NEAT vs Standard MLP"
    url: "/projects/neat-vs-mlp/"
    image: "/assets/img/projects/neat-mlp.jpg"
    blurb: "Compared evolved sparse topologies against dense baselines for classification, focusing on fitness dynamics and generalization."
    tags: ["Evolutionary", "ML"]

  - title: "Robotic Manipulation: Controller + Planning"
    url: "/projects/robotic-manipulation/"
    image: "/assets/img/projects/robot-manip.jpg"
    blurb: "Manipulation project covering kinematics/dynamics, planning, and closed-loop control with clear evaluation metrics."
    tags: ["Robotics", "Control"]

  - title: "Electronic System Design: Live Video Streaming"
    url: "/projects/live-video-streaming/"
    image: "/assets/img/projects/video-stream.jpg"
    blurb: "End-to-end embedded system integration project emphasizing performance constraints, reliability, and system-level debugging."
    tags: ["Embedded", "Systems"]

  - title: "Mevacor (Lovastatin) Drug Analysis"
    url: "/projects/lovastatin/"
    image: "/assets/img/projects/lovastatin.jpg"
    blurb: "BME 340 final report: mechanism, PK/PD, toxicology, clinical trials, and business context—structured like an industry brief."
    tags: ["Pharma", "Analysis"]

---

# Projects

<p class="projects-lede">
  A curated selection of engineering work spanning <strong>medical devices</strong>, <strong>robotics</strong>, and <strong>ML for healthcare</strong>.
  Hover over a tile for a short summary. Click the image or title to open the full project page.
</p>

---

## Flagship Projects

<div class="proj-grid">
  {% for p in page.featured_projects %}
  <article class="proj-card">
    <a class="proj-link" href="{{ p.url }}" aria-label="{{ p.title }}">
      <div class="proj-media">
        <img class="proj-img" src="{{ p.image }}" alt="{{ p.title }}" loading="lazy" />
        <div class="proj-overlay">
          <div class="proj-overlay__inner">
            <p class="proj-desc">{{ p.blurb }}</p>
            {% if p.tags %}
            <div class="proj-tags">
              {% for t in p.tags %}
                <span class="proj-tag">{{ t }}</span>
              {% endfor %}
            </div>
            {% endif %}
          </div>
        </div>
      </div>
    </a>

    <h3 class="proj-title"><a href="{{ p.url }}">{{ p.title }}</a></h3>
  </article>
  {% endfor %}
</div>

---

## Mini / Course Projects

<div class="proj-grid">
  {% for p in page.mini_projects %}
  <article class="proj-card">
    <a class="proj-link" href="{{ p.url }}" aria-label="{{ p.title }}">
      <div class="proj-media">
        <img class="proj-img" src="{{ p.image }}" alt="{{ p.title }}" loading="lazy" />
        <div class="proj-overlay">
          <div class="proj-overlay__inner">
            <p class="proj-desc">{{ p.blurb }}</p>
            {% if p.tags %}
            <div class="proj-tags">
              {% for t in p.tags %}
                <span class="proj-tag">{{ t }}</span>
              {% endfor %}
            </div>
            {% endif %}
          </div>
        </div>
      </div>
    </a>

    <h3 class="proj-title"><a href="{{ p.url }}">{{ p.title }}</a></h3>
  </article>
  {% endfor %}
</div>

<p class="projects-note">
  <strong>Future-proofing:</strong> to add a new tile, add one YAML block to either <code>featured_projects</code> or <code>mini_projects</code> at the top of this file.
  The grid, hover overlay, and links update automatically.
</p>
