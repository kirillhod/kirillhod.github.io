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

    // A card's visual rotation is the fan angle plus whatever the sway has turned it by at
    // this instant, and the sway lives in the transform. Taking both means the clone starts
    // on the card even when the sway is at its widest, instead of a few degrees away.
    const fanAngle = Number.parseFloat(style.rotate) || 0;
    const swayMatrix = new DOMMatrixReadOnly(style.transform === "none" ? "" : style.transform);
    const swayAngle = (Math.atan2(swayMatrix.m12, swayMatrix.m11) * 180) / Math.PI;

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
    node.style.setProperty("--r0", `${(fanAngle + swayAngle).toFixed(3)}deg`);
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
  // per hover so the tilt does not feed back into its own measurements.
  //
  // A finger tilts through touch events, not pointer events: as soon as a phone decides a
  // drag is a scroll it cancels the pointer stream, while touchmove keeps arriving through
  // the scroll. This is why the card responds under a finger at all.
  const TILT_X = 8;
  const TILT_Y = 10;
  const DRAG_PX = 6;
  // The card lifts and tilts under the pointer, so its edge can slide out from under the
  // cursor. The hover therefore lives in `.is-hover`, kept until the pointer is this far
  // outside the rect the hover started on; a plain :hover would drop, snap back, enter and
  // repeat.
  const HOVER_HALO = 24;
  let releaseHover = null;

  // True while the hand is a strip that pans: a finger there is scrolling, not tilting.
  const handPans = () => hand.parentElement.scrollWidth > hand.parentElement.clientWidth + 1;

  hand.querySelectorAll(".card").forEach((card) => {
    let frame = 0;
    let anchor = null;
    let point = null;
    let dragged = false;
    let tracking = false;
    let anchorScrollX = 0;
    let anchorScrollY = 0;
    // Card-relative y where the lean has faded out: the top of the actions row. The
    // buttons must stay where the pointer is aiming, so the card stops turning there.
    let stillTop = 0;
    let startX = 0;
    let startY = 0;
    let startRect = null;
    let startScrollX = 0;
    let startScrollY = 0;

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

    // Measured once from the same rect the tilt is anchored to, so the pointer does not
    // feed back into its own measurements.
    const measureStillTop = (rect) => {
      const actions = card.querySelector(".card-actions");
      stillTop = actions ? actions.getBoundingClientRect().top - rect.top : 0;
    };

    // The page can scroll under a stationary pointer, so the hover rect follows the scroll
    // without being measured again: a fresh rect would include the tilt it is meant to
    // judge.
    const anchorNow = () => ({
      left: anchor.left - (window.scrollX - anchorScrollX),
      top: anchor.top - (window.scrollY - anchorScrollY),
      width: anchor.width,
      height: anchor.height
    });

    const paint = () => {
      frame = 0;
      if (!point || !anchor) return;
      const rect = anchorNow();
      const nx = Math.min(0.5, Math.max(-0.5, (point.x - rect.left) / rect.width - 0.5));
      const ny = Math.min(0.5, Math.max(-0.5, (point.y - rect.top) / rect.height - 0.5));
      // Full lean at the top edge, none from the actions row down: a pointer on a button
      // must not rotate the card out from under the pointer.
      const reach =
        stillTop > 0
          ? Math.min(1, Math.max(0, (stillTop - (point.y - rect.top)) / stillTop))
          : 1;
      card.style.setProperty("--ry", `${(nx * TILT_Y * 2 * reach).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-ny * TILT_X * 2 * reach).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((nx + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${((ny + 0.5) * 100).toFixed(1)}%`);
    };

    const release = () => {
      card.classList.remove("is-hover");
      if (!hand.querySelector(".card.is-hover")) hand.classList.remove("is-hovering");
      if (releaseHover === release) releaseHover = null;
      if (tracking) {
        document.removeEventListener("pointermove", track);
        tracking = false;
      }
      stop();
    };

    const insideHalo = (rect, x, y) =>
      x >= rect.left - HOVER_HALO &&
      x <= rect.left + rect.width + HOVER_HALO &&
      y >= rect.top - HOVER_HALO &&
      y <= rect.top + rect.height + HOVER_HALO;

    // Runs while a card is hovered: the pointer may be inside the halo or outside the card
    // altogether, and only a move beyond the halo drops the hover.
    const track = (event) => {
      if (!anchor) return;
      if (
        event.pointerType === "touch" ||
        !insideHalo(anchorNow(), event.clientX, event.clientY)
      ) {
        release();
        return;
      }
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    // A tap stays flat, so the card it opens is measured cleanly; once the finger moves
    // past DRAG_PX the card leans under it, and touchend marks the drag to drop the click.
    card.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;
        dragged = false;
        delete card.dataset.dragged;
        if (reducedMotion.matches || handPans()) return;
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startRect = card.getBoundingClientRect();
        measureStillTop(startRect);
        startScrollX = window.scrollX;
        startScrollY = window.scrollY;
      },
      { passive: true }
    );

    card.addEventListener(
      "touchmove",
      (event) => {
        if (!startRect || reducedMotion.matches || event.touches.length !== 1) return;
        const touch = event.touches[0];
        if (Math.hypot(touch.clientX - startX, touch.clientY - startY) <= DRAG_PX) return;
        dragged = true;
        anchor = startRect;
        anchorScrollX = startScrollX;
        anchorScrollY = startScrollY;
        point = { x: touch.clientX, y: touch.clientY };
        if (!frame) frame = window.requestAnimationFrame(paint);
      },
      { passive: true }
    );

    card.addEventListener("touchend", () => {
      if (!startRect) return;
      startRect = null;
      if (dragged) card.dataset.dragged = "yes";
      stop();
    });

    card.addEventListener("touchcancel", () => {
      startRect = null;
      stop();
    });

    // Mouse and pen keep the hover tilt, anchored once per hover. The hover itself is a
    // class, so the card moving under the pointer cannot toggle it off and on.
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      if (releaseHover && releaseHover !== release) releaseHover();
      releaseHover = release;
      anchor = card.getBoundingClientRect();
      anchorScrollX = window.scrollX;
      anchorScrollY = window.scrollY;
      measureStillTop(anchor);
      point = { x: event.clientX, y: event.clientY };
      card.classList.add("is-hover");
      hand.classList.add("is-hovering");
      if (!tracking) {
        tracking = true;
        document.addEventListener("pointermove", track);
      }
      paint();
    });

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      if (!anchor) {
        anchor = card.getBoundingClientRect();
        anchorScrollX = window.scrollX;
        anchorScrollY = window.scrollY;
        measureStillTop(anchor);
      }
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(paint);
    });
  });

  // Leaving the window is the one edge the pointer never reports as a move.
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget && releaseHover) releaseHover();
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
