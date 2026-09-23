/* =========================================================
   START: MOBILE MENU
========================================================= */
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", open);
  });
}
document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});
/* =========================================================
   END: MOBILE MENU

   START: SCROLL REVEALS
========================================================= */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));
/* =========================================================
   END: SCROLL REVEALS

   START: IMAGE FALLBACKS
========================================================= */
document
  .querySelectorAll(".project img, .portrait img, .hero-media img")
  .forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
    });
  });
/* =========================================================
   END: IMAGE FALLBACKS
========================================================= */

/* =========================================================
   START: CONTACT DEMO
========================================================= */
const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    if (form.getAttribute("action") === "#") {
      e.preventDefault();
      alert(
        "Demo-Formular: Hier kann später Ihr echter Form-Endpoint angeschlossen werden.",
      );
    }
  });
}
/* =========================================================
   END: CONTACT DEMO
========================================================= */

/* =========================================================
   START: PORTFOLIO SYSTEM — FINAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =======================================================
     CONFIG
  ======================================================= */

  const portfolio = document.querySelector(".portfolio");

  if (!portfolio) {
    return;
  }

  /* =======================================================
     CATEGORY NAVIGATION
  ======================================================= */

  const navItems = document.querySelectorAll(
    ".portfolio-nav-item[data-portfolio-target]",
  );

  const categories = document.querySelectorAll(".portfolio-category");

  function playVisibleVideos(category) {
    if (!category) {
      return;
    }

    const videos = category.querySelectorAll("video");

    videos.forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    });
  }

  function stopHiddenVideos(category) {
    if (!category) {
      return;
    }

    const videos = category.querySelectorAll("video");

    videos.forEach((video) => {
      video.pause();
    });
  }

  function activateCategory(targetId, updateHash = true) {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    /* -----------------------------------------------
       Kategorien
    ----------------------------------------------- */

    categories.forEach((category) => {
      const isActive = category === target;

      category.classList.toggle("is-active", isActive);

      category.setAttribute("aria-hidden", isActive ? "false" : "true");

      if (isActive) {
        playVisibleVideos(category);
      } else {
        stopHiddenVideos(category);
      }
    });

    /* -----------------------------------------------
       Navigation
    ----------------------------------------------- */

    navItems.forEach((item) => {
      const isActive = item.dataset.portfolioTarget === targetId;

      item.classList.toggle("is-active", isActive);

      item.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    /* -----------------------------------------------
       URL optional aktualisieren
    ----------------------------------------------- */

    if (updateHash) {
      try {
        history.replaceState(null, "", `#${targetId}`);
      } catch (error) {
        // Browser ohne History API ignorieren
      }
    }
  }

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();

      const targetId = item.dataset.portfolioTarget;

      if (!targetId) {
        return;
      }

      activateCategory(targetId);

      const target = document.getElementById(targetId);

      if (target) {
        const portfolioTop =
          target.getBoundingClientRect().top + window.scrollY - 130;

        window.scrollTo({
          top: portfolioTop,
          behavior: "smooth",
        });
      }
    });
  });

  /* =======================================================
     DEFAULT CATEGORY
  ======================================================= */

  const initialHash = window.location.hash.replace("#", "");

  const validInitialCategory =
    initialHash &&
    document
      .getElementById(initialHash)
      ?.classList.contains("portfolio-category");

  if (validInitialCategory) {
    activateCategory(initialHash, false);
  } else {
    const firstCategory = categories[0];

    if (firstCategory) {
      activateCategory(firstCategory.id, false);
    }
  }

  /* =======================================================
     SLIDER CONTROLS
  ======================================================= */

  const sliderControls = document.querySelectorAll(
    "[data-slider-prev], [data-slider-next]",
  );

  function getSliderWidth(slider) {
    const track = slider.querySelector(".portfolio-track");

    if (!track) {
      return 0;
    }

    const item = track.querySelector(".portfolio-item");

    if (!item) {
      return track.clientWidth;
    }

    const styles = window.getComputedStyle(track);

    const gap = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;

    return item.getBoundingClientRect().width + gap;
  }

  sliderControls.forEach((button) => {
    button.addEventListener("click", () => {
      const sliderName = button.dataset.sliderPrev || button.dataset.sliderNext;

      if (!sliderName) {
        return;
      }

      const slider = document.querySelector(`[data-slider="${sliderName}"]`);

      if (!slider) {
        return;
      }

      const track = slider.querySelector(".portfolio-track");

      if (!track) {
        return;
      }

      const distance = getSliderWidth(slider);

      if (!distance) {
        return;
      }

      if (button.hasAttribute("data-slider-next")) {
        track.scrollBy({
          left: distance,
          behavior: "smooth",
        });
      } else {
        track.scrollBy({
          left: -distance,
          behavior: "smooth",
        });
      }
    });
  });

  /* =========================================================
   START: INDIVIDUELLE VIDEO-SCHNITTE
   ---------------------------------------------------------
   JEDES VIDEO KANN EINEN EIGENEN SCHNITT HABEN.

   HTML:

   data-video-start="3.5"
   data-video-end="18.2"

   Bedeutet:

   Start = 3,5 Sekunden
   Ende  = 18,2 Sekunden

   Wichtig:
   Die originale MP4-Datei wird NICHT verändert.
   Nur die Wiedergabe auf der Website wird geschnitten.
   ========================================================= */

  function setupIndividualVideoTrim(video) {
    if (!video) {
      return;
    }

    const item = video.closest(".portfolio-item");

    if (!item) {
      return;
    }

    /*
     * Werte aus dem HTML lesen
     */

    const startTime = parseFloat(item.dataset.videoStart);
    const endTime = parseFloat(item.dataset.videoEnd);

    /*
     * Wenn für dieses Video kein Schnitt definiert wurde,
     * nichts machen.
     */

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return;
    }

    /*
     * Prüfen, ob die Werte sinnvoll sind.
     */

    if (startTime < 0 || endTime <= startTime) {
      console.warn("Ungültiger Video-Schnitt:", item);

      return;
    }

    /*
     * -------------------------------------------------------
     * ZUM STARTPUNKT SPRINGEN
     * -------------------------------------------------------
     */

    function setStartPosition() {
      if (!Number.isFinite(video.duration)) {
        return;
      }

      /*
       * Endpunkt darf niemals länger als das Video sein.
       */

      const safeEnd = Math.min(endTime, video.duration);

      /*
       * Start darf nicht hinter dem Ende liegen.
       */

      if (startTime >= safeEnd) {
        return;
      }

      /*
       * Nur springen, wenn wir außerhalb
       * des gewünschten Bereichs sind.
       */

      if (video.currentTime < startTime || video.currentTime >= safeEnd) {
        video.currentTime = startTime;
      }
    }

    /*
     * -------------------------------------------------------
     * VIDEO-DATEN
     * -------------------------------------------------------
     *
     * Falls metadata bereits geladen wurde, funktioniert
     * die Prüfung trotzdem.
     */

    if (video.readyState >= 1) {
      setStartPosition();
    }

    video.addEventListener("loadedmetadata", setStartPosition);

    video.addEventListener("loadeddata", setStartPosition);

    /*
     * -------------------------------------------------------
     * BEIM ABSPIELEN
     * -------------------------------------------------------
     */

    video.addEventListener("play", () => {
      setStartPosition();
    });

    /*
     * -------------------------------------------------------
     * WÄHREND DER WIEDERGABE
     * -------------------------------------------------------
     */

    video.addEventListener("timeupdate", () => {
      if (!Number.isFinite(video.duration)) {
        return;
      }

      const safeEnd = Math.min(endTime, video.duration);

      /*
       * Sobald der individuelle Endpunkt erreicht ist:
       *
       * zurück zum individuellen Start
       */

      if (video.currentTime >= safeEnd) {
        video.currentTime = startTime;

        /*
         * Video weiterlaufen lassen
         */

        if (!video.paused) {
          const promise = video.play();

          if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
          }
        }
      }
    });

    /*
     * -------------------------------------------------------
     * FALLS DAS VIDEO TROTZDEM BIS ZUM ECHTEN ENDE LÄUFT
     * -------------------------------------------------------
     */

    video.addEventListener("ended", () => {
      video.currentTime = startTime;

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    });
  }

  /*
   * ---------------------------------------------------------
   * ALLE PORTFOLIO-VIDEOS INITIALISIEREN
   * ---------------------------------------------------------
   */

  portfolio.querySelectorAll(".portfolio-item video").forEach((video) => {
    setupIndividualVideoTrim(video);
  });

  /* =========================================================
   END: INDIVIDUELLE VIDEO-SCHNITTE
========================================================= */

  /* =======================================================
     PORTFOLIO VIDEOS
  ======================================================= */

  const portfolioVideos = portfolio.querySelectorAll(".portfolio-item video");

  portfolioVideos.forEach((video) => {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    /*
      autoplay darf im Browser nur zuverlässig
      mit muted funktionieren.
    */

    video.setAttribute("muted", "");

    video.setAttribute("playsinline", "");
  });

  /* =======================================================
     VIDEO INTERSECTION OBSERVER
  ======================================================= */

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (
            entry.isIntersecting &&
            video.closest(".portfolio-category.is-active")
          ) {
            const promise = video.play();

            if (promise && typeof promise.catch === "function") {
              promise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.35,
      },
    );

    portfolioVideos.forEach((video) => {
      videoObserver.observe(video);
    });
  } else {
    portfolioVideos.forEach((video) => {
      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    });
  }

  /* =======================================================
     LIGHTBOX ELEMENTS
  ======================================================= */

  const lightbox = document.getElementById("portfolioLightbox");

  const lightboxMedia = document.getElementById("lightboxMedia");

  const lightboxTitle = document.getElementById("lightboxTitle");

  const lightboxDescription = document.getElementById("lightboxDescription");

  const lightboxCounter = document.getElementById("lightboxCounter");

  const lightboxClose = document.getElementById("lightboxClose");

  const lightboxPrev = document.getElementById("lightboxPrev");

  const lightboxNext = document.getElementById("lightboxNext");

  const lightboxZoomIn = document.getElementById("lightboxZoomIn");

  const lightboxZoomOut = document.getElementById("lightboxZoomOut");

  const lightboxReset = document.getElementById("lightboxReset");

  const lightboxZoomValue = document.getElementById("lightboxZoomValue");

  if (!lightbox || !lightboxMedia) {
    return;
  }

  /* =======================================================
     LIGHTBOX STATE
  ======================================================= */

  let currentItem = null;
  let currentCategory = null;
  let currentItems = [];
  let currentIndex = 0;
  let currentZoom = 1;

  let touchStartX = 0;
  let touchStartY = 0;

  /* =======================================================
     GET CATEGORY ITEMS
  ======================================================= */

  function getCategoryItems(category) {
    if (!category) {
      return [];
    }

    return Array.from(category.querySelectorAll(".portfolio-item"));
  }

  /* =======================================================
     ZOOM
  ======================================================= */

  function applyZoom() {
    const media = lightboxMedia.querySelector("img, video");

    if (media) {
      media.style.transform = `scale(${currentZoom})`;
    }

    if (lightboxZoomValue) {
      lightboxZoomValue.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  }

  function resetZoom() {
    currentZoom = 1;

    applyZoom();
  }

  function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.25, 3);

    applyZoom();
  }

  function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.25, 0.5);

    applyZoom();
  }

  /* =======================================================
     CLEAR LIGHTBOX
  ======================================================= */

  function clearLightbox() {
    while (lightboxMedia.firstChild) {
      const node = lightboxMedia.firstChild;

      if (node.tagName === "VIDEO") {
        node.pause();
        node.removeAttribute("src");
        node.load();
      }

      lightboxMedia.removeChild(node);
    }
  }

  /* =======================================================
     CREATE IMAGE
  ======================================================= */

  function createImage(src, alt) {
    const image = document.createElement("img");

    image.src = src;
    image.alt = alt || "";
    image.draggable = false;

    return image;
  }

  /* =======================================================
   CREATE VIDEO — MIT INDIVIDUELLEM SCHNITT
======================================================= */

  function createVideo(src, item) {
    const video = document.createElement("video");

    video.src = src;

    video.controls = true;
    video.autoplay = true;
    video.muted = false;
    video.loop = false;
    video.playsInline = true;
    video.preload = "auto";

    video.setAttribute("controls", "");
    video.setAttribute("playsinline", "");

    /*
     * -------------------------------------------------------
     * INDIVIDUELLE START-/ENDZEIT AUS DEM HTML
     * -------------------------------------------------------
     */

    const startTime = item ? parseFloat(item.dataset.videoStart) : NaN;

    const endTime = item ? parseFloat(item.dataset.videoEnd) : NaN;

    const hasCustomTrim =
      Number.isFinite(startTime) &&
      Number.isFinite(endTime) &&
      endTime > startTime;

    /*
     * -------------------------------------------------------
     * VIDEO STARTEN
     * -------------------------------------------------------
     */

    video.addEventListener("loadedmetadata", () => {
      /*
       * Individueller Schnitt vorhanden
       */

      if (hasCustomTrim) {
        if (startTime >= 0 && startTime < video.duration) {
          video.currentTime = startTime;
        }
      }

      /*
       * Video abspielen
       */

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    });

    /*
     * -------------------------------------------------------
     * BEIM ABSPIELEN NICHT VOR DEM STARTPUNKT BLEIBEN
     * -------------------------------------------------------
     */

    video.addEventListener("play", () => {
      if (!hasCustomTrim) {
        return;
      }

      if (video.currentTime < startTime) {
        video.currentTime = startTime;
      }
    });

    /*
     * -------------------------------------------------------
     * INDIVIDUELLER ENDPUNKT
     * -------------------------------------------------------
     */

    video.addEventListener("timeupdate", () => {
      if (!hasCustomTrim) {
        return;
      }

      /*
       * Sobald der gewünschte Endpunkt erreicht wurde,
       * zurück zum Startpunkt.
       */

      if (video.currentTime >= endTime) {
        video.pause();

        video.currentTime = startTime;

        /*
         * Danach wieder automatisch abspielen.
         */

        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {});
        }
      }
    });

    /*
     * -------------------------------------------------------
     * FALLBACK: ECHTES VIDEOENDE
     * -------------------------------------------------------
     */

    video.addEventListener("ended", () => {
      if (!hasCustomTrim) {
        return;
      }

      video.currentTime = startTime;

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    });

    return video;
  }

  /* =======================================================
     CREATE BEFORE / AFTER
  ======================================================= */

  function createBeforeAfter(before, after) {
    const wrapper = document.createElement("div");

    wrapper.className = "lightbox-before-after";

    const beforeWrap = document.createElement("div");

    const beforeImage = createImage(before, "Vorher");

    const beforeLabel = document.createElement("span");

    beforeLabel.textContent = "VORHER";

    const afterWrap = document.createElement("div");

    const afterImage = createImage(after, "Nachher");

    const afterLabel = document.createElement("span");

    afterLabel.textContent = "NACHHER";

    beforeWrap.appendChild(beforeImage);

    beforeWrap.appendChild(beforeLabel);

    afterWrap.appendChild(afterImage);

    afterWrap.appendChild(afterLabel);

    wrapper.appendChild(beforeWrap);

    wrapper.appendChild(afterWrap);

    return wrapper;
  }

  /* =======================================================
     LOAD LIGHTBOX ITEM
  ======================================================= */

  function loadLightboxItem(item) {
    if (!item) {
      return;
    }

    currentItem = item;

    const type = item.dataset.lightboxType;

    clearLightbox();

    resetZoom();

    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (lightboxTitle) {
      lightboxTitle.textContent = item.dataset.lightboxTitle || "Projekt";
    }

    /* -----------------------------------------------------
       DESCRIPTION
    ----------------------------------------------------- */

    if (lightboxDescription) {
      lightboxDescription.textContent = item.dataset.lightboxDescription || "";
    }

    /* -----------------------------------------------------
       MEDIA
    ----------------------------------------------------- */

    if (type === "image") {
      const image = createImage(
        item.dataset.lightboxSrc,
        item.dataset.lightboxTitle,
      );

      lightboxMedia.appendChild(image);
    } else if (type === "video") {
      const video = createVideo(item.dataset.lightboxSrc, item);

      lightboxMedia.appendChild(video);
    } else if (type === "before-after") {
      const before = item.dataset.before;

      const after = item.dataset.after;

      const comparison = createBeforeAfter(before, after);

      lightboxMedia.appendChild(comparison);
    }

    /* -----------------------------------------------------
       COUNTER
    ----------------------------------------------------- */

    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(currentItems.length).padStart(2, "0")}`;
    }

    /* -----------------------------------------------------
       ARROW STATE
    ----------------------------------------------------- */

    const hasMultiple = currentItems.length > 1;

    if (lightboxPrev) {
      lightboxPrev.style.display = hasMultiple ? "" : "none";
    }

    if (lightboxNext) {
      lightboxNext.style.display = hasMultiple ? "" : "none";
    }
  }

  /* =======================================================
     OPEN LIGHTBOX
  ======================================================= */

  function openLightbox(item) {
    if (!item) {
      return;
    }

    currentCategory = item.closest(".portfolio-category");

    if (!currentCategory) {
      return;
    }

    /*
      Nur Elemente dieser Kategorie.
      Dadurch springt "Weiter" niemals
      in eine andere Portfolio-Kategorie.
    */

    currentItems = getCategoryItems(currentCategory);

    currentIndex = currentItems.indexOf(item);

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    loadLightboxItem(currentItems[currentIndex]);

    lightbox.classList.add("is-open");

    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("lightbox-open");
  }

  /* =======================================================
     CLOSE LIGHTBOX
  ======================================================= */

  function closeLightbox() {
    const video = lightboxMedia.querySelector("video");

    if (video) {
      video.pause();
    }

    clearLightbox();

    lightbox.classList.remove("is-open");

    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("lightbox-open");

    currentItem = null;
    currentCategory = null;
    currentItems = [];
    currentIndex = 0;
  }

  /* =======================================================
     NEXT
  ======================================================= */

  function showNext() {
    if (!currentItems.length) {
      return;
    }

    currentIndex = (currentIndex + 1) % currentItems.length;

    loadLightboxItem(currentItems[currentIndex]);
  }

  /* =======================================================
     PREVIOUS
  ======================================================= */

  function showPrevious() {
    if (!currentItems.length) {
      return;
    }

    currentIndex =
      (currentIndex - 1 + currentItems.length) % currentItems.length;

    loadLightboxItem(currentItems[currentIndex]);
  }

  /* =======================================================
     OPEN BUTTONS
  ======================================================= */

  portfolio.querySelectorAll(".portfolio-open").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const item = button.closest(".portfolio-item");

      openLightbox(item);
    });
  });

  /* =======================================================
     ITEM CLICK
  ======================================================= */

  portfolio.querySelectorAll(".portfolio-item").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (event.target.closest(".portfolio-open")) {
        return;
      }

      openLightbox(item);
    });
  });

  /* =======================================================
     LIGHTBOX BUTTONS
  ======================================================= */

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", showPrevious);
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", showNext);
  }

  if (lightboxZoomIn) {
    lightboxZoomIn.addEventListener("click", zoomIn);
  }

  if (lightboxZoomOut) {
    lightboxZoomOut.addEventListener("click", zoomOut);
  }

  if (lightboxReset) {
    lightboxReset.addEventListener("click", resetZoom);
  }

  /* =======================================================
     BACKDROP
  ======================================================= */

  const backdrop = lightbox.querySelector(".lightbox-backdrop");

  if (backdrop) {
    backdrop.addEventListener("click", closeLightbox);
  }

  /* =======================================================
     KEYBOARD
  ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomIn();
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomOut();
      return;
    }

    if (event.key === "0") {
      event.preventDefault();
      resetZoom();
    }
  });

  /* =======================================================
     TOUCH SWIPE
  ======================================================= */

  lightbox.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];

      if (!touch) {
        return;
      }

      touchStartX = touch.clientX;

      touchStartY = touch.clientY;
    },
    {
      passive: true,
    },
  );

  lightbox.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];

      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - touchStartX;

      const deltaY = touch.clientY - touchStartY;

      /*
        Nur horizontale Swipes
        werden als Navigation interpretiert.
      */

      if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX < 0) {
        showNext();
      } else {
        showPrevious();
      }
    },
    {
      passive: true,
    },
  );

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  const bodyStyle = document.body.style;

  const observer = new MutationObserver(() => {
    if (lightbox.classList.contains("is-open")) {
      bodyStyle.overflow = "hidden";
    } else {
      bodyStyle.overflow = "";
    }
  });

  observer.observe(lightbox, {
    attributes: true,
    attributeFilter: ["class"],
  });

  /* =======================================================
     INITIAL VIDEO START
  ======================================================= */

  const activeCategory = document.querySelector(
    ".portfolio-category.is-active",
  );

  if (activeCategory) {
    playVisibleVideos(activeCategory);
  }
});

/* =========================================================
   END: PORTFOLIO SYSTEM — FINAL
========================================================= */

/* =========================================================
   START: LEGAL MODALS
========================================================= */

(function () {
  const modalTriggers = document.querySelectorAll(".footer-modal-trigger");

  const modals = document.querySelectorAll(".legal-modal");

  let activeModal = null;

  /* ---------------------------------------------------------
     MODAL ÖFFNEN
  --------------------------------------------------------- */

  function openModal(modal) {
    if (!modal) return;

    activeModal = modal;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    const closeButton = modal.querySelector(".legal-modal-close");

    if (closeButton) {
      setTimeout(() => {
        closeButton.focus();
      }, 100);
    }
  }

  /* ---------------------------------------------------------
     MODAL SCHLIESSEN
  --------------------------------------------------------- */

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    activeModal = null;
  }

  /* ---------------------------------------------------------
     FOOTER BUTTONS
  --------------------------------------------------------- */

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modalId = trigger.dataset.modal;
      const modal = document.getElementById(modalId);

      openModal(modal);
    });
  });

  /* ---------------------------------------------------------
     SCHLIESSEN ÜBER X / BACKDROP
  --------------------------------------------------------- */

  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target.matches("[data-modal-close]")) {
        closeModal(modal);
      }
    });
  });

  /* ---------------------------------------------------------
     ESC-TASTE
  --------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });

  /* ---------------------------------------------------------
     SCROLLEN DER HAUPTSEITE VERHINDERN
  --------------------------------------------------------- */

  window.addEventListener("keydown", (event) => {
    if (activeModal && ["Space", "ArrowUp", "ArrowDown"].includes(event.code)) {
      // Scrollen innerhalb des Modals bleibt möglich.
      // Die Seite darunter wird durch CSS blockiert.
    }
  });
})();

/* =========================================================
   END: LEGAL MODALS
========================================================= */

/* =========================================================
   START: HERO VIDEO TRIM
   Spielt nur 00:16 bis 00:45 ab
========================================================= */

(function () {
  function initHeroVideoTrim() {
    const heroMedia = document.querySelector(".hero-media");
    const heroVideo = document.querySelector(".hero-video");

    if (!heroMedia || !heroVideo) {
      return;
    }

    const startTime = parseFloat(heroMedia.dataset.videoStart);

    const endTime = parseFloat(heroMedia.dataset.videoEnd);

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      console.warn("Hero Video Trim: Start- oder Endzeit fehlt.");
      return;
    }

    if (endTime <= startTime) {
      console.warn("Hero Video Trim: Endzeit muss größer als Startzeit sein.");
      return;
    }

    /*
      Normales HTML-Loop deaktivieren.
      Das Video soll NICHT von 0:00 beginnen.
    */
    heroVideo.loop = false;

    heroVideo.removeAttribute("loop");

    /*
      Startposition setzen,
      sobald die Videodaten verfügbar sind.
    */
    function setStartPosition() {
      if (
        heroVideo.readyState >= 1 &&
        (heroVideo.currentTime < startTime || heroVideo.currentTime >= endTime)
      ) {
        try {
          heroVideo.currentTime = startTime;
        } catch (error) {
          console.warn(
            "Hero Video: Startposition konnte noch nicht gesetzt werden.",
            error,
          );
        }
      }
    }

    /*
      Sobald Metadaten geladen sind:
      direkt auf Sekunde 16 springen.
    */
    heroVideo.addEventListener("loadedmetadata", function () {
      setStartPosition();

      /*
          Danach starten.
        */
      heroVideo.play().catch(function () {});
    });

    /*
      Falls das Video bereits geladen war.
    */
    if (heroVideo.readyState >= 1) {
      setStartPosition();

      heroVideo.play().catch(function () {});
    }

    /*
      Falls irgendein anderer Code das Video
      wieder auf 0:00 setzt und startet.
    */
    heroVideo.addEventListener("play", function () {
      if (
        heroVideo.currentTime < startTime ||
        heroVideo.currentTime >= endTime
      ) {
        try {
          heroVideo.currentTime = startTime;
        } catch (error) {}
      }
    });

    /*
      Wichtigster Teil:
      Sobald Sekunde 45 erreicht wird,
      wieder auf Sekunde 16 springen.
    */
    heroVideo.addEventListener("timeupdate", function () {
      if (heroVideo.currentTime >= endTime) {
        heroVideo.pause();

        try {
          heroVideo.currentTime = startTime;
        } catch (error) {}

        heroVideo.play().catch(function () {});
      }
    });

    /*
      Falls der Browser trotzdem "ended" auslöst.
    */
    heroVideo.addEventListener("ended", function () {
      try {
        heroVideo.currentTime = startTime;
      } catch (error) {}

      heroVideo.play().catch(function () {});
    });
  }

  /*
    Falls dein Script am Ende des HTML geladen wird.
  */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroVideoTrim);
  } else {
    initHeroVideoTrim();
  }
})();

/* =========================================================
   END: HERO VIDEO TRIM
========================================================= */
