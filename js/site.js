(() => {
  "use strict";

  const table = document.querySelector(".table");
  const hand = document.querySelector(".hand");
  const veil = document.querySelector(".veil");
  const veilHand = document.querySelector(".veil-hand");
  const slot = document.querySelector(".veil-slot");
  const closeButton = document.querySelector(".veil-close");

  // Mirrors --dur-back in css/site.css: the return flight is shorter than the way in.
  const BACK_MS = 280;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let inspected = null;
  let clone = null;
  let closeTimer = 0;

  // The clone starts exactly over the card it was taken from, so the two read as one
  // card that leaves the hand instead of a copy appearing next to it.
  const alignToCard = (node, card) => {
    const from = card.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    if (!from.width || !to.width) return;

    const style = getComputedStyle(card);
    const cardScale = Number.parseFloat(style.scale) || 1;
    const rotation = style.rotate;

    // A compact card hides the note to fit a short landscape screen, so its box is shorter
    // than the copy the inspect view shows. The clone is laid out at the slot width with its
    // own height and scaled onto the card instead.
    const compact = getComputedStyle(card.querySelector(".card-note")).display === "none";

    // The clone is laid out at the card's own size and reaches the inspect size by scale,
    // so the copy keeps the card's line breaks, padding and type.
    node.style.setProperty("--cw", `${compact ? to.width : card.offsetWidth}px`);
    node.style.setProperty("--ch", compact ? "auto" : `${card.offsetHeight}px`);
    node.style.setProperty("--dx", `${from.left + from.width / 2 - (to.left + to.width / 2)}px`);
    node.style.setProperty("--dy", `${from.top + from.height / 2 - (to.top + to.height / 2)}px`);
    node.style.setProperty(
      "--k",
      String(compact ? (card.offsetWidth * cardScale) / to.width : cardScale)
    );
    node.style.setProperty(
      "--k1",
      compact ? "1" : String(Math.min(to.width / card.offsetWidth, to.height / card.offsetHeight))
    );
    node.style.setProperty("--r0", rotation === "none" ? "0deg" : rotation);
    node.style.setProperty("--rx", style.getPropertyValue("--rx") || "0deg");
    node.style.setProperty("--ry", style.getPropertyValue("--ry") || "0deg");
  };

  // A compact clone sizes itself from its copy, so its fit is only known once it is in the
  // document.
  const fitCompact = () => {
    if (!clone || !inspected) return;
    if (clone.style.getPropertyValue("--ch") !== "auto") return;
    const box = slot.getBoundingClientRect();
    const h = clone.offsetHeight;
    const w = clone.offsetWidth;
    if (!h || !w) return;
    clone.style.setProperty("--k1", String(Math.min(box.width / w, box.height / h)));
  };

  const openInspect = (card) => {
    if (inspected === card) return;
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }

    hand.querySelectorAll(".card.is-source").forEach((node) => node.classList.remove("is-source"));
    if (clone) clone.remove();

    clone = card.cloneNode(true);
    clone.classList.add("veil-card");
    clone.querySelector(".card-hit")?.remove();

    inspected = card;
    card.classList.add("is-source");
    hand.classList.add("is-inspecting");
    table.inert = true;

    veil.hidden = false;
    veil.classList.remove("is-closing");
    // The start position must be in place before the clone is inserted, otherwise its
    // own transition animates it into the hand instead of out of it.
    alignToCard(clone, card);
    veilHand.append(clone);
    fitCompact();
    veil.setAttribute("aria-label", card.querySelector(".card-name").textContent.trim());

    // Two frames: the first paints the clone over the card, the second starts the flight.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => veil.classList.add("is-open"));
    });

    closeButton.focus({ preventScroll: true });
  };

  const closeInspect = ({ restoreFocus = true } = {}) => {
    if (!inspected) return;

    const card = inspected;
    inspected = null;

    // The layout may have changed while the card was open, so re-aim before flying back.
    if (clone) alignToCard(clone, card);
    veil.classList.add("is-closing");
    veil.classList.remove("is-open");
    hand.classList.remove("is-inspecting");
    table.inert = false;

    const settle = () => {
      closeTimer = 0;
      veil.hidden = true;
      veil.classList.remove("is-closing");
      if (clone) {
        clone.remove();
        clone = null;
      }
      card.classList.remove("is-source");
      if (restoreFocus) card.querySelector(".card-hit")?.focus({ preventScroll: true });
    };

    if (reducedMotion.matches) {
      settle();
      return;
    }

    closeTimer = window.setTimeout(settle, BACK_MS + 60);
  };

  hand.addEventListener("click", (event) => {
    const hit = event.target.closest(".card-hit");
    if (!hit) return;
    const card = hit.closest(".card");
    // A finger that dragged the card to feel the tilt should not also open it.
    if (card.dataset.dragged) {
      delete card.dataset.dragged;
      return;
    }
    openInspect(card);
  });

  // Cards tilt away from the pointer, like a card pressed at the cursor: the side under
  // the pointer sinks and the opposite edge comes up. The anchor rectangle is taken once
  // per hover so the tilt does not feed back into its own measurements. On a touch screen
  // the same tilt follows a finger, but only where the hand does not scroll sideways.
  const TILT_X = 8;
  const TILT_Y = 10;
  const DRAG_PX = 6;

  // True while the hand is a strip that pans: a finger there is scrolling, not tilting.
  const handPans = () => hand.parentElement.scrollWidth > hand.parentElement.clientWidth + 1;

  hand.querySelectorAll(".card").forEach((card) => {
    let frame = 0;
    let anchor = null;
    let point = null;
    let pressed = false;
    let dragged = false;
    let startX = 0;
    let startY = 0;

    const settle = () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    };

    const stop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      anchor = null;
      point = null;
      settle();
    };

    const paint = () => {
      frame = 0;
      if (!point || !anchor) return;
      const nx = (point.x - anchor.left) / anchor.width - 0.5;
      const ny = (point.y - anchor.top) / anchor.height - 0.5;
      card.style.setProperty("--ry", `${(nx * TILT_Y * 2).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-ny * TILT_X * 2).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((nx + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${((ny + 0.5) * 100).toFixed(1)}%`);
    };

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      anchor = card.getBoundingClientRect();
      point = { x: event.clientX, y: event.clientY };
      paint();
    });

    card.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" || reducedMotion.matches || handPans()) return;
      pressed = true;
      dragged = false;
      startX = event.clientX;
      startY = event.clientY;
      anchor = card.getBoundingClientRect();
      delete card.dataset.dragged;
    });

    card.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches) return;
      if (event.pointerType !== "mouse" && !pressed) return;
      if (!anchor) anchor = card.getBoundingClientRect();
      // A tap stays flat; only a real drag starts the tilt, so the card does not flicker
      // before it flies into the inspect view.
      if (event.pointerType !== "mouse") {
        if (Math.hypot(event.clientX - startX, event.clientY - startY) <= DRAG_PX) return;
        dragged = true;
      }
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(paint);
    });

    card.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse" || !pressed) return;
      pressed = false;
      if (dragged) card.dataset.dragged = "yes";
      stop();
    });

    card.addEventListener("pointercancel", () => {
      if (!pressed) return;
      pressed = false;
      stop();
    });

    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      stop();
    });
  });

  veil.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) closeInspect();
  });

  // A phone that rotates or a window that is resized while a card is open needs the clone
  // re-aimed at the new slot, otherwise it keeps the size it had when it was picked up.
  let aimFrame = 0;
  window.addEventListener("resize", () => {
    if (!inspected || !clone || aimFrame) return;
    aimFrame = window.requestAnimationFrame(() => {
      aimFrame = 0;
      if (inspected && clone) {
        alignToCard(clone, inspected);
        fitCompact();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && inspected) closeInspect();
  });

  document.documentElement.classList.remove("no-js");
})();
