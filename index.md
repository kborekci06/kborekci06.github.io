---
layout: default
title: "Home"
description: "Kaan Borekci Engineering Portfolio"
---

<section class="hero">
  <div class="hero__left">
    <div class="pill">
      <span class="pill__dot"></span>
      Available for opportunities
    </div>

    <h1 class="hero__title">
      Hello, I’m<br/>
      <span class="hero__name">Kaan Borekci</span>
    </h1>

    <p class="hero__subtitle">
      Engineer building <strong>medical & robotic systems</strong> with embedded firmware,
      sensing, and ML for healthcare.
    </p>

    <p class="hero__blurb">
      Currently: launching <strong>BioNexus</strong> — a modular, documentation-first medical embedded systems build with weekly progress updates.
    </p>

    <div class="hero__cta">
      <a class="btn btn--primary" href="/resume/">Download Resume</a>
      <a class="btn btn--secondary" href="/projects/">View My Work</a>
    </div>

    <div class="socials">
      <a class="social" href="https://github.com/kborekci06" target="_blank" rel="noopener" aria-label="GitHub">
        <!-- GitHub icon -->
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M12 .5C5.73.5.75 5.7.75 12.15c0 5.17 3.28 9.56 7.83 11.11.57.11.78-.25.78-.55v-2c-3.18.7-3.85-1.58-3.85-1.58-.52-1.36-1.27-1.72-1.27-1.72-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.21 1.76 1.21 1.02 1.8 2.68 1.28 3.33.98.1-.76.4-1.28.73-1.57-2.54-.3-5.21-1.31-5.21-5.83 0-1.29.44-2.34 1.16-3.17-.12-.3-.5-1.51.11-3.14 0 0 .95-.31 3.12 1.21a10.5 10.5 0 0 1 5.68 0c2.17-1.52 3.12-1.21 3.12-1.21.61 1.63.23 2.84.11 3.14.72.83 1.16 1.88 1.16 3.17 0 4.53-2.68 5.53-5.23 5.82.41.37.78 1.1.78 2.22v3.29c0 .3.21.66.79.55 4.55-1.55 7.83-5.94 7.83-11.11C23.25 5.7 18.27.5 12 .5z"/>
        </svg>
      </a>

      <a class="social" href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">
        <!-- LinkedIn icon -->
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.83v2.12h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1v9.36h-4v-8.3c0-1.98-.04-4.52-2.76-4.52-2.76 0-3.18 2.16-3.18 4.39v8.43h-4V7.98z"/>
        </svg>
      </a>

      <a class="social" href="/contact/" aria-label="Contact">
        <!-- Mail icon -->
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      </a>
    </div>
  </div>

  <div class="hero__right">
    <div class="portrait">
      <img src="/assets/img/headshot.jpg" alt="Portrait of Kaan Börekçi" />
      <div class="portrait__tag">
        <span class="pill__dot pill__dot--green"></span>
        Available for hire
      </div>
    </div>
  </div>
</section>

<!--
I am a **Biomedical Engineer (B.S.)** now pursuing **Mechanical Engineering (M.S.)** who loves building end-to-end medical devices, from implants and wearables to robotics. My specialty is developing hardware and software/firmware for MedTech, however my background also spans ML/AI for healthcare, quantitative systems physiology, and biological fluid mechanics & transport. My mission is to work in interface roles that connect engineers, clinicians, and business stakeholders, translating the voice of the customer into rapid prototypes and developing biomedical engineering solutions that improve quality of life for all.

<div class="cta-row">
  <a class="btn" href="/projects/">Projects</a>
  <a class="btn" href="/resume/">Resume (PDF)</a>
  <a class="btn" href="/contact/">Contact</a>
</div>

---

## Featured Work

<div class="grid">
  <div class="card">
    <div class="card__title">BioNexus (New — Weekly Updates)</div>
    <div class="card__meta">Modular medical embedded systems build • Starting this week</div>
    <p class="card__text">
      A ~5-month, module-by-module engineering build focused on reusable hardware/firmware blocks, clear test strategy, and recruiter-visible progress.
    </p>
    <div class="card__actions">
      <a class="btn" href="/projects/">Open BioNexus →</a>
      <a class="btn btn--ghost" href="https://github.com/kborekci06" target="_blank" rel="noopener">GitHub →</a>
    </div>
  </div>

  <div class="card">
    <div class="card__title">Phrenic Nerve / Diaphragm Control Device (Lurie Children’s)</div>
    <div class="card__meta">Embedded firmware + custom PCB • Patent pending • BMES 2025</div>
    <p class="card__text">
      First-step data-collection platform toward closed-loop diaphragm pacer regulation for pediatric CCHS.
    </p>
    <div class="card__actions">
      <a class="btn" href="/projects/diaphragm-control/">Read more →</a>
    </div>
  </div>

  <div class="card">
    <div class="card__title">Infant Pose Lifting Evaluation (Shirley Ryan AbilityLab)</div>
    <div class="card__meta">Biomedical ML research • CUDA pipeline • Retrospective videos</div>
    <p class="card__text">
      Evaluation framework for 3D pose lifters on in-the-wild infant videos, with reproducible metrics and alignment.
    </p>
    <div class="card__actions">
      <a class="btn" href="/projects/infant-pose-pipeline/">Read more →</a>
    </div>
  </div>
