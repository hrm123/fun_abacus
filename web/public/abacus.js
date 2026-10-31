/* Soroban abacus component — no dependencies. */
(function () {
  "use strict";

  const PLACES = ["ones", "tens", "hundreds", "thousands", "10-thousands", "100-thousands", "millions", "10-millions", "100-millions"];

  function rodDigit(rod) {
    return (rod.heaven ? 5 : 0) + rod.earth;
  }

  function createAbacus(container, opts) {
    opts = opts || {};
    let rods = opts.rods || 7;
    let state = [];
    let onChange = opts.onChange || function () {};
    let interactive = opts.interactive !== false;

    function blank() {
      state = [];
      for (let i = 0; i < rods; i++) state.push({ heaven: false, earth: 0 });
    }
    blank();

    function value() {
      let total = 0;
      for (let i = 0; i < rods; i++) {
        total += rodDigit(state[i]) * Math.pow(10, rods - 1 - i);
      }
      return total;
    }

    function setValue(n) {
      n = Math.max(0, Math.floor(Number(n) || 0));
      const str = String(n).padStart(rods, "0").slice(-rods);
      for (let i = 0; i < rods; i++) {
        const d = Number(str[i]);
        state[i].heaven = d >= 5;
        state[i].earth = d % 5;
      }
      render();
    }

    function reset() {
      blank();
      render();
    }

    function setRods(n) {
      rods = Math.min(13, Math.max(1, n | 0));
      blank();
      render();
    }

    function placeName(col) {
      const fromRight = rods - 1 - col;
      return PLACES[fromRight] || ("10^" + fromRight);
    }

    // Soroban behavior: clicking earth bead k sets earth count to k+1,
    // unless it is already the topmost active bead, then it unsets to k.
    function clickEarth(col, k) {
      const rod = state[col];
      if (rod.earth === k + 1) rod.earth = k;
      else rod.earth = k + 1;
      render();
    }

    function clickHeaven(col) {
      state[col].heaven = !state[col].heaven;
      render();
    }

    function render() {
      container.innerHTML = "";
      const frame = document.createElement("div");
      frame.className = "abacus";
      frame.setAttribute("role", "group");
      frame.setAttribute("aria-label", "Soroban abacus with " + rods + " rods");

      for (let c = 0; c < rods; c++) {
        const rod = state[c];
        const rodEl = document.createElement("div");
        rodEl.className = "rod" + ((rods - 1 - c) % 3 === 0 ? " dot-rod" : "");

        // Heaven: spacer position decides bead placement (top=off, bottom=on)
        const heaven = document.createElement("div");
        heaven.className = "heaven";
        const hb = document.createElement("button");
        hb.className = "bead heaven";
        hb.type = "button";
        hb.title = "Heaven bead (5) on " + placeName(c);
        hb.setAttribute("aria-label", "Heaven bead " + placeName(c) + ", " + (rod.heaven ? "on" : "off"));
        hb.setAttribute("aria-pressed", rod.heaven ? "true" : "false");
        if (!interactive) hb.disabled = true;
        (function (col) {
          hb.addEventListener("click", function () { clickHeaven(col); });
        })(c);
        const hsTop = document.createElement("div");
        hsTop.className = "spacer";
        const hsBottom = document.createElement("div");
        hsBottom.className = "spacer";
        if (rod.heaven) { heaven.append(hsTop, hb); }
        else { heaven.append(hb, hsBottom); }

        const beam = document.createElement("div");
        beam.className = "beam-bar";

        // Earth: active beads above spacer, inactive below
        const earth = document.createElement("div");
        earth.className = "earth";
        for (let k = 0; k < rod.earth; k++) {
          earth.appendChild(makeEarthBead(c, k, true));
        }
        const spacer = document.createElement("div");
        spacer.className = "spacer";
        earth.appendChild(spacer);
        for (let k = rod.earth; k < 4; k++) {
          earth.appendChild(makeEarthBead(c, k, false));
        }

        const label = document.createElement("div");
        label.className = "rod-label";
        label.textContent = placeName(c);
        const val = document.createElement("div");
        val.className = "rod-value";
        val.textContent = rodDigit(rod);

        rodEl.append(heaven, beam, earth, label, val);
        frame.appendChild(rodEl);
      }

      container.appendChild(frame);
      onChange(value(), state.map(rodDigit));
    }

    function makeEarthBead(col, k, on) {
      const b = document.createElement("button");
      b.className = "bead";
      b.type = "button";
      b.title = "Earth bead " + (k + 1) + " (1 each) on " + placeName(col);
      b.setAttribute("aria-label", "Earth bead " + (k + 1) + " " + placeName(col) + ", " + (on ? "on" : "off"));
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (!interactive) b.disabled = true;
      b.addEventListener("click", function () { clickEarth(col, k); });
      return b;
    }

    render();

    return {
      get value() { return value(); },
      get rods() { return rods; },
      setValue, reset, setRods, render,
      getDigits: function () { return state.map(rodDigit); },
    };
  }

  window.Abacus = { create: createAbacus };
})();
