/* app.js — flow state machine for the blind-draw poetry experiment */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const CFG = window.APP_CONFIG;
  const SEGMENTS = window.SEGMENTS;
  const I18N = window.I18N;

  // ---------- per-round state ----------
  let round = null;
  function newRound() {
    const seg = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
    const opponents = Math.random() < 0.5
      ? ["ancient", "literal"]
      : ["literal", "ancient"];
    const comparisons = opponents.map(opponent => ({
      opponent,
      order: Math.random() < 0.5
        ? ["narrative", opponent]
        : [opponent, "narrative"],
      choice: null
    }));
    const ratingOrder = Math.random() < 0.5
      ? ["narrative", "baseline"]
      : ["baseline", "narrative"];
    return {
      segment: seg,
      keywords: [],
      customWord: "",
      comparisons,
      comparisonIndex: 0,
      ratingOrder,
      ratingIndex: 0,
      ratings: {
        narrative: { visualCoherence: 0, affectiveFidelity: 0, semanticFidelity: 0 },
        baseline: { visualCoherence: 0, affectiveFidelity: 0, semanticFidelity: 0 }
      },
      referenceExpanded: { compare: true, rating: true },
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

  const imgSrc = (kind, id) => CFG.IMG[kind].replace("{n}", id);

  // ---------- Screen 1: blind draw ----------
  function enterDraw() {
    document.querySelectorAll(".card-flip").forEach(c => c.classList.remove("picked", "faded"));
    $("draw-banner").hidden = true;
    show("s-draw");
  }
  document.querySelectorAll(".card-flip").forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("picked") || document.querySelector(".card-flip.picked")) return;
      round = newRound();
      const s = round.segment;
      card.querySelector(".front-poem-zh").textContent = s.title_zh;
      card.querySelector(".front-poem-en").textContent = s.title_en;
      $("draw-banner-zh").textContent = s.title_zh;
      $("draw-banner-en").textContent = `${s.title_en} — “${s.title_short}”`;
      $("draw-banner-en").hidden = I18N.getLanguage() === "zh";
      card.classList.add("picked");
      document.querySelectorAll(".card-flip").forEach(c => {
        if (c !== card) c.classList.add("faded");
      });
      $("draw-banner").hidden = false;
      ["narrative", "ancient", "literal", "baseline"].forEach(kind => {
        new Image().src = imgSrc(kind, s.id);
      });
      setTimeout(enterFeel, 2400);
    });
  });

  // ---------- Screen 2: feel (backward validation) ----------
  function buildChips() {
    const box = $("chips");
    box.innerHTML = "";
    CFG.KEYWORDS.forEach(w => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = I18N.keywordLabel(w);
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
    const showEnglish = I18N.getLanguage() === "en";
    $("verse-title-en").textContent = `${s.title_en} — “${s.title_short}”`;
    $("verse-title-en").hidden = !showEnglish;
    $("verse-title-zh").textContent = s.title_zh;
    $("verse-ancient").textContent = s.ancient;
    $("verse-translation").textContent = s.translation;
    $("verse-translation").hidden = !showEnglish;
    show("s-reveal");
  }
  $("btn-compare-next").addEventListener("click", enterCompare);

  // ---------- shared poem reference for judgment stages ----------
  function renderPoemReference(prefix) {
    const s = round.segment;
    const expanded = round.referenceExpanded[prefix];
    const showEnglish = I18N.getLanguage() === "en";
    $(prefix + "-poem-label").textContent = I18N.t("reference.label");
    $(prefix + "-poem-toggle-text").textContent = I18N.t(
      expanded ? "reference.hide" : "reference.show"
    );
    $(prefix + "-poem-toggle").setAttribute("aria-expanded", expanded ? "true" : "false");
    $(prefix + "-poem-reference").classList.toggle("is-collapsed", !expanded);
    $(prefix + "-poem-body").hidden = !expanded;
    $(prefix + "-poem-title-en").textContent = s.title_en + " — “" + s.title_short + "”";
    $(prefix + "-poem-title-en").hidden = !showEnglish;
    $(prefix + "-poem-title-zh").textContent = s.title_zh;
    $(prefix + "-poem-ancient").textContent = s.ancient;
    $(prefix + "-poem-translation").textContent = s.translation;
    $(prefix + "-poem-translation").hidden = !showEnglish;
  }
  function togglePoemReference(prefix) {
    if (!round) return;
    round.referenceExpanded[prefix] = !round.referenceExpanded[prefix];
    renderPoemReference(prefix);
  }
  ["compare", "rating"].forEach(prefix => {
    $(prefix + "-poem-toggle").addEventListener("click", () => togglePoemReference(prefix));
  });

  // ---------- Screen 4: two fixed pairwise comparisons ----------
  function enterCompare() {
    const trial = round.comparisons[round.comparisonIndex];
    const id = round.segment.id;
    $("cmp-img-1").src = imgSrc(trial.order[0], id);
    $("cmp-img-2").src = imgSrc(trial.order[1], id);
    renderPoemReference("compare");
    $("compare-progress").textContent = I18N.t("compare.step", {
      current: round.comparisonIndex + 1,
      total: round.comparisons.length
    });
    document.querySelectorAll(".compare-item").forEach(f => f.classList.remove("selected"));
    $("btn-pick-1").classList.remove("selected");
    $("btn-pick-2").classList.remove("selected");
    $("btn-pick-neither").classList.remove("selected");
    ["btn-pick-1", "btn-pick-2", "btn-pick-neither"].forEach(id => {
      $(id).setAttribute("aria-pressed", "false");
    });
    $("btn-compare-done").disabled = true;
    $("btn-compare-done").textContent = I18N.t(
      round.comparisonIndex < round.comparisons.length - 1
        ? "compare.nextComparison"
        : "compare.nextRatings"
    );
    show("s-compare");
  }
  function pick(side) {
    const trial = round.comparisons[round.comparisonIndex];
    trial.choice = side === -1 ? "tie" : trial.order[side];
    document.querySelectorAll(".compare-item").forEach(f => f.classList.remove("selected"));
    $("btn-pick-1").classList.toggle("selected", side === 0);
    $("btn-pick-2").classList.toggle("selected", side === 1);
    $("btn-pick-neither").classList.toggle("selected", side === -1);
    $("btn-pick-1").setAttribute("aria-pressed", side === 0 ? "true" : "false");
    $("btn-pick-2").setAttribute("aria-pressed", side === 1 ? "true" : "false");
    $("btn-pick-neither").setAttribute("aria-pressed", side === -1 ? "true" : "false");
    if (side >= 0) {
      const shownSide = side === 0 ? "first" : "second";
      document.querySelector(`.compare-item[data-side="${shownSide}"]`).classList.add("selected");
    }
    $("btn-compare-done").disabled = false;
  }
  $("btn-pick-1").addEventListener("click", () => pick(0));
  $("btn-pick-2").addEventListener("click", () => pick(1));
  $("btn-pick-neither").addEventListener("click", () => pick(-1));
  $("btn-compare-done").addEventListener("click", () => {
    if (round.comparisonIndex < round.comparisons.length - 1) {
      round.comparisonIndex += 1;
      enterCompare();
      return;
    }
    round.ratingIndex = 0;
    enterRating();
  });

  function buildLikert(row, setter) {
    row.innerHTML = "";
    row.setAttribute("role", "radiogroup");
    const question = row.parentNode.querySelector(".likert-q");
    if (question) row.setAttribute("aria-label", question.textContent);
    for (let v = 1; v <= 5; v++) {
      const b = document.createElement("button");
      b.className = "likert-dot";
      b.textContent = v;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", () => {
        row.querySelectorAll(".likert-dot").forEach(d => {
          d.classList.remove("selected");
          d.setAttribute("aria-checked", "false");
        });
        b.classList.add("selected");
        b.setAttribute("aria-checked", "true");
        setter(v);
      });
      row.appendChild(b);
    }
  }

  // ---------- Screen 5: counterbalanced C/D single-image ratings ----------
  function enterRating() {
    const kind = round.ratingOrder[round.ratingIndex];
    const scores = round.ratings[kind];
    $("rating-progress").textContent = I18N.t("rating.step", {
      current: round.ratingIndex + 1,
      total: round.ratingOrder.length
    });
    $("rating-title").textContent = I18N.t("rating.title", {
      current: round.ratingIndex + 1,
      total: round.ratingOrder.length
    });
    $("rating-screen-img").src = imgSrc(kind, round.segment.id);
    renderPoemReference("rating");
    $("btn-rating-done").textContent = I18N.t(
      round.ratingIndex < round.ratingOrder.length - 1
        ? "rating.nextImage"
        : "rating.next"
    );
    $("btn-rating-done").disabled = true;
    buildLikert($("rating-likert-visual-coherence"), v => {
      scores.visualCoherence = v;
      checkRatingDone(scores);
    });
    buildLikert($("rating-likert-affective-fidelity"), v => {
      scores.affectiveFidelity = v;
      checkRatingDone(scores);
    });
    buildLikert($("rating-likert-semantic-fidelity"), v => {
      scores.semanticFidelity = v;
      checkRatingDone(scores);
    });
    show("s-rating");
  }
  function checkRatingDone(scores) {
    $("btn-rating-done").disabled =
      !(scores.visualCoherence > 0 &&
        scores.affectiveFidelity > 0 &&
        scores.semanticFidelity > 0);
  }
  $("btn-rating-done").addEventListener("click", () => {
    if (round.ratingIndex < round.ratingOrder.length - 1) {
      round.ratingIndex += 1;
      enterRating();
      return;
    }
    show("s-reflect");
  });

  // zoom overlay
  [$("cmp-img-1"), $("cmp-img-2"), $("feel-img"), $("rating-screen-img")].forEach(img => {
    img.addEventListener("click", () => {
      $("zoom-img").src = img.src;
      $("zoom-overlay").hidden = false;
    });
  });
  $("zoom-overlay").addEventListener("click", () => { $("zoom-overlay").hidden = true; });

  // ---------- Screen 6: reflect + submit ----------
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
    $("submit-status").textContent = I18N.t("status.submitting");
    const s = round.segment;
    const comparison1 = round.comparisons[0];
    const comparison2 = round.comparisons[1];
    const cRatings = round.ratings.narrative;
    const dRatings = round.ratings.baseline;
    const result = await window.Store.submit({
      segment_id: s.id,
      poem_part: s.part,
      keywords: round.keywords,
      custom_word: round.customWord,
      comparison_order: round.comparisons.map(trial => trial.opponent).join(">"),
      comparison_1_pair: `narrative_vs_${comparison1.opponent}`,
      comparison_1_left_group: comparison1.order[0],
      comparison_1_right_group: comparison1.order[1],
      comparison_1_choice: comparison1.choice,
      comparison_2_pair: `narrative_vs_${comparison2.opponent}`,
      comparison_2_left_group: comparison2.order[0],
      comparison_2_right_group: comparison2.order[1],
      comparison_2_choice: comparison2.choice,
      rating_order: round.ratingOrder.join(">"),
      likert_visual_coherence: cRatings.visualCoherence,
      likert_affective_fidelity: cRatings.affectiveFidelity,
      likert_semantic_fidelity: cRatings.semanticFidelity,
      baseline_likert_visual_coherence: dRatings.visualCoherence,
      baseline_likert_affective_fidelity: dRatings.affectiveFidelity,
      baseline_likert_semantic_fidelity: dRatings.semanticFidelity,
      open_text: $("open-text").value.trim(),
      familiarity: round.familiarity
    });
    $("submit-status").textContent = "";
    $("btn-submit").disabled = false;
    submitting = false;
    enterThanks(result);
  });

  // ---------- Screen 7: thanks ----------
  async function enterThanks(result) {
    $("thanks-line").textContent = result === "online"
      ? I18N.t("thanks.online")
      : I18N.t("thanks.offline");
    $("thanks-stats").textContent = "";
    show("s-thanks");
    if (window.APP_CONFIG.ENDPOINT_URL && result === "online") {
      try {
        const r = await fetch(window.APP_CONFIG.ENDPOINT_URL + "?stats=1");
        const j = await r.json();
        if (j && j.total) $("thanks-stats").textContent = I18N.t("thanks.stats", { n: j.total });
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
    let n = 1, kind = 0;
    const kinds = ["narrative", "literal", "ancient", "baseline"];
    const timer = setInterval(() => {
      if (n > 36 && ++kind >= kinds.length) { clearInterval(timer); return; }
      if (n > 36) n = 1;
      new Image().src = imgSrc(kinds[kind], n++);
    }, 250);
  });
})();
