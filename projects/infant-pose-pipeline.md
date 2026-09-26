---
layout: page
title: "Infant motion pipeline"
permalink: /projects/infant-pose-pipeline/
# Project contract: _data/schema/project.yml
slug: infant-pose-pipeline
description: "Screening infant motor development from ordinary video, and a proposal to put the physics of infant motion into the model."
role: "R&D engineer (student intern)"
team: ["Dr. Arun Jayaraman’s lab"]
dates: { start: "2024", end: "present" }
org: "Shirley Ryan AbilityLab"
tags: ["Computer Vision", "Pose Estimation and Lifting", "Python"]
thumbnail:
  src: /assets/img/infant-pose-pipeline/card-1100.webp
  widths: [600, 1100]
  width: 1100
  height: 733
  alt: "Video frame of an infant lying on its back, with pose-estimation keypoints, a skeleton and a bounding box drawn over it"
figures: []
outcome: "[confirm: sanitized Phase 1 finding, pending Kaan's project resources]"
featured: true
order: 2
tile:
  video: /assets/video/infant-pose-pipeline/pose-loop.mp4
  poster: { src: /assets/video/infant-pose-pipeline/pose-loop-poster.webp, width: 584, height: 390, alt: "Video of an infant lying on its back, with pose-estimation keypoints, a skeleton and a bounding box tracking its movement" }
---

{% include tag-row.html slug="infant-pose-pipeline" %}

### Project summary
I am developing and leading the technical methodology for a video-based infant motor development screening pipeline at Shirley Ryan AbilityLab's Max Näder Center for Rehabilitation Technologies and Outcomes Research. The long-term objective is to enable binary classification of motor development concerns (yes/no) from a single monocular 2D RGB video of a supine infant, approaching the sensitivity and specificity of the clinical gold standard (General Movements Assessment). I designed and executed the project's initial feasibility phase: a structured evaluation of 7 open-source, adult-trained 3D pose lifting models on 17 retrospective infant video sequences, developing custom evaluation metrics and a depth-informed pseudo-ground truth pipeline to assess each model's positional accuracy, anatomical consistency, and temporal reliability across 375,000+ frames.

### Problem and context
Early identification of motor development disorders such as cerebral palsy can advance therapeutic intervention by up to 12 months, significantly improving long-term outcomes. The clinical gold standard for infant motor assessment (GMA) requires trained specialists and is limited in scalability. A reliable, video-based screening tool would enable broader access to early assessment, but the core technical barrier is that no validated, open-source 3D pose estimation models trained on infant data currently exist. Adult-trained models encode assumptions about body proportions, posture, and motion patterns that do not hold for supine infants, producing failure modes that can closely resemble true motor abnormalities.

### Approach
The project has progressed through two phases. In the first phase (completed), I built an end-to-end evaluation pipeline consisting of two parallel tracks: a 3D prediction pipeline that maps video to 2D keypoints and then to 3D via each candidate pose lifter, and a pseudo-ground truth pipeline that uses depth maps from an Intel RealSense D4xx sensor with an inverse pinhole projection model to generate an approximate 3D reference. I applied Procrustes alignment (SVD-based) to remove rigid transformations and scale differences between the two coordinate systems, enabling fair comparison across 10+ evaluation metrics spanning positional accuracy (PA-MPJPE, per-joint error, PCK3D), anatomical consistency (mean per-bone length error, bone length jitter), and temporal/dynamic accuracy (velocity and acceleration profile errors, dynamic time warping, PCA of movement).
<br><br>
Based on the findings from Phase 1, I conceived and am now leading a strategic pivot to a physics-first approach. Rather than continuing to refine 3D estimation from unreliable depth data, I am developing a methodology that generates synthetic training data from nondimensional simulation of infant limb dynamics, projected to synthetic 2D observations. This approach is a direct product of my multidisciplinary training: I drew on fluid mechanics and transport phenomena (Buckingham Pi theorem for nondimensionalization), robotic manipulation theory (equations of motion for linked rigid-body open chains), developmental neuropathophysiology (mapping known motor disorders to dynamical parameter regimes), and physics-informed machine learning (constraining learned representations with governing equations) to formulate a framework that no single-discipline approach would have produced. MuJoCo is being evaluated as a candidate simulation environment for generating the synthetic digital twin dataset. The physics-first simulated data will serve as the training set for the model, while the in-the-wild infant video datasets from Phase 1 (300+ videos) will be used as the test set for validation.


### Confidentiality Note
This project is conducted under Shirley Ryan AbilityLab's research protocols and certain implementation details, internal figures, and data are not available for public disclosure. I am happy to discuss the methodology, technical challenges, and current direction in detail during a conversation. The research poster presented at Shirley Ryan AbilityLab is available upon request.