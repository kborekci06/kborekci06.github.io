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

<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>