// Mobile menu toggle (non-destructive)
(function () {
  const hdr = document.querySelector("header .nav");
  const btn = hdr?.querySelector(".menu-btn");
  const list = hdr?.querySelector("ul");
  if (!btn || !list) return;
  btn.addEventListener("click", () => {
    const open = hdr.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
})();

// Reveal-on-scroll (IntersectionObserver)
(function () {
  const els = document.querySelectorAll(".reveal");
  const show = (el) => el.classList.add("show");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach(show);
  }
})();

// Year stamp
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
