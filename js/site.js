(() => {
  "use strict";

  const table = document.querySelector(".table");
  const hand = document.querySelector(".hand");
  const veil = document.querySelector(".veil");
  const veilHand = document.querySelector(".veil-hand");
  const slot = document.querySelector(".veil-slot");
  const closeButton = document.querySelector(".veil-close");

  const FLY_MS = 440;
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

    // The clone is laid out at the card's own size and reaches the inspect size by scale,
    // so the copy keeps the card's line breaks, padding and type.
    node.style.setProperty("--cw", `${card.offsetWidth}px`);
    node.style.setProperty("--ch", `${card.offsetHeight}px`);
    node.style.setProperty("--dx", `${from.left + from.width / 2 - (to.left + to.width / 2)}px`);
    node.style.setProperty("--dy", `${from.top + from.height / 2 - (to.top + to.height / 2)}px`);
    node.style.setProperty("--k", String(cardScale));
    node.style.setProperty("--k1", String(to.width / card.offsetWidth));
    node.style.setProperty("--r0", rotation === "none" ? "0deg" : rotation);
    node.style.setProperty("--rx", style.getPropertyValue("--rx") || "0deg");
    node.style.setProperty("--ry", style.getPropertyValue("--ry") || "0deg");
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
    // The start position must be in place before the clone is inserted, otherwise its
    // own transition animates it into the hand instead of out of it.
    alignToCard(clone, card);
    veilHand.append(clone);
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
    veil.classList.remove("is-open");
    hand.classList.remove("is-inspecting");
    table.inert = false;

    const settle = () => {
      closeTimer = 0;
      veil.hidden = true;
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

    closeTimer = window.setTimeout(settle, FLY_MS + 60);
  };

  hand.addEventListener("click", (event) => {
    const hit = event.target.closest(".card-hit");
    if (hit) openInspect(hit.closest(".card"));
  });

  // Cards tilt away from the pointer, like a card pressed at the cursor: the side under
  // the pointer sinks and the opposite edge comes up. The anchor rectangle is taken once
  // per hover so the tilt does not feed back into its own measurements.
  const TILT_X = 8;
  const TILT_Y = 10;

  hand.querySelectorAll(".card").forEach((card) => {
    let frame = 0;
    let anchor = null;
    let point = null;

    const settle = () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
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

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      if (!anchor) anchor = card.getBoundingClientRect();
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(paint);
    });

    card.addEventListener("pointerleave", () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      anchor = null;
      point = null;
      settle();
    });
  });

  veil.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) closeInspect();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && inspected) closeInspect();
  });

  document.documentElement.classList.remove("no-js");
})();
