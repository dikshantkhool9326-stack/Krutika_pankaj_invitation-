/* ============================================================
   DikshantGPT — Special Event Detection System
   CLOSE FRIENDS / BESTIE EDITION
   A playful "How well do you know Krutika?" quiz that unlocks
   the invitation as a reward.
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG  —  edit everything here.

   👉 IMPORTANT: Fill in the QUIZ with REAL facts about Krutika!
      For each question, "answer" is the index (0-based) of the
      correct option. Option 0 is the first button, 1 the second,
      and so on. Keep it light & fun — the quiz never blocks the
      invite, it just scores how well the friend knows her. 😄
   ------------------------------------------------------------ */
const CONFIG = {
  star: "Krutika",                 // the friend everyone is being quizzed about
  botName: "DikshantGPT",
  creator: "Dikshant Kumar",
  event: {
    title: "RING CEREMONY INVITATION",
    couple: "Krutika \u2764\uFE0F Pankaj",
    dateText: "19 June 2026",
    timeText: "6:00 PM onwards",
    venue: "Jain Bhavan Mangaldham, Rui",
    target: "2026-06-19T18:00:00",
    mapQuery: "Jain Bhavan Mangaldham, Rui",
  },

  // 🧠 THE QUIZ — edit questions, options, and the correct "answer" index.
  quiz: [
    {
      q: "What's Krutika's ultimate comfort food?",
      options: ["\uD83C\uDF55 Pizza", "\uD83E\uDD5F Momos", "\uD83C\uDF5B Pani Puri", "\uD83C\uDF66 Ice Cream"],
      answer: 1, // 👈 change to the correct option index
      correct: "Of course! A true momos lover \uD83E\uDD5F",
      wrong: "Haha nope \u2014 it's clearly the momos \uD83E\uDD5F",
    },
    {
      q: "Krutika's perfect way to spend a weekend?",
      options: ["\uD83D\uDECF\uFE0F Sleeping in", "\uD83D\uDED2 Shopping", "\uD83C\uDFAC Movie marathon", "\u2708\uFE0F Travelling"],
      answer: 3,
      correct: "Exactly \u2014 always ready for a trip! \u2708\uFE0F",
      wrong: "Close, but she'd pick travelling any day \u2708\uFE0F",
    },
    {
      q: "Pick Krutika's most iconic trait:",
      options: ["\uD83D\uDE02 Always laughing", "\u23F0 Always late", "\uD83D\uDCF8 Always clicking selfies", "\uD83D\uDDE3\uFE0F Never stops talking"],
      answer: 0,
      correct: "Correct \u2014 that laugh is unmistakable! \uD83D\uDE02",
      wrong: "Debatable... but we'll say always laughing \uD83D\uDE02",
    },
    {
      q: "Krutika's most-used phrase?",
      options: ["\u201COne minute!\u201D", "\u201CI'm almost ready\u201D", "\u201CLet's eat something\u201D", "\u201CSo funny yaar\u201D"],
      answer: 1,
      correct: "10/10 \u2014 we've ALL heard that one \uD83D\uDE05",
      wrong: "Nice try, but it's \u201CI'm almost ready\u201D \uD83D\uDE05",
    },
    {
      q: "Final question \u2014 who is Krutika marrying? \uD83D\uDC8D",
      options: ["\uD83E\uDD14 No idea", "\u2764\uFE0F Pankaj", "\uD83D\uDE0E Me, hopefully", "\uD83C\uDF1F A lucky guy"],
      answer: 1,
      correct: "Yesss \u2014 Krutika \u2764\uFE0F Pankaj! And that's why you're here...",
      wrong: "It's Pankaj! \u2764\uFE0F And that's exactly why you're here...",
    },
  ],

  happiness: { without: 80, with: 100 },
};

/* ------------------------------------------------------------
   DOM references
   ------------------------------------------------------------ */
const bootEl   = document.getElementById("boot");
const bootText = document.getElementById("boot-text");
const appEl    = document.getElementById("app");
const chat     = document.getElementById("chat");
const inputForm = document.getElementById("inputForm");
const userInput = document.getElementById("userInput");
const infoBtn   = document.getElementById("infoBtn");
const sidePanel = document.getElementById("sidePanel");
const closePanel = document.getElementById("closePanel");
const overlay   = document.getElementById("overlay");

/* Guest's name, captured live. */
let guestName = "friend";

