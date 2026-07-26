/* English/Chinese interface strings. Research data always keeps canonical values. */
(function () {
  "use strict";

  var STRINGS = {
    en: {
      pageTitle: "Feel the Poetry — DH2026",
      language: { change: "← Change language" },
      landing: {
        kicker: "DH2026 · LIVE EXPERIMENT",
        title: "Feel the Poetry",
        intro1: "Three thousand years ago, Chinese poets sang of love, longing and war in the <i>Shijing</i> (诗经), the Book of Songs.",
        intro2: "We asked AI to visualize how these poems carry meaning and emotion across languages. Your responses help us compare different visual interpretations.",
        start: "Draw Your Poem",
        researchTitle: "Academic Research Study",
        researchBody: "This exhibit is part of an academic research project (DH2026). We do not ask for your name, account, or contact details. Your responses are stored securely, analysed only in aggregate, and may be reported in research publications. Participation is voluntary, and you may stop at any time.",
        consent: "About 3 minutes · no knowledge of Chinese needed.<br>By taking part you consent to the research use described above."
      },
      draw: {
        title: "The poem chooses you",
        hint: "Tap one card — a 3,000-year-old verse is waiting behind it.",
        chosen: "The poem has chosen you"
      },
      feel: {
        step: "① Feel first — no words yet",
        title: "What do you feel?",
        hint: "Pick 3–5 words that match your impression.",
        custom: "…or your own word (optional)",
        next: "Reveal the Poem"
      },
      reveal: {
        step: "② The poem behind the painting",
        next: "Compare Two Visions"
      },
      compare: {
        step: "③ Comparison {current} of {total}",
        title: "Which image better captures the poem’s poetic mood and imagery?",
        imageA: "Image A captures it better",
        imageB: "Image B captures it better",
        imageAAlt: "Comparison image A",
        imageBAlt: "Comparison image B",
        neither: "No clear preference",
        nextComparison: "Next comparison",
        nextRatings: "Continue to ratings",
        visualCoherence: "How visually coherent is this image as a whole?",
        affectiveFidelity: "How well does this image preserve the poem’s emotional atmosphere?",
        semanticFidelity: "How accurately does this image depict the poem’s key imagery and events?",
        notCoherent: "Not coherent",
        veryCoherent: "Very coherent",
        notFaithful: "Not faithful",
        veryFaithful: "Very faithful",
        notAccurate: "Not accurate",
        veryAccurate: "Very accurate"
      },
      rating: {
        step: "④ Rate image {current} of {total}",
        title: "Please rate image {current} of {total}.",
        hint: "Please consider this image on its own.",
        imageAlt: "Image to rate",
        nextImage: "Next image",
        next: "Continue"
      },
      reflect: {
        step: "⑤ Final reflection (optional)",
        remind: "What does this remind you of?",
        placeholder: "A memory, a place, a feeling…",
        familiarity: "How familiar are you with classical Chinese poetry?",
        first: "First encounter",
        some: "Somewhat",
        familiar: "Familiar",
        submit: "Submit"
      },
      thanks: {
        title: "Thank you!",
        online: "Your feelings have joined a 3,000-year dialogue between poetry and painting.",
        offline: "You appear to be offline — your response is safely saved on this device and will sync automatically later.",
        stats: "You are participant #{n}.",
        contactTitle: "Contact the research team",
        contactInstruction: "Long-press the QR code to recognize it in WeChat.",
        qrAlt: "WeChat contact QR code",
        emailLabel: "✉ Email",
        again: "Draw Again"
      },
      status: {
        submitting: "Submitting…",
        queued: "● {n} response(s) saved on this device — they will sync automatically when online."
      },
      export: { label: "⬇ Export locally-saved responses (backup)" }
    },
    zh: {
      pageTitle: "感受诗意 · 诗画无界 — DH2026",
      language: { change: "← 切换语言" },
      landing: {
        kicker: "DH2026 · 现场实验",
        title: "感受诗意",
        intro1: "三千年前，中国诗人在《诗经》中吟唱爱情、思念与战争。",
        intro2: "我们让 AI 将诗歌中的语义与情感转化为图像。你的回答将帮助我们比较不同的视觉诠释方式。",
        start: "抽一张诗签",
        researchTitle: "学术研究",
        researchBody: "本展项属于 DH2026 学术研究项目。我们不会询问你的姓名、账号或联系方式。回答将被安全保存，仅用于汇总分析，并可能写入研究论文。参与完全自愿，你可以随时退出。",
        consent: "约 3 分钟 · 无需具备古典诗歌知识。<br>继续参与即表示你同意上述研究用途。"
      },
      draw: {
        title: "诗歌选择了你",
        hint: "点击一张诗签——一首跨越三千年的诗正在等待你。",
        chosen: "诗歌已选择了你"
      },
      feel: {
        step: "① 先感受——暂不看原诗",
        title: "你感受到了什么？",
        hint: "请选择 3–5 个符合直觉的词语。",
        custom: "……或写下自己的词（可选）",
        next: "揭示原诗"
      },
      reveal: {
        step: "② 画作背后的原诗",
        next: "比较两种画意"
      },
      compare: {
        step: "③ 第 {current} 轮，共 {total} 轮",
        title: "哪一幅更能传达诗中的意境？",
        imageA: "图像 A 更贴合",
        imageB: "图像 B 更贴合",
        imageAAlt: "对比图像 A",
        imageBAlt: "对比图像 B",
        neither: "两者无明显差异",
        nextComparison: "下一轮比较",
        nextRatings: "继续评价图像",
        visualCoherence: "整幅图像在视觉上有多连贯？",
        affectiveFidelity: "这幅图像在多大程度上保留了诗歌的情感氛围？",
        semanticFidelity: "这幅图像在多大程度上准确呈现了诗中的关键意象与事件？",
        notCoherent: "完全不连贯",
        veryCoherent: "非常连贯",
        notFaithful: "完全不忠实",
        veryFaithful: "非常忠实",
        notAccurate: "完全不准确",
        veryAccurate: "非常准确"
      },
      rating: {
        step: "④ 评价第 {current} 幅图像，共 {total} 幅",
        title: "请评价第 {current} 幅图像，共 {total} 幅。",
        hint: "请只依据当前图像作答。",
        imageAlt: "待评价图像",
        nextImage: "下一幅图像",
        next: "继续"
      },
      reflect: {
        step: "⑤ 最后补充（可选）",
        remind: "这让你想起了什么？",
        placeholder: "一段记忆、一个地方、一种感受……",
        familiarity: "你对中国古典诗歌有多熟悉？",
        first: "初次接触",
        some: "略有了解",
        familiar: "比较熟悉",
        submit: "提交"
      },
      thanks: {
        title: "感谢参与！",
        online: "你的感受已加入一场跨越三千年的诗画对话。",
        offline: "当前似乎处于离线状态——回答已安全保存在本设备中，联网后会自动同步。",
        stats: "你是第 {n} 位知音",
        contactTitle: "联系研究团队",
        contactInstruction: "长按二维码，在微信中识别并添加好友。",
        qrAlt: "微信联系二维码",
        emailLabel: "✉ 邮箱",
        again: "再抽一张"
      },
      status: {
        submitting: "正在提交……",
        queued: "● 本设备已保存 {n} 份回答，联网后将自动同步。"
      },
      export: { label: "⬇ 导出本设备保存的回答（备份）" }
    }
  };

  var KEYWORDS_ZH = {
    peaceful: "宁静",
    longing: "思念",
    mysterious: "神秘",
    joyful: "喜悦",
    melancholic: "惆怅",
    serene: "安宁",
    nostalgic: "怀旧",
    solitary: "独处",
    hopeful: "希望",
    sorrowful: "悲伤",
    tender: "温柔",
    anxious: "焦虑",
    warm: "温暖",
    determined: "坚定",
    lonely: "孤独",
    awed: "敬畏"
  };

  var current = "en";

  function lookup(key) {
    var value = STRINGS[current];
    key.split(".").forEach(function (part) { value = value && value[part]; });
    return typeof value === "string" ? value : key;
  }

  function format(text, values) {
    if (!values) return text;
    return text.replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : "";
    });
  }

  function t(key, values) {
    return format(lookup(key), values);
  }

  function applyStaticStrings() {
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";
    document.title = t("pageTitle");
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (node) {
      node.innerHTML = t(node.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (node) {
      node.setAttribute("alt", t(node.getAttribute("data-i18n-alt")));
    });
  }

  function setLanguage(language) {
    current = language === "zh" ? "zh" : "en";
    applyStaticStrings();
  }

  function chooseLanguage(language) {
    setLanguage(language);
    document.getElementById("language-gate").hidden = true;
    document.getElementById("landing-main").hidden = false;
    if (window.Store && window.Store.refreshQueueNote) {
      window.Store.refreshQueueNote();
    }
    window.scrollTo(0, 0);
  }

  function showLanguageGate() {
    document.getElementById("landing-main").hidden = true;
    document.getElementById("language-gate").hidden = false;
    window.scrollTo(0, 0);
  }

  window.I18N = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: function () { return current; },
    keywordLabel: function (value) {
      return current === "zh" ? (KEYWORDS_ZH[value] || value) : value;
    }
  };

  document.querySelectorAll(".language-choice").forEach(function (button) {
    button.addEventListener("click", function () {
      chooseLanguage(button.getAttribute("data-lang"));
    });
  });
  document.getElementById("btn-language-back").addEventListener("click", showLanguageGate);
  applyStaticStrings();
})();