</div>

---

## What I’m focusing on right now

- **BioNexus:** a modular medical embedded systems build with weekly progress posts.
- **Systems thinking:** requirements → architecture → verification → documentation.
- **Recruiter-friendly storytelling:** problem → approach → failure modes → results → next steps.

> If you’re hiring for embedded / robotics / medtech roles: the fastest way to understand my work is the **Projects** page.


---
layout: default
title: "Home"
description: "Medical Devices • Robotics • Embedded Systems • ML for Healthcare"
---

This portfolio website is currently undergoing changes to improve design and introduce updated content. In the meanwhile, please see my [RESUME](/resume/)


## Who am I

Hi, my name is Kaan Borekci, and my background is in **Biomedical Engineering (B.S.)**, a discipline that sits at the intersection of physiology, pharmaceuticals, medical devices, prosthetics & orthotics, and clinical trial research. This broad training gave me the privilege of exploring multiple domains early on in my career, with each showing me how engineering and natural systems go hand-in-hand.

From these experiences, I discovered my passion in **medical devices and embedded systems**, where hardware meets physiology and engineering translates to the bedside. I pursued projects across device design, firmware, and machine learning: from a **patent-pending diaphragm control project for pediatric patients with CCHS** in collaboration with Lurie Children’s CAMP division, to developing a **machine learning pipeline designed to diagnose early motor development issues like Cerebral Palsy in infants using computer vision** at Shirley Ryan AbilityLab, Jayaraman Lab.

This passion led me to pursue an **M.S. in Mechanical Engineering (Robotics & Control)** at Northwestern, aiming to scale up into larger systems such as surgical & assistive robotics. While my professional experience has centered on medical devices, through pursuing my Master's, I will gain significant exposure to **robotics (kinematics/dynamics, ROS, state estimation), control systems (digital and feedback control, active learning), and machine learning/AI for robotics (reinforcement learning, genetic algorithms)** through my coursework.

My multidisciplinary background has taught me that innovation happens at boundaries, where clinicians, engineers, and technology transfer leaders work together. I aim to reflect this collaborative, systems-level mindset in all of my work: **to design mechatronic and medical systems inspired by natural processes that are impactful in clinical practice.** 

On this site, you can explore my [Featured Work](#featured-work), [Projects](/projects/), and [Recognition & Milestones](/recognition/) to see how this mission is taking shape.  

---

## What I do: A Quick Dive

- **Embedded & Control:** RP2040/SAM4S Microcontroller Design with Embedded C, Communication Protocols I2C/UART/SPI, PCB design in Eagle, CAD & 3D-Printing
- **Machine Learning & AI:** Signal Processing, Computer Vision, Feature Engineering, Model Evaluation, MMPose Environment
- **Pharmaceutical Engineering:** Familiarity with Clinical Trial Stages, Drug Mechanisms, Pharmacokinetic Modelling, and New Drug Applications (NDA) 
- **Translational Applications:** **Patent pending**, **BMES Conference 2025 (San Diego)** selection, IRB-approved trials in progress; coauthor on **Nature Digital Medicine**

<div class="cta-row">
  <a class="btn" href="/projects/">All Projects</a>
  <a class="btn" href="/recognition/">Recognition & Milestones</a>
  <a class="btn" href="/resume/">Resume (PDF)</a>
  <a class="btn" href="/contact/">Contact</a>
</div>

---

## Featured Recent Work
- Explore more under [Projects](/projects/)

<div class="grid">
  <div class="card">
    <img src="/assets/img/diaphragm-block.png" alt="Block diagram: Sensors → RP2040 (multicore) → SD logging; features → feedback model" />
    <h3>Diaphragm Control Device</h3>
    <p>First-step platform toward closed-loop diaphragm pacer regulation; synchronized sensing, +20 hr runtime, patent pending.</p>
    <a class="btn" href="/projects/diaphragm-control/">Read More →</a>
  </div>
  <div class="card">
    <img src="/assets/img/pipeline-schematic.png" alt="Evaluation pipeline: Video → 2D → Lifter → Depth-aided pseudo-GT → Alignment → Metrics" />
    <h3>Infant Pose Pipeline</h3>
    <p>Model-agnostic evaluation on retrospective videos; depth-aided pseudo-GT (+50% features), 10+ metrics across 17 keypoints.</p>
    <a class="btn" href="/projects/infant-pose-pipeline/">Read More →</a>
  </div>
</div>

---

## My Journey

### **Education:**
- **2025–26:** M.S. Mechanical Engineering (Robotics & Control) @ Northwestern University
- **2021–25:** B.S. Biomedical Engineering @ Northwestern University

### **Key Experiences:**
- **2024–present:** **Shirley Ryan AbilityLab** — Infant Pose Estimation Pipeline → [project](/projects/infant-pose-pipeline/)  
- **2024–present:** **Senior Capstone to Independent Project, Collab with Lurie Children’s CAMP** — Digital Phrenic Nerve Project for Diaphragm control (R&D, patent pending) → [project](/projects/diaphragm-control/)  
- **2023:** **Mirkin Lab** — Crystal Engineering, Nanotechnology using DNA-Coated Gold Nanoparticles  
- **2022:** **Inovation and New Ventures Office (INVO)** — Technology Transfer Office @ Northwestern
 -->
