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
    tocDrawer.setAttribute("hidden", "");
    tocToggle.addEventListener("click", () => {
      const isOpen = tocDrawer.classList.toggle("open");
      if (isOpen) {
        tocDrawer.removeAttribute("hidden");
      } else {
        tocDrawer.setAttribute("hidden", "");
      }
      tocToggle.setAttribute("aria-expanded", String(isOpen));
    });
    tocDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        tocDrawer.classList.remove("open");
        tocDrawer.setAttribute("hidden", "");
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

  // Chart animations (trigger on view)
  const chartBlocks = Array.from(document.querySelectorAll(".chart-animate"));
  if (!reducedMotion && "IntersectionObserver" in window) {
    const chartObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-active");
            chartObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.2 }
    );
    chartBlocks.forEach((block) => chartObserver.observe(block));
  } else {
    chartBlocks.forEach((block) => block.classList.add("is-active"));
  }

  // KPI count-up
  const kpiNumbers = Array.from(document.querySelectorAll(".kpi-number"));
  const animateKpi = (el) => {
    if (el.dataset.animated === "true" || el.dataset.skip === "true") return;
    const target = Number(el.dataset.count || "0");
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * progress);
      el.textContent = `${prefix}${value.toLocaleString("fr-FR")}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.dataset.animated = "true";
      }
    };
    requestAnimationFrame(step);
  };

  if (!reducedMotion && "IntersectionObserver" in window) {
    const kpiObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateKpi(entry.target);
            kpiObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.3 }
    );
    kpiNumbers.forEach((el) => kpiObserver.observe(el));
  } else {
    kpiNumbers.forEach((el) => animateKpi(el));
  }
});
