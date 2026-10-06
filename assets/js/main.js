/* Om Raj - portfolio interactions. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EMAIL = "omraj010@gmail.com";

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) {} return null; }

  /* ---------- Footer year ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Theme ---------- */
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    store("theme", t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f5f7fa" : "#0b0f14");
  }
  function toggleTheme() { setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light"); }
  var themeBtn = $("#themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  /* ---------- Copy email ---------- */
  function copyEmail() {
    var done = function () { toast("Email copied: " + EMAIL); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, function () { toast(EMAIL); });
    } else {
      toast(EMAIL);
    }
  }
  var copyBtn = $("#copyEmail");
  if (copyBtn) copyBtn.addEventListener("click", copyEmail);

  /* ---------- Mobile nav ---------- */
  var burger = $("#burger");
  var navLinks = $("#navLinks");
  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", navLinks).forEach(function (a) { a.addEventListener("click", closeNav); });
  }

  /* ---------- Scroll: progress bar, nav border, active link ---------- */
  var progress = $("#progress");
  var nav = $("#nav");
  var sections = $$("main section[id]");
  var linkFor = {};
  $$(".nav__links a").forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });

  function onScroll() {
    var h = doc.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("is-scrolled", h.scrollTop > 8);

    var current = "";
    var line = window.innerHeight * 0.35;
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = s.id;
    });
    Object.keys(linkFor).forEach(function (id) { linkFor[id].classList.toggle("is-active", id === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated counters ---------- */
  function fmt(n, decimals) {
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = fmt(target, decimals) + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Skill filters ---------- */
  var filterWrap = $("#skillFilters");
  var skills = $$(".skill");
  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      var f = btn.getAttribute("data-filter");
      $$(".filter", filterWrap).forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      skills.forEach(function (s) { s.classList.toggle("is-hidden", f !== "all" && s.getAttribute("data-cat") !== f); });
    });
  }

  /* ---------- Cursor glow + card spotlight + terminal tilt ---------- */
  var glow = $("#glow");
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      if (glow) glow.style.transform = "translate3d(" + (e.clientX - 310) + "px," + (e.clientY - 310) + "px,0)";
    }, { passive: true });

    $$(".spot").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    var term = $("#heroTerm");
    if (term) {
      term.addEventListener("pointermove", function (e) {
        var r = term.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        term.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)";
      });
      term.addEventListener("pointerleave", function () { term.style.transform = ""; });
    }
  }

  /* ---------- Hero: rotating role ---------- */
  var roles = ["Backend Engineer", "LLM / RAG Builder", "Django + FastAPI Developer", "Data Pipeline Engineer", "Competitive Programmer"];
  var typedEl = $("#typed");
  function rotateRoles() {
    if (!typedEl) return;
    if (reduceMotion) { typedEl.textContent = roles[0]; return; }
    var ri = 0, ci = 0, deleting = false;
    (function tick() {
      var word = roles[ri];
      typedEl.textContent = word.slice(0, ci);
      var delay = deleting ? 38 : 75;
      if (!deleting && ci === word.length) { deleting = true; delay = 1500; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
      ci += deleting ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }
  rotateRoles();

  /* ---------- Hero: typing terminal ---------- */
  var termBody = $("#termBody");
  var script = [
    { cmd: "whoami", out: [["out", "om raj"]] },
    { cmd: "cat role.txt", out: [["k", "Software Development Engineer 1"], ["c", "Analytics Vidhya, Gurugram"]] },
    { cmd: "cat education.txt", out: [["out", "B.Tech ECE, NIT Patna"], ["c", "CGPA 8.04, class of 2025"]] },
    { cmd: "ls stack/", out: [["v", "python  django  fastapi  celery  kafka"], ["v", "postgres  redis  qdrant  docker  aws"], ["v", "langchain  langgraph  rag  llm-apis"]] },
    { cmd: "cat now.txt", out: [["out", "Building multi-tenant APIs and agentic RAG"], ["out", "pipelines for 5,700+ learners."]] }
  ];

  function addLine(html) {
    var d = doc.createElement("span");
    d.className = "tline";
    d.innerHTML = html;
    termBody.appendChild(d);
    return d;
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function renderTermInstant() {
    script.forEach(function (step) {
      addLine('<span class="p">$</span>' + esc(step.cmd));
      step.out.forEach(function (o) { addLine('<span class="' + o[0] + '">' + esc(o[1]) + "</span>"); });
    });
    addLine('<span class="p">$</span><span class="cursor"></span>');
  }

  function typeTerm() {
    var si = 0;
    function nextStep() {
      if (si >= script.length) { addLine('<span class="p">$</span><span class="cursor"></span>'); return; }
      var step = script[si++];
      var line = addLine('<span class="p">$</span><span class="typing"></span>');
      var holder = line.querySelector(".typing");
      var i = 0;
      (function typeChar() {
        holder.textContent = step.cmd.slice(0, ++i);
        if (i < step.cmd.length) { setTimeout(typeChar, 42 + Math.random() * 40); return; }
        setTimeout(function () {
          var oi = 0;
          (function out() {
            if (oi < step.out.length) {
              var o = step.out[oi++];
              addLine('<span class="' + o[0] + '">' + esc(o[1]) + "</span>");
              setTimeout(out, 130);
            } else {
              setTimeout(nextStep, 260);
            }
          })();
        }, 220);
      })();
    }
    nextStep();
  }

  if (termBody) {
    if (reduceMotion) { renderTermInstant(); }
    else {
      var termStarted = false;
      var startTerm = function () { if (termStarted) return; termStarted = true; setTimeout(typeTerm, 350); };
      if ("IntersectionObserver" in window) {
        var tio = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { tio.disconnect(); startTerm(); }
        }, { threshold: 0.3 });
        tio.observe(termBody);
        setTimeout(startTerm, 2500); /* safety net if the observer is throttled */
      } else { startTerm(); }
    }
  }

  /* ---------- Command palette ---------- */
  var palette = $("#palette");
  var pInput = $("#paletteInput");
  var pList = $("#paletteList");
  var openBtn = $("#openPalette");

  function goTo(id) {
    var el = doc.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
  var commands = [
    { label: "Go to about", hint: "section", run: function () { goTo("about"); } },
    { label: "Go to experience", hint: "section", run: function () { goTo("experience"); } },
    { label: "Go to skills", hint: "section", run: function () { goTo("skills"); } },
    { label: "Go to projects", hint: "section", run: function () { goTo("projects"); } },
    { label: "Go to contests", hint: "section", run: function () { goTo("competitive"); } },
    { label: "Go to education", hint: "section", run: function () { goTo("education"); } },
    { label: "Go to contact", hint: "section", run: function () { goTo("contact"); } },
    { label: "Open resume (PDF)", hint: "file", run: function () { window.open("assets/Om_Raj_Resume.pdf", "_blank", "noopener"); } },
    { label: "Toggle light / dark theme", hint: "theme", run: toggleTheme },
    { label: "Copy email address", hint: "action", run: copyEmail },
    { label: "Open GitHub", hint: "link", run: function () { window.open("https://github.com/omraj0", "_blank", "noopener"); } },
    { label: "Open LinkedIn", hint: "link", run: function () { window.open("https://www.linkedin.com/in/om-raj-915695228/", "_blank", "noopener"); } },
    { label: "Open LeetCode", hint: "link", run: function () { window.open("https://leetcode.com/u/om_0100/", "_blank", "noopener"); } },
    { label: "Open CodeChef", hint: "link", run: function () { window.open("https://www.codechef.com/users/om_010", "_blank", "noopener"); } },
    { label: "Open Codeforces", hint: "link", run: function () { window.open("https://codeforces.com/profile/omraj0100", "_blank", "noopener"); } },
    { label: "Open GeeksForGeeks", hint: "link", run: function () { window.open("https://www.geeksforgeeks.org/user/omraj0100/", "_blank", "noopener"); } },
    { label: "Open HackerRank", hint: "link", run: function () { window.open("https://www.hackerrank.com/profile/omraj0100", "_blank", "noopener"); } },
    { label: "Open Kaggle", hint: "link", run: function () { window.open("https://www.kaggle.com/zorgyy", "_blank", "noopener"); } },
    { label: "Open Code-Query repo", hint: "project", run: function () { window.open("https://github.com/omraj0/Code-Query", "_blank", "noopener"); } },
    { label: "Open HireHub repo", hint: "project", run: function () { window.open("https://github.com/omraj0/jobBoard", "_blank", "noopener"); } }
  ];
  var shown = commands.slice();
  var sel = 0;

  function renderPalette() {
    pList.innerHTML = "";
    if (!shown.length) {
      var empty = doc.createElement("li");
      empty.className = "palette__empty";
      empty.textContent = "command not found";
      pList.appendChild(empty);
      return;
    }
    shown.forEach(function (c, i) {
      var li = doc.createElement("li");
      li.className = "palette__item" + (i === sel ? " is-sel" : "");
      li.setAttribute("role", "option");
      li.innerHTML = "<span>" + esc(c.label) + "</span><small>" + esc(c.hint) + "</small>";
      li.addEventListener("mousemove", function () { if (sel !== i) { sel = i; renderPalette(); } });
      li.addEventListener("click", function () { runCommand(c); });
      pList.appendChild(li);
    });
    var cur = pList.querySelector(".is-sel");
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
  }
  function filterPalette() {
    var q = pInput.value.trim().toLowerCase();
    shown = commands.filter(function (c) { return !q || (c.label + " " + c.hint).toLowerCase().indexOf(q) !== -1; });
    sel = 0;
    renderPalette();
  }
  function openPalette() {
    palette.hidden = false;
    pInput.value = "";
    filterPalette();
    setTimeout(function () { pInput.focus(); }, 0);
  }
  function closePalette() { palette.hidden = true; if (openBtn) openBtn.focus(); }
  function runCommand(c) { closePalette(); setTimeout(c.run, 60); }

  if (palette && pInput && pList) {
    if (openBtn) openBtn.addEventListener("click", openPalette);
    pInput.addEventListener("input", filterPalette);
    palette.addEventListener("mousedown", function (e) { if (e.target === palette) closePalette(); });
    pInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); renderPalette(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); renderPalette(); }
      else if (e.key === "Enter") { e.preventDefault(); if (shown[sel]) runCommand(shown[sel]); }
    });
    doc.addEventListener("keydown", function (e) {
      var typing = /^(input|textarea|select)$/i.test((e.target.tagName || ""));
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        palette.hidden ? openPalette() : closePalette();
      } else if (e.key === "Escape" && !palette.hidden) {
        closePalette();
      } else if (e.key === "/" && !typing && palette.hidden) {
        e.preventDefault();
        openPalette();
      }
    });
  }
})();
