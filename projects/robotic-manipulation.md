---
layout: page
title: "Robotic Manipulation"
permalink: /projects/robotic-manipulation/
---

<!-- Placeholder -->

# Smaller figure 50%
{% include media-figure.html
  class="w-50"
  src="/assets/img/projects/robot-manip.png"
  caption="Smaller plot."
%}

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
{% include timeline.html slug="robotic-manipulation" %}

## Accordion:
{% include accordion.html slug="robotic-manipulation" %}

#### Tag Row:
{% include tag-row.html slug="robotic-manipulation" %}

<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>