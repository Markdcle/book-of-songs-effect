/* app.js — flow state machine for the blind-draw poetry experiment */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const CFG = window.APP_CONFIG;
  const SEGMENTS = window.SEGMENTS;

  // ---------- per-round state ----------
  let round = null;
  function newRound() {
    const seg = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
    // Randomise which painting appears as "Image A" (recorded for the paper).
    const order = Math.random() < 0.5 ? ["literal", "narrative"] : ["narrative", "literal"];
    return {
      segment: seg,
      keywords: [],
      customWord: "",
      order,                      // e.g. ["narrative","literal"] -> A=narrative
      compareChoice: null,        // resolved to "literal" | "narrative" | "neither"
      likertFit: 0,
      likertResonance: 0,
      openText: "",
      familiarity: ""
    };
  }

  // ---------- screen switching ----------
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  const imgSrc = (kind, id) =>
    (kind === "narrative" ? CFG.IMG_NARRATIVE : CFG.IMG_LITERAL).replace("{n}", id);

  // ---------- Screen 1: blind draw ----------
  function enterDraw() {
    document.querySelectorAll(".card-back").forEach(c => c.classList.remove("picked", "faded"));
    show("s-draw");
  }
  document.querySelectorAll(".card-back").forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("picked")) return;
      round = newRound();
      card.classList.add("picked");
      document.querySelectorAll(".card-back").forEach(c => {
        if (c !== card) c.classList.add("faded");
      });
      // preload both paintings for this segment while the flip animates
      new Image().src = imgSrc("narrative", round.segment.id);
      new Image().src = imgSrc("literal", round.segment.id);
      setTimeout(enterFeel, 750);
    });
  });

  // ---------- Screen 2: feel (backward validation) ----------
  function buildChips() {
    const box = $("chips");
    box.innerHTML = "";
    CFG.KEYWORDS.forEach(w => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = w;
      b.addEventListener("click", () => {
        const i = round.keywords.indexOf(w);
        if (i >= 0) { round.keywords.splice(i, 1); b.classList.remove("selected"); }
        else if (round.keywords.length < CFG.KEYWORD_MAX) { round.keywords.push(w); b.classList.add("selected"); }
        $("btn-feel-next").disabled = round.keywords.length < CFG.KEYWORD_MIN;
      });
      box.appendChild(b);
    });
  }
  function enterFeel() {
    $("feel-img").src = imgSrc("narrative", round.segment.id);
    buildChips();
    $("custom-word").value = "";
    $("btn-feel-next").disabled = true;
    show("s-feel");
  }
  $("btn-feel-next").addEventListener("click", () => {
    round.customWord = $("custom-word").value.trim();
    enterReveal();
  });

  // ---------- Screen 3: reveal ----------
  function enterReveal() {
    const s = round.segment;
    $("verse-title-en").textContent = `${s.title_en} — “${s.title_short}”`;
    $("verse-title-zh").textContent = s.title_zh;
    $("verse-ancient").textContent = s.ancient;
    $("verse-translation").textContent = s.translation;
    show("s-reveal");
  }
  $("btn-compare-next").addEventListener("click", enterCompare);

  // ---------- Screen 4: compare ----------
  function enterCompare() {
    const id = round.segment.id;
    $("cmp-img-1").src = imgSrc(round.order[0], id);
    $("cmp-img-2").src = imgSrc(round.order[1], id);
    document.querySelectorAll(".compare-item").forEach(f => f.classList.remove("selected"));
    $("btn-pick-1").classList.remove("selected");
    $("btn-pick-2").classList.remove("selected");
    $("likert-block").hidden = true;
    $("btn-compare-done").disabled = true;
    buildLikert($("likert-fit"), v => { round.likertFit = v; checkCompareDone(); });
    buildLikert($("likert-resonance"), v => { round.likertResonance = v; checkCompareDone(); });
    show("s-compare");
  }
  function pick(side) { // side: 0 = first image shown, 1 = second, -1 = neither
    round.compareChoice = side === -1 ? "neither" : round.order[side];
    document.querySelectorAll(".compare-item").forEach(f => f.classList.remove("selected"));
    $("btn-pick-1").classList.toggle("selected", side === 0);
    $("btn-pick-2").classList.toggle("selected", side === 1);
    if (side >= 0) document.querySelector(`.compare-item[data-side="${side === 0 ? "first" : "second"}"]`).classList.add("selected");
    $("likert-block").hidden = false;
    $("likert-block").scrollIntoView({ behavior: "smooth", block: "nearest" });
    checkCompareDone();
  }
  $("btn-pick-1").addEventListener("click", () => pick(0));
  $("btn-pick-2").addEventListener("click", () => pick(1));
  $("btn-pick-neither").addEventListener("click", () => pick(-1));

  function buildLikert(row, setter) {
    row.innerHTML = "";
    for (let v = 1; v <= 5; v++) {
      const b = document.createElement("button");
      b.className = "likert-dot";
      b.textContent = v;
      b.addEventListener("click", () => {
        row.querySelectorAll(".likert-dot").forEach(d => d.classList.remove("selected"));
        b.classList.add("selected");
        setter(v);
      });
      row.appendChild(b);
    }
  }
  function checkCompareDone() {
    $("btn-compare-done").disabled =
      !(round.compareChoice && round.likertFit > 0 && round.likertResonance > 0);
  }
  $("btn-compare-done").addEventListener("click", () => show("s-reflect"));

  // zoom overlay
  [$("cmp-img-1"), $("cmp-img-2"), $("feel-img")].forEach(img => {
    img.addEventListener("click", () => {
      $("zoom-img").src = img.src;
      $("zoom-overlay").hidden = false;
    });
  });
  $("zoom-overlay").addEventListener("click", () => { $("zoom-overlay").hidden = true; });

  // ---------- Screen 5: reflect + submit ----------
  let familiarityBound = false;
  function bindFamiliarity() {
    if (familiarityBound) return;
    familiarityBound = true;
    document.querySelectorAll("#familiarity-chips .chip").forEach(c => {
      c.addEventListener("click", () => {
        document.querySelectorAll("#familiarity-chips .chip").forEach(x => x.classList.remove("selected"));
        c.classList.add("selected");
        round.familiarity = c.dataset.val;
      });
    });
  }
  bindFamiliarity();

  let submitting = false;
  $("btn-submit").addEventListener("click", async () => {
    if (submitting) return;
    submitting = true;
    $("btn-submit").disabled = true;
    $("submit-status").textContent = "Submitting…";
    const s = round.segment;
    const result = await window.Store.submit({
      segment_id: s.id,
      poem_part: s.part,
      keywords: round.keywords,
      custom_word: round.customWord,
      shown_first: round.order[0],       // what "Image A" actually was
      compare_choice: round.compareChoice,
      likert_fit: round.likertFit,
      likert_resonance: round.likertResonance,
      open_text: $("open-text").value.trim(),
      familiarity: round.familiarity
    });
    $("submit-status").textContent = "";
    $("btn-submit").disabled = false;
    submitting = false;
    enterThanks(result);
  });

  // ---------- Screen 6: thanks ----------
  async function enterThanks(result) {
    $("thanks-line").textContent = result === "online"
      ? "Your feelings have joined a 3,000-year dialogue between poetry and painting."
      : "You appear to be offline — your response is safely saved on this device and will sync automatically later.";
    $("thanks-stats").textContent = "";
    show("s-thanks");
    // optional live counter (only when endpoint configured & online)
    if (window.APP_CONFIG.ENDPOINT_URL && result === "online") {
      try {
        const r = await fetch(window.APP_CONFIG.ENDPOINT_URL + "?stats=1");
        const j = await r.json();
        if (j && j.total) $("thanks-stats").textContent = `You are participant #${j.total}. 你是第 ${j.total} 位知音`;
      } catch (e) { /* stats are a nicety, not a requirement */ }
    }
  }
  $("btn-again").addEventListener("click", enterDraw);

  // ---------- landing ----------
  $("btn-start").addEventListener("click", enterDraw);

  // ---------- service worker + idle image preload (offline guarantee) ----------
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  window.addEventListener("load", () => {
    // Preload all paintings in the background so the app works fully offline
    // afterwards (hotel-WiFi-then-venue scenario). Gentle: 1 image per 250 ms.
    let n = 1, kind = 0;
    const kinds = ["narrative", "literal"];
    const timer = setInterval(() => {
      if (n > 36 && ++kind >= kinds.length) { clearInterval(timer); return; }
      if (n > 36) n = 1;
      new Image().src = imgSrc(kinds[kind], n++);
    }, 250);
  });
})();
