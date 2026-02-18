document.addEventListener("DOMContentLoaded", () => {
    const vids = document.querySelectorAll("video.js-autoplay");
    if (!("IntersectionObserver" in window) || vids.length === 0) return;
  
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
        const v = target;
        if (isIntersecting && intersectionRatio >= 0.35) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: [0, 0.35, 0.6] });
  
    vids.forEach(v => io.observe(v));
  });