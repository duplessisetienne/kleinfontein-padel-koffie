const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    });
  });
}

const carousel = document.getElementById("galery-carousel");

if (carousel) {
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  const prevBtn = carousel.querySelector(".carousel-arrow-prev");
  const nextBtn = carousel.querySelector(".carousel-arrow-next");
  const dotsWrap = carousel.querySelector(".carousel-dots");
  const count = slides.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AUTOPLAY_MS = 5000;

  // Clone the full set before and after the real slides so the track can
  // keep sliding in either direction; when it settles inside a clone set we
  // jump back to the matching real slide without animation.
  const makeClone = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((img) => {
      img.alt = "";
    });
    return clone;
  };
  slides.forEach((slide) => track.appendChild(makeClone(slide)));
  slides
    .slice()
    .reverse()
    .forEach((slide) => track.insertBefore(makeClone(slide), track.firstChild));

  let step = 0;
  let activeIndex = 0;
  let autoplayTimer = null;
  let settleTimer = null;
  let isPaused = false;
  let isVisible = false;

  const behavior = () => (reducedMotion.matches ? "auto" : "smooth");
  const measure = () => {
    step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
  };
  const setWidth = () => step * count;
  const positionOf = (index) => setWidth() + index * step;

  const jumpTo = (left) => {
    track.style.scrollBehavior = "auto";
    track.scrollLeft = left;
    track.style.scrollBehavior = "";
  };

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Gaan na foto ${index + 1}`);
    dot.addEventListener("click", () => {
      track.scrollTo({ left: positionOf(index), behavior: behavior() });
      restartAutoplay();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const setActiveDot = (index) => {
    activeIndex = index;
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const currentIndex = () => {
    const raw = Math.round((track.scrollLeft - setWidth()) / step);
    return ((raw % count) + count) % count;
  };

  // Once scrolling stops, move from a clone set back into the real set.
  const settle = () => {
    const left = track.scrollLeft;
    const half = step / 2;
    if (left < setWidth() - half) {
      jumpTo(left + setWidth());
    } else if (left >= setWidth() * 2 - half) {
      jumpTo(left - setWidth());
    }
  };

  track.addEventListener(
    "scroll",
    () => {
      if (!step) return;
      setActiveDot(currentIndex());
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 150);
    },
    { passive: true }
  );

  const move = (direction) => {
    settle();
    track.scrollBy({ left: direction * step, behavior: behavior() });
  };

  prevBtn.addEventListener("click", () => {
    move(-1);
    restartAutoplay();
  });
  nextBtn.addEventListener("click", () => {
    move(1);
    restartAutoplay();
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
      restartAutoplay();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
      restartAutoplay();
    }
  });

  // Autoplay: off for reduced motion, paused while hovered, focused,
  // touched, off-screen or in a background tab.
  const canAutoplay = () => !reducedMotion.matches && !isPaused && !document.hidden && isVisible;
  const stopAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  };
  const startAutoplay = () => {
    stopAutoplay();
    if (canAutoplay()) {
      autoplayTimer = setInterval(() => move(1), AUTOPLAY_MS);
    }
  };
  function restartAutoplay() {
    startAutoplay();
  }

  const pause = () => {
    isPaused = true;
    stopAutoplay();
  };
  const resume = () => {
    isPaused = false;
    startAutoplay();
  };

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", resume);
  carousel.addEventListener("focusin", pause);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) resume();
  });
  track.addEventListener("touchstart", pause, { passive: true });
  track.addEventListener("touchend", () => setTimeout(resume, AUTOPLAY_MS), { passive: true });
  document.addEventListener("visibilitychange", startAutoplay);
  reducedMotion.addEventListener?.("change", startAutoplay);

  new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      startAutoplay();
    },
    { threshold: 0.3 }
  ).observe(carousel);

  const init = () => {
    measure();
    jumpTo(positionOf(activeIndex));
    setActiveDot(activeIndex);
  };

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });

  init();
}
