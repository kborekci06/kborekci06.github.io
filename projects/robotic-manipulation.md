---
layout: page
title: "Robotic Manipulation"
permalink: /robotic-manipulation/
---

<!-- Placeholder -->



# 2 Videos Side by Side
{% include media-2up.html
  left_src="/assets/img/projects/robot-manip.mp4"
  left_poster="/assets/img/projects/robot-manip.png"
  left_caption="Controller A"

  right_src="/assets/img/projects/robot-manip.mp4"
  right_poster="/assets/img/projects/robot-manip.png"
  right_caption="Controller B"
%}

# 1 Video 1 Image Side by Side:
{% include media-2up.html
  left_src="/assets/img/projects/robot-manip.png"
  left_caption="Architecture"

  right_src="/assets/img/projects/robot-manip.mp4"
  right_poster="/assets/img/projects/robot-manip.png"
  right_caption="Demo"
%}

# 3 Images Side by Side:
{% include media-3up.html
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

# 3 Videos Side by Side:
{% include media-3up.html
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
{% capture spec_rows %}
<tr><th scope="row">Sampling rate</th><td>100 Hz (IMU), 20 Hz (CO₂)</td></tr>
<tr><th scope="row">Latency</th><td>~12 ms end-to-end</td></tr>
<tr><th scope="row">Power</th><td>~2.1 W average (dev setup)</td></tr>
{% endcapture %}

{% include spec-table.html title="Specs" body=spec_rows %}

## Timeline:
{% capture timeline_items %}
<li class="timeline__item">
  <div class="timeline__dot"></div>
  <div class="timeline__content">
    <div class="timeline__when">Week 1</div>
    <div class="timeline__what">Architecture + requirements</div>
    <div class="timeline__detail">Defined interfaces, success criteria, test plan.</div>
  </div>
</li>

<li class="timeline__item">
  <div class="timeline__dot"></div>
  <div class="timeline__content">
    <div class="timeline__when">Week 2</div>
    <div class="timeline__what">Firmware bring-up</div>
    <div class="timeline__detail">I2C/SPI/UART drivers + logging skeleton.</div>
  </div>
</li>

<li class="timeline__item">
  <div class="timeline__dot"></div>
  <div class="timeline__content">
    <div class="timeline__when">Week 3</div>
    <div class="timeline__what">Validation</div>
    <div class="timeline__detail">End-to-end test with metrics + plots.</div>
  </div>
</li>
{% endcapture %}

{% include timeline.html title="Milestones" body=timeline_items %}

## Accordion:
{% capture accordion_body %}
<details class="accordion__item">
  <summary class="accordion__summary">Computed torque control (details)</summary>
  <div class="accordion__body">
    <p>Explain inverse dynamics + PD error shaping here.</p>
  </div>
</details>

<details class="accordion__item">
  <summary class="accordion__summary">Trajectory generation (details)</summary>
  <div class="accordion__body">
    <p>Screw vs Cartesian, cubic vs quintic…</p>
  </div>
</details>
{% endcapture %}

{% include accordion.html body=accordion_body %}

## Tag Row:
{% assign mytags = "Embedded Systems, Robotics, Control, Testing" | split: ", " %}
{% include tag-row.html tags=mytags %}

<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>