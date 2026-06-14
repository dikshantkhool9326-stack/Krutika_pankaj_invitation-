/* ============================================================
   DikshantGPT — Special Event Detection System
   Interactive flow engine
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG  —  edit these values to personalize everything.
   Tip: you can also pass her name via the URL, e.g.
        index.html?name=Priya
   ------------------------------------------------------------ */
const CONFIG = {
  herName: "Dimple",             // 👈 CHANGE THIS to her actual name
  botName: "DikshantGPT",
  creator: "Dikshant Kumar",
  event: {
    title: "RING CEREMONY INVITATION",
    couple: "Krutika \u2764\uFE0F Pankaj",
    dateText: "19 June 2026",
    timeText: "6:00 PM onwards",
    venue: "Jain Bhavan Mangaldham, Rui",
    target: "2026-06-19T18:00:00",          // countdown target (local time)
    mapQuery: "Jain Bhavan Mangaldham, Rui", // used for the map button
  },
  security: {
    question: "What is the best food?",
    options: ["\uD83C\uDF55 Pizza", "\uD83E\uDD5F Momos", "\uD83D\uDE0B Both"],
  },
  happiness: { without: 78, with: 100 },
  stats: [
    { label: "Trust",      value: 97 },
    { label: "Humour",     value: 92 },
    { label: "Patience",   value: 95 },
    { label: "Cuteness",   value: 100 },
    { label: "Importance", value: "\u221E" }, // ∞
  ],
};

// Allow ?name=... override (rendered as plain text, so it is safe)
const _qName = new URLSearchParams(location.search).get("name");
if (_qName) CONFIG.herName = _qName;

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

/* Types text character-by-character into a node (returns a Promise). */
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

/* Bot says something: shows typing indicator, then types the text. */
async function botSay(text, opts = {}) {
  const { pre = 520, speed = 18 } = opts;
  const { content } = botBubble();
  content.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  await sleep(pre);
  content.innerHTML = "";
  await typeText(content, text, speed);
  return content;
}

/* A standalone "thinking" bubble that disappears after `ms`. */
async function thinking(ms) {
  const { msg, content } = botBubble();
  content.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  await sleep(ms);
  msg.remove();
}

