

# 2 Videos Side by Side
{% include media-2up.html
  left_src="/assets/video/projects/x/demo1.mp4"
  left_poster="/assets/img/projects/x/poster1.png"
  left_caption="Controller A"

  right_src="/assets/video/projects/x/demo2.mp4"
  right_poster="/assets/img/projects/x/poster2.png"
  right_caption="Controller B"
%}

# 1 Video 1 Image Side by Side:
{% include media-2up.html
  left_src="/assets/img/projects/x/architecture.png"
  left_caption="Architecture"

  right_src="/assets/video/projects/x/demo.mp4"
  right_poster="/assets/img/projects/x/poster.png"
  right_caption="Demo"
%}

# 3 Images Side by Side:
{% include media-3up.html
  a_src="/assets/img/projects/project-slug/arch.png"
  a_alt="Architecture diagram"
  a_caption="System architecture."

  b_src="/assets/img/projects/project-slug/test.png"
  b_alt="Test setup"
  b_caption="Hardware test setup."

  c_src="/assets/img/projects/project-slug/results.png"
  c_alt="Results plot"
  c_caption="Tracking performance results."
%}

# 3 Videos Side by Side:
{% include media-3up.html
  a_src="/assets/video/projects/project-slug/demo1.mp4"
  a_poster="/assets/img/projects/project-slug/poster1.png"
  a_caption="Critically damped response."

  b_src="/assets/video/projects/project-slug/demo2.mp4"
  b_poster="/assets/img/projects/project-slug/poster2.png"
  b_caption="Underdamped oscillation."

  c_src="/assets/video/projects/project-slug/demo3.mp4"
  c_poster="/assets/img/projects/project-slug/poster3.png"
  c_caption="Torque-limited case."
%}