/* ------------------------------------------------------------
   Tiny helpers
   ------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad2  = (n) => String(n).padStart(2, "0");
const scrollToBottom = () => { chat.scrollTop = chat.scrollHeight; };

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function typeText(node, text, speed = 18) {
  return new Promise((resolve) => {
    node.classList.add("caret");
    let i = 0;
    (function step() {
      node.textContent = text.slice(0, i);
      scrollToBottom();
      if (i < text.length) {
        const ch = text[i];
        i++;
        const jitter = ch === " " ? 0 : Math.random() * speed * 0.7;
        setTimeout(step, speed + jitter);
      } else {
        node.classList.remove("caret");
        resolve();
      }
    })();
  });
}

/* ------------------------------------------------------------
   Message builders
   ------------------------------------------------------------ */
function botBubble() {
  const msg = el("div", "msg bot");
  msg.innerHTML =
    '<div class="avatar">\uD83E\uDD16</div>' +
    '<div class="bubble"><div class="name">' + CONFIG.botName +
    '</div><div class="content"></div></div>';
  chat.appendChild(msg);
  scrollToBottom();
  return { msg, content: msg.querySelector(".content") };
}

function userSay(text) {
  const msg = el("div", "msg user");
  msg.innerHTML = '<div class="bubble"><div class="content"></div></div>';
  msg.querySelector(".content").textContent = text;
  chat.appendChild(msg);
  scrollToBottom();
}

async function botSay(text, opts = {}) {
  const { pre = 520, speed = 18 } = opts;
  const { content } = botBubble();
  content.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  await sleep(pre);
  content.innerHTML = "";
  await typeText(content, text, speed);
  return content;
}

async function thinking(ms) {
  const { msg, content } = botBubble();
  content.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  await sleep(ms);
  msg.remove();
}

/* Choice buttons — resolves with {label, value, index}. */
function showChoices(options) {
  return new Promise((resolve) => {
    const wrap = el("div", "choices");
    options.forEach((opt, index) => {
      const b = el("button", "choice", opt.label);
      b.type = "button";
      b.addEventListener("click", () => {
        wrap.querySelectorAll("button").forEach((x) => (x.disabled = true));
        wrap.remove();
        resolve({ ...opt, index });
      });
      wrap.appendChild(b);
    });
    chat.appendChild(wrap);
    scrollToBottom();
  });
}

/* Wait for the guest to type something into the input box. */
let awaitingText = null;
function askText(placeholder = "Type your answer\u2026") {
  return new Promise((resolve) => {
    userInput.disabled = false;
    userInput.placeholder = placeholder;
    userInput.focus();
    awaitingText = resolve;
  });
}

/* ------------------------------------------------------------
   Animated widgets
   ------------------------------------------------------------ */
