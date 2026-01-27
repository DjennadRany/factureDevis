/* =========================================================
   Projet HexaFact — interactions
   - reveal on scroll
   - scrollspy
   - mobile sommaire drawer
   - back-to-top
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal animations
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Scrollspy
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const tocLinks = Array.from(document.querySelectorAll(".toc-panel a[data-target], .toc-mobile a[data-target]"));
  const activeClass = "active";

  const setActive = (id) => {
    tocLinks.forEach((link) => {
      link.classList.toggle(activeClass, link.dataset.target === id);
    });
  };

  if ("IntersectionObserver" in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.1 }
    );
    sections.forEach((section) => spyObserver.observe(section));
  }

  // Mobile TOC drawer
  const tocToggle = document.getElementById("tocToggle");
  const tocDrawer = document.getElementById("tocDrawer");
  if (tocToggle && tocDrawer) {
    tocToggle.addEventListener("click", () => {
      const isOpen = tocDrawer.classList.toggle("open");
      tocToggle.setAttribute("aria-expanded", String(isOpen));
    });
    tocDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        tocDrawer.classList.remove("open");
        tocToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Back to top
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }
});