/* Choice buttons — resolves with the picked option {label, value}. */
function showChoices(options) {
  return new Promise((resolve) => {
    const wrap = el("div", "choices");
    options.forEach((opt) => {
      const b = el("button", "choice", opt.label);
      b.type = "button";
      b.addEventListener("click", () => {
        wrap.querySelectorAll("button").forEach((x) => (x.disabled = true));
        wrap.remove();
        resolve(opt);
      });
      wrap.appendChild(b);
    });
    chat.appendChild(wrap);
    scrollToBottom();
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
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
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

async function showStats() {
  const { content } = botBubble();
  const box = el("div", "stats");
  content.appendChild(box);
  for (const s of CONFIG.stats) {
    const row = el("div", "stat-row");
    const label = el("div", "stat-label", s.label);
    const track = el("div", "stat-track");
    const fill = el("div", "stat-fill");
    const val = el("div", "stat-val", "0%");
    track.appendChild(fill);
    row.append(label, track, val);
    box.appendChild(row);
    scrollToBottom();
    await animateValue(fill, val, s.value);
    await sleep(140);
  }
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

  const without = make("Without your presence \u2192 Event Happiness", false);
  const withYou = make("With your presence \u2192 Event Happiness", true);
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

async function sqlInsert() {
  const { content } = botBubble();
  const pre = el("pre", "sql");
  content.appendChild(pre);
  const sql =
    "INSERT INTO memories\nVALUES\n(\n" +
    "  '19-June-2026',\n" +
    "  'Ring Ceremony',\n" +
    "  'Attended Together'\n);";
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
   Confetti (lightweight canvas particle burst)
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
   Side panel + easter-egg input
   ------------------------------------------------------------ */
function openPanel() { sidePanel.classList.add("open"); sidePanel.setAttribute("aria-hidden", "false"); overlay.classList.add("show"); }
function closeSide() { sidePanel.classList.remove("open"); sidePanel.setAttribute("aria-hidden", "true"); overlay.classList.remove("show"); }
infoBtn.addEventListener("click", openPanel);
closePanel.addEventListener("click", closeSide);
overlay.addEventListener("click", closeSide);

const FALLBACKS = [
  "Processing… but honestly I'm a little distracted by how special you are \u2764\uFE0F",
  "That input is not in my training data, but you definitely are.",
  "Hmm, I only have eyes (and parameters) for one person right now \uD83D\uDE0A",
  "Try typing 'love' or 'who created you?' \uD83D\uDC40",
];

async function handleCommand(raw) {
  const cmd = raw.toLowerCase().trim();
  if (cmd.includes("who created you") || cmd.includes("who made you")) {
    await botSay("Created by " + CONFIG.creator + "\n\nCurrent Status:\nHoping you say yes \u2764\uFE0F");
  } else if (cmd === "love" || cmd === "i love you" || cmd === "love you") {
    await botSay("Error 404\n\nUnable to express full amount of love using available vocabulary.");
  } else if (cmd === "help" || cmd === "/help") {
    await botSay("Available commands:\n  \u2022 love\n  \u2022 who created you?\n\nOr just enjoy the event details above \uD83D\uDC8D");
  } else if (cmd.includes("who are you")) {
    await botSay("I am " + CONFIG.botName + " \u2014 a Special Event Detection System, fine-tuned entirely on you.");
  } else {
    await botSay(FALLBACKS[(Math.random() * FALLBACKS.length) | 0]);
  }
}

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = userInput.value.trim();
  if (!v) return;
  userInput.value = "";
  userSay(v);
  await handleCommand(v);
});

/* ------------------------------------------------------------
   The main scripted flow (Screens 1 → Final)
   ------------------------------------------------------------ */
async function runFlow() {
  userInput.disabled = false;

  // ----- Screen 1: Authentication -----
  await botSay(
    "Hello Human \uD83D\uDC4B\n\nI am DikshantGPT.\n\n" +
    "An important event has been detected.\n\n" +
    "Before proceeding, identity verification is required."
  );

  let verified = false;
  while (!verified) {
    const choice = await showChoices([
      { label: "\u2764\uFE0F I'm " + CONFIG.herName, value: "her" },
      { label: "\uD83D\uDC40 I'm Someone Else", value: "other" },
    ]);
    userSay(choice.label);

    if (choice.value === "her") {
      verified = true;
    } else {
      await botSay(
        "Access Denied.\n\nThis system is reserved for a very special person only.\n\nRedirecting...",
        { pre: 300 }
      );
      await sleep(1300);
      await botSay("Returning to identity verification\u2026", { pre: 200, speed: 14 });
    }
  }

  // ----- Screen 2: Verification -----
  await botSay("Identity Match Found.\n\nRunning relationship analysis...");
  await sleep(300);
  await showStats();
  await sleep(500);

  // ----- Screen 3: AI Database Scan -----
  await botSay("Scanning future events...");
  await thinking(3000);
  await botSay("1 High Priority Event Found.", { pre: 200 });
  await sleep(300);

  // ----- Screen 4: Security Challenge -----
  await botSay(
    "To reveal event details,\nplease answer one security question.\n\n" +
    CONFIG.security.question
  );
  const food = await showChoices(
    CONFIG.security.options.map((o) => ({ label: o, value: o }))
  );
  userSay(food.label);
  await botSay("Correct Answer Detected.", { pre: 300 });
  await sleep(300);

  // ----- Screen 5: Emotional Analysis -----
  await botSay("Analyzing user impact...");
  await loadingBar();
  await happinessResult();
  await sleep(400);

  // ----- Screen 6: Final Reveal -----
  await botSay("Decryption complete. Revealing event\u2026", { speed: 16 });
  await revealCard();
  await sleep(300);

  // ----- Screen 7: Personal Message -----
  await botSay(
    "System Note:\n\n" +
    "This is one of the most important moments for my family.\n\n" +
    "The AI has analyzed millions of possibilities and reached one conclusion.\n\n" +
    "I would really love to have you there with me.\n\n" +
    "Your presence would make this celebration even more special.",
    { pre: 500, speed: 34 }
  );
  await sleep(400);

  // ----- Screen 8: Decision -----
  await botSay("Will you attend?");
  const ans = await showChoices([
    { label: "\u2764\uFE0F Yes", value: 1 },
    { label: "\u2764\uFE0F Definitely Yes", value: 2 },
    { label: "\u2764\uFE0F Obviously Yes", value: 3 },
  ]);
  userSay(ans.label);

  // ----- Screen 9: Success Animation -----
  confetti.burst(4500);
  await botSay("Response Received.\n\nUpdating database...", { pre: 300 });
  await sqlInsert();
  await botSay("Operation Successful \u2705", { pre: 400 });
  await sleep(300);

  // ----- Final Screen -----
  await botSay("Thank you for accepting the invitation. \u2764\uFE0F", { pre: 300 });
  startCountdown();
}

/* ------------------------------------------------------------
   Boot sequence
   ------------------------------------------------------------ */
async function boot() {
  const lines = [
    "Initializing DikshantGPT v1.0...",
    "Loading memories...",
    "Loading emotions...",
    "Loading family events...",
    "Loading special guest database...",
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

// Kick everything off.
boot();
