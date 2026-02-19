Placeholder



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
{% assign rows = "" | split: "" %}
{% assign rows = rows | push: {"label":"Sampling rate","value":"100 Hz (IMU), 20 Hz (CO₂)"} %}
{% assign rows = rows | push: {"label":"Latency","value":"~12 ms end-to-end"} %}
{% assign rows = rows | push: {"label":"Power","value":"~2.1 W average (dev setup)"} %}
{% include spec-table.html title="Specs" rows=rows %}

## Timeline:
{% assign t = "" | split: "" %}
{% assign t = t | push: {"when":"Week 1","what":"Architecture + requirements","detail":"Defined interfaces, success criteria, test plan."} %}
{% assign t = t | push: {"when":"Week 2","what":"Firmware bring-up","detail":"I2C/SPI/UART drivers + logging skeleton."} %}
{% assign t = t | push: {"when":"Week 3","what":"Validation","detail":"End-to-end test with metrics + plots."} %}
{% include timeline.html title="Milestones" items=t %}

## Accordion:
{% assign acc = "" | split: "" %}
{% assign acc = acc | push: {"title":"Computed torque control (details)","body":"<p>Explain inverse dynamics + PD error shaping here.</p>"} %}
{% assign acc = acc | push: {"title":"Trajectory generation (details)","body":"<p>Screw vs Cartesian, cubic vs quintic…</p>"} %}
{% include accordion.html items=acc %}

## Tag Row:
{% assign mytags = "Embedded Systems, Robotics, Control, Testing" | split: ", " %}
{% include tag-row.html tags=mytags %}

<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>