function animateValue(fill, valNode, value, dur = 850) {
  return new Promise((resolve) => {
    const inf = value === "\u221E" || value === Infinity;
    const target = inf ? 100 : value;
    if (inf) fill.classList.add("inf");
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(guard);
      fill.style.width = target + "%";
      if (valNode) valNode.textContent = inf ? "\u221E" : target + "%";
      resolve();
    };
    // Timer-driven tween so it completes even if requestAnimationFrame stalls.
    function tick() {
      if (done) return;
      const t = Math.min(1, (performance.now() - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      fill.style.width = (e * target) + "%";
      if (valNode) valNode.textContent = inf ? (t < 1 ? Math.round(e * target) + "%" : "\u221E")
                                             : Math.round(e * target) + "%";
      if (t < 1) setTimeout(tick, 16);
      else finish();
    }
    // Hard fallback guarantees the awaited flow never blocks.
    const guard = setTimeout(finish, dur + 2000);
    setTimeout(tick, 16);
  });
}

/* A single animated score bar (reuses the .stats styling). */
async function showScoreBar(label, pct) {
  const { content } = botBubble();
  const box = el("div", "stats");
  const row = el("div", "stat-row");
  const lbl = el("div", "stat-label", label);
  const track = el("div", "stat-track");
  const fill = el("div", "stat-fill");
  const val = el("div", "stat-val", "0%");
  track.appendChild(fill);
  row.append(lbl, track, val);
  box.appendChild(row);
  content.appendChild(box);
  scrollToBottom();
  await animateValue(fill, val, pct, 1200);
}

async function loadingBar() {
  const { content } = botBubble();
  const bar = el("div", "loadbar");
  const fill = el("div", "loadbar-fill");
  const pct = el("span", "loadbar-pct", "0%");
  bar.appendChild(fill);
  content.append(bar, pct);
  scrollToBottom();
  await animateValue(fill, pct, 100, 1700);
}

async function happinessResult() {
  const { content } = botBubble();
  const box = el("div", "happy");
  const make = (labelText, hi) => {
    const row = el("div", "happy-row" + (hi ? " hi" : ""));
    const lbl = el("span", "hl", labelText);
    const bar = el("div", "happy-bar");
    const fill = el("div", "happy-fill");
    const num = el("div", "happy-num", "0%");
    bar.appendChild(fill);
    row.append(lbl, bar, num);
    box.appendChild(row);
    return { fill, num };
  };
  const without = make("Without you \u2192 Party Fun Level", false);
  const withYou = make("With you \u2192 Party Fun Level", true);
  content.appendChild(box);
  scrollToBottom();
  await animateValue(without.fill, without.num, CONFIG.happiness.without, 900);
  await sleep(250);
  await animateValue(withYou.fill, withYou.num, CONFIG.happiness.with, 1100);
}

async function revealCard() {
  const { content } = botBubble();
  const ev = CONFIG.event;
  const mapURL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(ev.mapQuery);
  const card = el("div", "reveal-card");
  card.innerHTML =
    '<div class="ring">\uD83D\uDC8D</div>' +
    '<div class="rc-title">' + ev.title + "</div>" +
    '<div class="rc-couple">' + ev.couple + "</div>" +
    '<div class="rc-grid">' +
      '<div><span>Date</span><b>' + ev.dateText + "</b></div>" +
      '<div><span>Time</span><b>' + ev.timeText + "</b></div>" +
      '<div class="full"><span>Venue</span><b>' + ev.venue + "</b></div>" +
    "</div>" +
    '<a class="map-btn" target="_blank" rel="noopener" href="' + mapURL +
      '">Open Location \uD83D\uDCCD</a>';
  content.appendChild(card);
  scrollToBottom();
  setTimeout(() => card.classList.add("show"), 30);
  await sleep(900);
}

async function sqlInsert(score, total) {
  const { content } = botBubble();
  const pre = el("pre", "sql");
  content.appendChild(pre);
  const safeName = guestName.replace(/'/g, "");
  const sql =
    "INSERT INTO bestie_log\nVALUES\n(\n" +
    "  '" + safeName + "',\n" +
    "  'Krutika Knowledge Test',\n" +
    "  '" + score + "/" + total + "',\n" +
    "  'Invited & Confirmed'\n);";
  await typeText(pre, sql, 14);
}

function startCountdown() {
  const { content } = botBubble();
  const wrap = el("div", "countdown");
  wrap.innerHTML =
    '<div class="cd-title">Countdown to Event</div>' +
    '<div class="cd-grid">' +
      '<div class="cd-cell"><b id="cd-d">00</b><span>Days</span></div>' +
      '<div class="cd-cell"><b id="cd-h">00</b><span>Hours</span></div>' +
      '<div class="cd-cell"><b id="cd-m">00</b><span>Minutes</span></div>' +
      '<div class="cd-cell"><b id="cd-s">00</b><span>Seconds</span></div>' +
    "</div>" +
    '<div class="cd-foot">See you on 19 June \u2764\uFE0F</div>';
  content.appendChild(wrap);
  scrollToBottom();

  const target = new Date(CONFIG.event.target).getTime();
  const d = wrap.querySelector("#cd-d");
  const h = wrap.querySelector("#cd-h");
  const m = wrap.querySelector("#cd-m");
  const s = wrap.querySelector("#cd-s");
  function update() {
    let diff = target - Date.now();
    if (diff < 0) diff = 0;
    d.textContent = pad2(Math.floor(diff / 86400000));
    h.textContent = pad2(Math.floor((diff % 86400000) / 3600000));
    m.textContent = pad2(Math.floor((diff % 3600000) / 60000));
    s.textContent = pad2(Math.floor((diff % 60000) / 1000));
  }
  update();
  setInterval(update, 1000);
}

/* ------------------------------------------------------------
   Confetti
   ------------------------------------------------------------ */
const confetti = (function () {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const colors = ["#ff4d8d", "#ffd93d", "#39d0ff", "#3ef0a0", "#ffffff", "#b06bff"];
  let parts = [], raf = null, stopAt = 0;
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener("resize", resize);
  resize();
  function spawn(n) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.25,
        r: 4 + Math.random() * 6,
        c: colors[(Math.random() * colors.length) | 0],
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 6.28,
        vr: -0.2 + Math.random() * 0.4,
      });
    }
  }
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    }
    parts = parts.filter((p) => p.y < canvas.height + 40);
    if (Date.now() < stopAt && parts.length < 420) spawn(7);
    if (parts.length > 0) raf = requestAnimationFrame(frame);
    else { raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  function burst(ms = 3000) {
    stopAt = Date.now() + ms;
    spawn(140);
    if (!raf) frame();
  }
  return { burst };
})();

