/* config.js — edit after deploying the Apps Script web app */
window.APP_CONFIG = {
  // Paste your Google Apps Script Web App URL here (see docs/SETUP.md).
  // Leave empty ("") to run in local-only mode: every submission is stored
  // in the browser's localStorage queue and can be exported with ?export.
  ENDPOINT_URL: "https://script.google.com/macros/s/AKfycbwEIiZ__BLB3-STcS3NemUhQap7zLaRKYL6pcGxg5sLssy2ioJXG7Q48Eb1Y4isH_FEDQ/exec",

  // Image path templates; {n} is the segment id 1-36.
  IMG_NARRATIVE: "assets/img/c/C{n}.webp", // Group C — narrative/affective
  IMG_LITERAL:   "assets/img/b/B{n}.webp", // Group B — literal/semantic

  // Emotion keyword chips shown on the "What do you feel?" screen.
  KEYWORDS: [
    "peaceful", "longing", "mysterious", "joyful", "melancholic",
    "serene", "nostalgic", "solitary", "hopeful", "sorrowful",
    "tender", "anxious", "warm", "determined", "lonely", "awed"
  ],
  KEYWORD_MIN: 1,   // next-button threshold (UI copy invites 3–5)
  KEYWORD_MAX: 5
};
