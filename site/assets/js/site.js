/* THE ONLY CONCLUSION — site behaviour. Settings live in config.js. */
(function () {
  "use strict";
  var CFG = window.TOC_CONFIG || { amazon: {}, email: { lists: {} } };
  var inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function F(form, n) { return form.elements.namedItem(n); }
  function b64(s) { try { return decodeURIComponent(escape(atob(s))); } catch (e) { return ""; } }

  /* ---------- buy links ---------- */
  $$("[data-buy]").forEach(function (a) {
    var url = (CFG.amazon || {})[a.getAttribute("data-buy")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else if (a.hasAttribute("data-hide-if-none")) { a.hidden = true; }
  });

  /* ---------- /review forwarding ---------- */
  var rv = document.getElementById("review-go");
  if (rv) {
    var url = (CFG.amazon || {}).review || (CFG.amazon || {}).allHands;
    if (url) { rv.href = url; if ((CFG.amazon || {}).review && !inFrame) { setTimeout(function () { location.replace(url); }, 900); } }
  }

  /* ---------- the year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- email sign-up ---------- */
  var FIELDS = {
    mailerlite: { email: "fields[email]", name: "fields[name]", extra: { "ml-submit": "1", anticsrf: "true" } },
    kit: { email: "email_address", name: "first_name", extra: {} }
  };
  function subscribe(list, email, name) {
    var conf = ((CFG.email || {}).lists || {})[list] || {};
    var f = FIELDS[(CFG.email || {}).provider] || FIELDS.mailerlite;
    if (!conf.action) return Promise.resolve(false);
    var body = new FormData();
    body.append(f.email, email);
    if (name) body.append(f.name, name);
    Object.keys(f.extra).forEach(function (k) { body.append(k, f.extra[k]); });
    return fetch(conf.action, { method: "POST", mode: "no-cors", body: body })
      .then(function () { return true; }, function () { return true; });
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  $$("form[data-signup]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = $(".form-msg", form), email = F(form,"email").value.trim();
      if (F(form,"website") && F(form,"website").value) return;           // honeypot
      if (!validEmail(email)) { msg.className = "form-msg err"; msg.textContent = "That email address looks incomplete. Check it and try again."; F(form,"email").focus(); return; }
      var btn = $("button[type=submit]", form); btn.disabled = true;
      subscribe(form.getAttribute("data-signup"), email, F(form,"name") ? F(form,"name").value.trim() : "").then(function (sent) {
        msg.className = "form-msg";
        msg.textContent = sent ? "You're on the list. One letter when the next case opens, nothing else."
                               : "Noted on this page. (Sign-ups aren't connected to the mailing list yet.)";
        btn.disabled = false; form.reset();
      });
    });
  });

  /* ---------- practice sheet ---------- */
  var sheet = $("#practice");
  if (sheet) {
    var rows = $$("tr.row", sheet), ANSWER = 5;
    var countEl = $("[data-count]", sheet), sumEl = $("[data-sum]", sheet), verdict = $(".verdict", sheet);
    function standing() { return rows.filter(function (r) { return !r.classList.contains("struck"); }); }
    function update() {
      var left = standing(), sum = left.reduce(function (t, r) { return t + +r.dataset.line; }, 0);
      countEl.textContent = left.length; sumEl.textContent = sum;
      rows.forEach(function (r) { r.classList.remove("found"); r.setAttribute("aria-pressed", r.classList.contains("struck")); });
      verdict.className = "verdict";
      if (!left.some(function (r) { return +r.dataset.line === ANSWER; })) {
        verdict.textContent = "You struck the man who signed. Read the papers again.";
      } else if (left.length === 1) {
        left[0].classList.add("found"); verdict.className = "verdict ok";
        verdict.textContent = "Line 5, J. Ostrow. The only conclusion.";
      } else { verdict.textContent = ""; }
    }
    rows.forEach(function (r) {
      r.tabIndex = 0; r.setAttribute("role", "button");
      function toggle() { r.classList.toggle("struck"); update(); }
      r.addEventListener("click", toggle);
      r.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
    $$(".doc .show", sheet).forEach(function (b) {
      b.addEventListener("click", function () {
        var lines = b.dataset.strike.split(",").map(Number), i = 0;
        b.closest(".doc").classList.add("used");
        lines.forEach(function (n) {
          var r = rows[n - 1];
          if (!r.classList.contains("struck")) { setTimeout(function () { r.classList.add("struck"); update(); }, 180 * i++); }
        });
      });
    });
    $(".reset", sheet).addEventListener("click", function () {
      rows.forEach(function (r) { r.classList.remove("struck"); }); $$(".doc", sheet).forEach(function (d) { d.classList.remove("used"); }); update();
    });
    update();
  }

  /* ---------- Case Zero answer pages ---------- */
  var cz = $("#cz-form");
  if (cz && window.CZ) {
    var data = window.CZ, result = $("#cz-result");
    cz.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = $(".form-msg", cz), name = F(cz,"name").value.trim(), email = F(cz,"email").value.trim();
      if (F(cz,"website") && F(cz,"website").value) return;
      if (!name) { msg.className = "form-msg err"; msg.textContent = "Write the name from your slip. It goes on the letter."; F(cz,"name").focus(); return; }
      if (!validEmail(email)) { msg.className = "form-msg err"; msg.textContent = "That email address looks incomplete. Check it and try again."; F(cz,"email").focus(); return; }
      msg.className = "form-msg"; msg.textContent = "";
      subscribe(data.list, email, name);

      var guess = parseInt((F(cz,"line").value || "").replace(/\D/g, ""), 10), v;
      if (isNaN(guess)) v = "The answer is <em>" + data.label + "</em>.";
      else if (guess === data.answer) v = "<em>" + data.label + ".</em> That's the only conclusion.";
      else v = "Not line " + guess + ". The answer is <em>" + data.label + "</em>. Here's where it turns.";
      $("#cz-verdict").innerHTML = v;
      $("#cz-walk").innerHTML = b64(data.walk);
      $("#cz-letter").innerHTML = b64(data.letter).split("{NAME}").join('<span class="name">' + esc(name) + "</span>");
      result.hidden = false;
      cz.closest("section").classList.add("done");
      setTimeout(function () { result.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    });
    var pb = $("#cz-print");
    if (pb) { if (inFrame) pb.hidden = true; else pb.addEventListener("click", function () { window.print(); }); }
  }
})();