/* ------------------------------------------------------------
   Side panel + commands
   ------------------------------------------------------------ */
function openPanel() { sidePanel.classList.add("open"); sidePanel.setAttribute("aria-hidden", "false"); overlay.classList.add("show"); }
function closeSide() { sidePanel.classList.remove("open"); sidePanel.setAttribute("aria-hidden", "true"); overlay.classList.remove("show"); }
infoBtn.addEventListener("click", openPanel);
closePanel.addEventListener("click", closeSide);
overlay.addEventListener("click", closeSide);

const FALLBACKS = [
  "Ha! Save the chit-chat for the party \uD83C\uDF89",
  "I'm just a bestie-bot, but I'm pumped you're invited \uD83D\uDC9B",
  "Not in my training data \u2014 but our friendship definitely is \uD83D\uDE0A",
  "Try asking 'when is it?' or 'who created you?' \uD83D\uDC40",
];

async function handleCommand(raw) {
  const cmd = raw.toLowerCase().trim();
  if (cmd.includes("who created you") || cmd.includes("who made you") || cmd.includes("who built you")) {
    await botSay("Created by " + CONFIG.creator + "\n\nCurrent Status:\nCan't wait to party with you \u2764\uFE0F");
  } else if (cmd.includes("venue") || cmd.includes("where") || cmd.includes("location")) {
    await botSay("\uD83D\uDCCD " + CONFIG.event.venue + "\n\nTap 'Open Location' on the invite card above for directions.");
  } else if (cmd.includes("when") || cmd.includes("date") || cmd.includes("time")) {
    await botSay("\uD83D\uDDD3\uFE0F " + CONFIG.event.dateText + "\n\u23F0 " + CONFIG.event.timeText);
  } else if (cmd.includes("dress") || cmd.includes("wear")) {
    await botSay("Come looking your best \u2014 it's a celebration! \u2728 (and yes, Krutika WILL out-dress you \uD83D\uDE0E)");
  } else if (cmd === "help" || cmd === "/help") {
    await botSay("You can ask me:\n  \u2022 when is it?\n  \u2022 where is the venue?\n  \u2022 who created you?\n\nOr just enjoy the invite above \uD83D\uDC8D");
  } else if (cmd.includes("who are you")) {
    await botSay("I am " + CONFIG.botName + " \u2014 Bestie Edition \uD83E\uDD16, trained on years of friendship.");
  } else {
    await botSay(FALLBACKS[(Math.random() * FALLBACKS.length) | 0]);
  }
}

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = userInput.value.trim();
  if (!v) return;
  userInput.value = "";
  if (awaitingText) {
    const resolve = awaitingText;
    awaitingText = null;
    userSay(v);
    resolve(v);
    return;
  }
  userSay(v);
  await handleCommand(v);
});

/* ------------------------------------------------------------
   Bestie level based on quiz score
   ------------------------------------------------------------ */
function bestieVerdict(score, total) {
  const pct = Math.round((score / total) * 100);
  let title, line;
  if (pct === 100) {
    title = "\uD83C\uDFC6 CERTIFIED BESTIE";
    line = "Flawless! You know Krutika better than she knows herself \uD83D\uDE0D";
  } else if (pct >= 60) {
    title = "\uD83D\uDC9A TRUE FRIEND";
    line = "Solid score! You clearly know her well \u2014 she's lucky to have you.";
  } else if (pct >= 40) {
    title = "\uD83D\uDE42 GOOD FRIEND";
    line = "Not bad! Time for a long overdue catch-up chai with Krutika \u2615";
  } else {
    title = "\uD83D\uDE05 NEEDS MORE GROUP CALLS";
    line = "Oof... but don't worry \u2014 you're still invited to fix that! \uD83D\uDE04";
  }
  return { pct, title, line };
}

/* ------------------------------------------------------------
   Main scripted flow (Close Friends — Quiz Edition)
   ------------------------------------------------------------ */
