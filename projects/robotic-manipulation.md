---
layout: page
title: "Robotic Manipulation"
permalink: /projects/robotic-manipulation/
---

<!-- Placeholder -->
# Smaller figure 50%
## Smaller figure 50%
### Smaller figure 50%
#### Smaller figure 50%
##### Smaller figure 50%
###### **Smaller figure 50%**
{% include media-figure.html
  class="w-10"
  src="/assets/img/projects/robot-manip.png"
  caption="Smaller plot."
%}

### Split Layout Example

<div class="split">
  <div class="split__text">
    <h2>Problem</h2>
    <p>Describe constraints… By combining bioelectric signals (EMG, EKG, EEG), physiological measurements (e.g., exhaled CO2, pulse), inertial sensing (IMUs), and UWB-derived depth information — augmented with synchronous video-based pose estimation — the proposed system enables a comprehensive, multimodal representation of human state and behavior. This integrated sensing framework supports a wide range of biomedical applications, including fitness and health monitoring, clinical diagnostics, translational research, physics- and physiology-informed machine learning, adaptive therapy and implant regulation, robotic and prosthetic limb control, and even select applications in defense and human-performance systems</p>
  </div>

  <div class="split__media split__media--right split__media--vcenter">
    {% include media-block.html class="w-50" src="assets/img/projects/robot-manip.png" caption="Photo" %}
  </div>
</div>

<div class="split">
  <div class="split__media split__media--left split__media--vcenter">
    {% include media-block.html class="w-50" src="assets/img/projects/robot-manip.png" caption="Photo" %}
  </div>

  <div class="split__text">
    <h2>Problem</h2>
    <div class="text-wide">
      <p>Describe constraints… By combining bioelectric signals (EMG, EKG, EEG), physiological measurements (e.g., exhaled CO2, pulse), inertial sensing (IMUs), and UWB-derived depth information — augmented with synchronous video-based pose estimation — the proposed system enables a comprehensive, multimodal representation of human state and behavior. This integrated sensing framework supports a wide range of biomedical applications, including fitness and health monitoring, clinical diagnostics, translational research, physics- and physiology-informed machine learning, adaptive therapy and implant regulation, robotic and prosthetic limb control, and even select applications in defense and human-performance systems</p>
    </div>
  </div>
</div>

<div class="split">
  <div class="split__text">
    <h2>Timeline</h2>
    {% include timeline.html slug="robotic-manipulation" %}
  </div>

  <div class="split__media split__media--right">
    {% include accordion.html slug="robotic-manipulation" %}
  </div>
</div>

<div class="split">
  <div class="split__media split__media--left">
    {% include spec-table.html slug="robotic-manipulation" %}
  </div>
  <div class="split__text">
    <h2>Timeline</h2>
    {% include timeline.html slug="robotic-manipulation" %}
  </div>

</div>

### 2 Videos Side by Side (shrink the whole block if desireddddddddddddddddd)
{% include media-2up.html
  class="w-100"
  left_src="/assets/img/projects/robot-manip.mp4"
  left_poster="/assets/img/projects/robot-manip.png"
  left_caption="Controller A"
  right_src="/assets/img/projects/robot-manip.mp4"
  right_poster="/assets/img/projects/robot-manip.png"
  right_caption="Controller B"
%}

### 1 Video 1 Image Side by Side (shrink the whole block if desired)
{% include media-2up.html
  class="w-100"
  left_src="/assets/img/projects/robot-manip.png"
  left_caption="Architecture"
  right_src="/assets/img/projects/robot-manip.mp4"
  right_poster="/assets/img/projects/robot-manip.png"
  right_caption="Demo"
%}

# 3 Images Side by Side (shrink the whole block if desired)
{% include media-3up.html
  class="w-75"
  a_src="/assets/img/projects/robot-manip.png"
  a_alt="Architecture diagram"
  a_caption="System architecture."
  b_src="/assets/img/projects/robot-manip.png"
  b_alt="Test setup"
  b_caption="Hardware test setup."
  c_src="/assets/img/projects/robot-manip.png"
  c_alt="Results plot"
  c_caption="Tracking performance results."
%}

# 3 Videos Side by Side (shrink the whole block if desired)
{% include media-3up.html
  class="w-75"
  a_src="/assets/img/projects/robot-manip.mp4"
  a_poster="/assets/img/projects/robot-manip.png"
  a_caption="Critically damped response."
  b_src="/assets/img/projects/robot-manip.mp4"
  b_poster="/assets/img/projects/robot-manip.png"
  b_caption="Underdamped oscillation."
  c_src="/assets/img/projects/robot-manip.mp4"
  c_poster="/assets/img/projects/robot-manip.png"
  c_caption="Torque-limited case."
%}


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

#### Tag Row:
{% include tag-row.html slug="robotic-manipulation" %}

<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>