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
    tags: ["Embedded Systems", "MedTech"]

  - title: "Digital Diaphragm Platform"
    url: "/projects/diaphragm-control/"
    image: "/assets/img/projects/diaphragm-control.jpg"
    blurb: "Patent-pending embedded device work for pediatric CCHS: first-step data-collection platform toward closed-loop diaphragm pacer regulation."
    tags: ["Embedded Systems", "Clinical", "PCB"]

  - title: "Infant Motor Development Research"
    url: "/projects/infant-pose-pipeline/"
    image: "/assets/img/projects/infant-pose.mov"
    blurb: "Reproducible evaluation pipeline for 3D pose lifting on retrospective infant videos, including alignment, anatomical metrics, and CUDA acceleration."
    tags: ["Machine Learning", "Biomechanics", "Signal Processing"]

mini_projects:
  - title: "Evolutionary Computation: NEAT Approach to EMG Classification"
    url: "/projects/neat-vs-mlp/"
    image: "/assets/img/projects/neat-mlp.jpg"
    blurb: "Compared evolved sparse topologies against dense baselines for classification, focusing on fitness dynamics and generalization."
    tags: ["Evolutionary Computation", "Machine Learning"]

  - title: "Robot Controller Design and Trajectory Planning"
    url: "/projects/robotic-manipulation/"
    image: "/assets/img/projects/robot-manip.mov"
    blurb: "Manipulation project covering kinematics/dynamics, planning, and closed-loop control with clear evaluation metrics."
    tags: ["Robotics", "Control"]

  - title: "Electronic System Design: Live Video Streaming"
    url: "/projects/live-video-streaming/"
    image: "/assets/img/projects/video-stream.png"
    blurb: "Embedded system project emphasizing performance constraints, reliability, and system-level debugging."
    tags: ["Embedded Systems", "PCB"]

  - title: "Analysis of Mevacor (Lovastatin) Clinical Development"
    url: "/projects/lovastatin/"
    image: "/assets/img/projects/lovastatin.jpg"
    blurb: "BME 340 final report: mechanism, PK/PD, toxicology, clinical trials, and business context—structured like an industry brief."
    tags: ["Pharmaceutical Engineering", "Clinical Trials"]

    # Future-proofing: to add a new tile, add one YAML block to either featured_projects or mini_projects at the top of this file. The grid, hover overlay, and links update automatically.

    # - title: "New Project Name"
    # url: "/projects/new-project/"
    # image: "/assets/img/projects/new-project.jpg"
    # blurb: "One sentence about the problem and one sentence about what you built."
    # tags: ["Embedded", "Robotics"]


---


# Projects

<p class="projects-lede">
  My engineering work spanning medical devices, robotics, and ML for healthcare.
</p>


<h2 class="projects-section-title">Flagship Projects</h2>

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


<h2 class="projects-section-title">Course Projects</h2>

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