async function runFlow() {
  // ----- Welcome -----
  await botSay(
    "Hey hey \uD83D\uDC4B\n\nI am DikshantGPT \u2014 Bestie Edition.\n\n" +
    "Dikshant has a HUGE announcement... but first, a tiny test. \uD83D\uDE0F"
  );

  // ----- Capture guest name -----
  await botSay("Who's taking the test today? Drop your name \uD83D\uDC47", { pre: 350 });
  let name = await askText("Type your name\u2026");
  guestName = (name || "friend").trim().slice(0, 40);
  userInput.placeholder = "Type a message\u2026";

  await botSay(
    "Alright " + guestName + "... let's see how well you REALLY know Krutika. \uD83D\uDC40\n\n" +
    CONFIG.quiz.length + " questions. Be honest \u2014 no Googling! \uD83D\uDE1C"
  );
  await sleep(300);

  // ----- THE QUIZ -----
  let score = 0;
  for (let i = 0; i < CONFIG.quiz.length; i++) {
    const item = CONFIG.quiz[i];
    await botSay("Q" + (i + 1) + " of " + CONFIG.quiz.length + "\n\n" + item.q);
    const pick = await showChoices(item.options.map((o) => ({ label: o })));
    userSay(pick.label);
    if (pick.index === item.answer) {
      score++;
      await botSay(item.correct || "Correct! \u2705", { pre: 300 });
    } else {
      await botSay(item.wrong || ("Not quite \u2014 it's " + item.options[item.answer]), { pre: 300 });
    }
    await sleep(200);
  }

  // ----- Score reveal -----
  await botSay("Calculating your Krutika Knowledge Score... \uD83E\uDDEE", { pre: 350 });
  const verdict = bestieVerdict(score, CONFIG.quiz.length);
  await showScoreBar("Krutika Knowledge", verdict.pct);
  await sleep(200);
  await botSay(
    "You scored " + score + "/" + CONFIG.quiz.length + "!\n\n" +
    verdict.title + "\n" + verdict.line,
    { pre: 350 }
  );
  await sleep(400);

  // ----- Unlock -----
  await botSay("Quiz complete \u2014 you've unlocked something special. \uD83D\uDD13", { pre: 350 });
  await botSay("Scanning... decrypting invitation\u2026", { speed: 16 });
  await thinking(2200);

  // ----- Reveal -----
  await revealCard();
  await sleep(300);

  // ----- Fun impact bars -----
  await botSay("And here's the most important data of all \uD83D\uDC47", { pre: 300 });
  await happinessResult();
  await sleep(400);

  // ----- Personal message -----
  await botSay(
    "Real talk, " + guestName + ":\n\n" +
    "Krutika is starting a beautiful new chapter, and the day just won't feel complete without her favourite people in the room.\n\n" +
    "You're not just invited \u2014 you're one of the people we genuinely can't imagine celebrating without. \u2764\uFE0F",
    { pre: 500, speed: 34 }
  );
  await sleep(400);

  // ----- Decision -----
  await botSay("So... are you in, " + guestName + "?");
  const ans = await showChoices([
    { label: "\u2764\uFE0F Obviously, I'm there!" },
    { label: "\uD83C\uDF89 Try and stop me!" },
    { label: "\uD83D\uDE0E Front row, already booked" },
  ]);
  userSay(ans.label);

  // ----- Success -----
  confetti.burst(4800);
  await botSay("Response Received.\n\nLogging you into the bestie list...", { pre: 300 });
  await sqlInsert(score, CONFIG.quiz.length);
  await botSay("Operation Successful \u2705", { pre: 400 });
  await sleep(300);

  // ----- Final -----
  await botSay(
    "Thank you, " + guestName + "! \uD83D\uDC9B\n\nKrutika is going to be SO happy you're coming.",
    { pre: 300 }
  );
  startCountdown();
}

/* ------------------------------------------------------------
   Boot sequence
   ------------------------------------------------------------ */
async function boot() {
  const lines = [
    "Initializing DikshantGPT v1.0...",
    "Loading friendship database...",
    "Loading Krutika stories...",
    "Loading inside jokes...",
    "Loading secret invitation...",
    "Ready.",
  ];
  let buf = "";
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k];
    for (let i = 0; i < line.length; i++) {
      buf += line[i];
      bootText.textContent = buf;
      await sleep(12);
    }
    buf += "\n";
    bootText.textContent = buf;
    await sleep(k === lines.length - 1 ? 350 : 170);
  }
  await sleep(450);
  bootEl.classList.add("hide");
  appEl.classList.remove("hidden");
  setTimeout(() => { bootEl.style.display = "none"; }, 650);
  runFlow();
}

boot();
