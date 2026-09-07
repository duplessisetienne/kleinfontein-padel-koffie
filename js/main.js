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

  let activeIndex = 0;

  const goToSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides[activeIndex].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Gaan na foto ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsWrap.appendChild(dot);
    return dot;
  });

  if (dots[0]) {
    dots[0].classList.add("is-active");
  }

  const setActiveDot = (index) => {
    activeIndex = index;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  prevBtn.addEventListener("click", () => goToSlide(activeIndex - 1));
  nextBtn.addEventListener("click", () => goToSlide(activeIndex + 1));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveDot(slides.indexOf(entry.target));
        }
      });
    },
    { root: track, threshold: 0.6 }
  );

  slides.forEach((slide) => observer.observe(slide));
}
