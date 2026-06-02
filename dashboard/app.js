/* ============================================================
   ALL VOLLEYBALL — Dashboard app.
   Hash router + view renderers + hand-built SVG charts.
   Vanilla JS. Zero build step. Boots entirely on seed data.
   ============================================================ */
(function () {
  "use strict";

  const D = window.AVB;
  const Scan = window.Discipline;

  /* ---------- tiny DOM helpers ---------- */
  function h(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (children != null) (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function titleCase(s) { return s.replace(/_/g, " "); }

  /* ---------- status helpers ---------- */
  const STATUS_WEIGHT = { done: 1, in_progress: 0.5, blocked: 0.15, not_started: 0 };
  function rollup(leaves) {
    if (!leaves.length) return 0;
    const sum = leaves.reduce(function (a, l) { return a + (STATUS_WEIGHT[l.status] || 0); }, 0);
    return Math.round((sum / leaves.length) * 100);
  }
  function rockLeaves(rock) { return rock.subgroups.reduce(function (a, g) { return a.concat(g.leaves); }, []); }
  function rockPct(rock) { return rollup(rockLeaves(rock)); }
  function countStatus(leaves, st) { return leaves.filter(function (l) { return l.status === st; }).length; }

  function chip(status, label) {
    return h("span", { class: "chip " + status },
      [h("span", { class: "d" }), document.createTextNode(label || titleCase(status))]);
  }

  /* ---------- scan badge ---------- */
  function scanBadge(text) {
    const r = Scan.scanCopy(text);
    if (r.clean) {
      return h("span", { class: "scan clean" }, [
        h("span", { class: "glyph" }, "✓"),
        document.createTextNode("scan clean"),
      ]);
    }
    const tip = h("span", { class: "tip" });
    tip.appendChild(h("div", { html: "<b>" + r.violations.length + " violation" + (r.violations.length > 1 ? "s" : "") + "</b>" }));
    const ul = h("ul");
    r.violations.forEach(function (v) { ul.appendChild(h("li", null, v.message)); });
    tip.appendChild(ul);
    return h("span", { class: "scan dirty" }, [
      h("span", { class: "glyph" }, "✕"),
      document.createTextNode(r.violations.length + " flag" + (r.violations.length > 1 ? "s" : "")),
      tip,
    ]);
  }

  /* ---------- view head ---------- */
  function head(label, title, lede) {
    return h("div", { class: "view-head" }, [
      h("div", { class: "mono" }, "/ " + label),
      h("h1", null, title),
      lede ? h("p", { class: "lede" }, lede) : null,
    ]);
  }
  function sectionLabel(txt) { return h("div", { class: "section-label" }, [h("span", { class: "mono" }, "/ " + txt)]); }

  /* animate any .bar/.mini-bar/.actual widths after mount */
  function animateBars(root) {
    requestAnimationFrame(function () {
      root.querySelectorAll("[data-w]").forEach(function (el) { el.style.width = el.getAttribute("data-w") + "%"; });
    });
  }

  /* ============================================================
     VIEW: OVERVIEW
     ============================================================ */
  function viewOverview() {
    const v = h("div", { class: "view" });
    v.appendChild(head("OVERVIEW", "Quarter at a glance",
      "The quarter's Rocks, the live test, and the most exposed open items. Everything routes back to: volleyball only. That is the whole business."));

    // Rock progress cards
    v.appendChild(sectionLabel("THE ROCKS"));
    const rg = h("div", { class: "grid g4" });
    D.rocks.forEach(function (r) {
      const leaves = rockLeaves(r);
      const pct = rockPct(r);
      rg.appendChild(h("div", { class: "rock-card", onclick: function () { location.hash = "#/rocks"; }, style: "cursor:pointer" }, [
        h("div", { class: "mono", style: "color:var(--red)" }, r.num),
        h("h3", null, r.title),
        h("div", { class: "owner" }, "Owner: " + (r.owner || "team")),
        h("div", { class: "bar" + (pct === 100 ? " done" : "") }, [h("span", { "data-w": pct })]),
        h("div", { class: "pct-row" }, [
          h("span", { class: "pct" }, pct + "%"),
          h("span", { class: "ratio" }, countStatus(leaves, "done") + "/" + leaves.length + " done"),
        ]),
      ]));
    });
    v.appendChild(rg);

    // This week focus
    v.appendChild(sectionLabel("THIS WEEK"));
    const focus = h("div", { class: "focus-strip" }, [
      focusItem("SHIP", "PDP sublimation module goes first. UA page follows the proven adidas template.", "Jerico"),
      focusItem("UNBLOCK", "Brett confirms turnaround language and quote routing CTA. Two leaves blocked on it.", "Brett"),
      focusItem("SIGN OFF", '"Where average isn\'t good enough." waits on Corey before it ships in copy.', "Corey"),
      focusItem("PULL", "Meta and Google spend pulls in progress. Klaviyo and Attentive next.", "Richard"),
    ]);
    v.appendChild(focus);

    // Active promo callout
    v.appendChild(sectionLabel("LIVE TEST"));
    const june = D.promos.find(function (p) { return p.status === "active"; });
    v.appendChild(h("div", { class: "panel ink" }, [
      h("div", { style: "display:flex;align-items:center;gap:14px;flex-wrap:wrap" }, [
        chip("active", "Active"),
        h("strong", { style: "font-size:18px" }, june.name),
      ]),
      h("p", { style: "margin-top:12px;color:var(--muted-ink);max-width:70ch" },
        "Tiered retail shipping with a held team floor. Teams ceiling is 20% off plus free shipping. Hold that line. Equipment excluded."),
      h("div", { style: "margin-top:16px" }, [
        h("a", { href: "#/promos", class: "fbtn on", style: "display:inline-block;text-decoration:none" }, "Open the matrix"),
      ]),
    ]));

    // Alerts: most exposed open items first
    v.appendChild(sectionLabel("ALERTS"));
    const alerts = h("div");
    alerts.appendChild(alertRow("hot", "BLOCKED", "Quote routing CTA + turnaround language",
      "Two Sublimation leaves blocked pending Brett. Quote / lead flow integration cannot ship until resolved."));
    alerts.appendChild(alertRow("hot", "TAKEDOWN", "VIP75 clearance is ended",
      "Confirm VIP75 is deactivated in Shopify and any link-in-bio is repointed."));
    const flagged = D.campaigns.teams.emails.filter(function (e) { return e.status === "placeholder_flagged"; });
    alerts.appendChild(alertRow("warn", "PLACEHOLDER", flagged.length + " teams emails flagged",
      "Real customer quotes, founder name substitution, and longevity-claim verification needed before go-live."));
    alerts.appendChild(alertRow("warn", "SIGN-OFF", "Corey on locked phrase",
      '"Where average isn\'t good enough." is a candidate locked phrase, not yet cleared for copy.'));
    v.appendChild(alerts);

    // Live discipline scanner playground
    v.appendChild(sectionLabel("DISCIPLINE CHECK"));
    v.appendChild(scannerPlayground());

    animateBars(v);
    return v;
  }

  function focusItem(label, text, owner) {
    return h("div", { class: "focus-item" }, [
      h("div", { class: "mono" }, "/ " + label),
      h("p", null, text),
      owner ? h("div", { class: "own" }, owner) : null,
    ]);
  }
  function alertRow(kind, mark, title, body) {
    return h("div", { class: "alert " + kind }, [
      h("span", { class: "a-mark" }, mark),
      h("div", { class: "a-body" }, [h("strong", null, title), h("span", null, body)]),
    ]);
  }
  function scannerPlayground() {
    const box = h("div", { class: "panel scanner-box" });
    const out = h("div", { class: "scanner-out" });
    const ta = h("textarea", {
      placeholder: "Paste a subject line or any customer-facing copy. The scanner flags em dashes, banned words, hard year references, and quote promises.",
    });
    function run() {
      out.innerHTML = "";
      out.appendChild(scanBadge(ta.value));
      const r = Scan.scanCopy(ta.value);
      if (!r.clean) {
        const ul = h("ul", { class: "bullets", style: "margin-top:14px" });
        r.violations.forEach(function (vi) { ul.appendChild(h("li", null, vi.message)); });
        out.appendChild(ul);
      }
    }
    ta.addEventListener("input", run);
    ta.value = "If you are serious about your program, we are your partner.";
    box.appendChild(h("p", { class: "mono", style: "margin-bottom:12px" }, "/ LIVE SCAN"));
    box.appendChild(ta);
    box.appendChild(out);
    run();
    return box;
  }

  /* ============================================================
     VIEW: ROCKS
     ============================================================ */
  function viewRocks() {
    const v = h("div", { class: "view" });
    v.appendChild(head("ROCKS", "Q2 Rocks",
      "Live-sync from Asana project " + D.meta.asanaProject + " when the connector is configured. Seed data otherwise. Click a Rock to expand its tree."));

    // summary tiles
    const all = D.rocks.reduce(function (a, r) { return a.concat(rockLeaves(r)); }, []);
    const tiles = h("div", { class: "grid g4", style: "margin-bottom:30px" }, [
      tile("dark", "OVERALL", rollup(all) + "%", all.length + " leaves tracked"),
      tile("light", "DONE", countStatus(all, "done"), "leaves complete"),
      tile("light", "IN PROGRESS", countStatus(all, "in_progress"), "moving now"),
      tile("light", "BLOCKED", countStatus(all, "blocked"), "need a decision"),
    ]);
    v.appendChild(tiles);

    D.rocks.forEach(function (r) {
      const leaves = rockLeaves(r);
      const pct = rockPct(r);
      const block = h("div", { class: "rock-block" });
      const body = h("div", { class: "rb-body" });

      r.subgroups.forEach(function (g) {
        const sg = h("div", { class: "subgroup" });
        sg.appendChild(h("h4", null, [
          document.createTextNode(g.name),
          h("span", { class: "sg-pct" }, "  " + rollup(g.leaves) + "%"),
        ]));
        g.leaves.forEach(function (lf) {
          sg.appendChild(h("div", { class: "leaf" }, [
            chip(lf.status),
            h("span", { class: "lf-name" }, lf.name),
            lf.note ? h("span", { class: "lf-note" }, lf.note) : null,
            lf.owner ? h("span", { class: "lf-owner" }, lf.owner) : null,
          ]));
        });
        body.appendChild(sg);
      });

      if (r.live) {
        body.appendChild(h("div", { class: "note-line hot", style: "margin-top:16px" }, [
          document.createTextNode("Live page: "),
          h("a", { href: r.live, target: "_blank", class: "accent", style: "text-decoration:underline" }, r.live),
        ]));
      }

      const headRow = h("div", { class: "rb-head", onclick: function () { block.classList.toggle("open"); } }, [
        h("span", { class: "caret" }, "›"),
        h("span", { class: "rb-num" }, r.num),
        h("span", { class: "rb-title" }, r.title),
        h("span", { class: "lf-owner" }, r.owner || "team"),
        h("span", { class: "mini-bar" }, [h("span", { "data-w": pct })]),
        h("span", { class: "rb-pct" }, pct + "%"),
      ]);
      block.appendChild(headRow);
      block.appendChild(body);
      v.appendChild(block);
    });

    // first rock open by default
    const first = v.querySelector(".rock-block");
    if (first) first.classList.add("open");

    animateBars(v);
    return v;
  }

  function tile(kind, label, num, sub) {
    return h("div", { class: "tile" + (kind === "light" ? " light" : "") }, [
      h("div", { class: "mono" }, "/ " + label),
      h("div", { class: "num" }, String(num)),
      h("div", { class: "sub" }, sub),
    ]);
  }

  /* ============================================================
     VIEW: CAMPAIGNS
     ============================================================ */
  let campaignFilter = "all";
  function viewCampaigns() {
    const v = h("div", { class: "view" });
    v.appendChild(head("CAMPAIGNS", "Email and content pipeline",
      "Teams 10-email A/B arc and the parallel Retail track. Every subject line runs through the discipline scanner. Klaviyo metrics wire to the connector with a seed fallback."));

    // Klaviyo KPI strip
    v.appendChild(sectionLabel("KLAVIYO METRICS"));
    const k = D.klaviyo;
    const kp = h("div", { class: "grid g4" }, [
      kpiTile("OPEN RATE", k.openRate + "%", k.openDelta),
      kpiTile("CLICK RATE", k.clickRate + "%", k.clickDelta),
      kpiTile("REVENUE", money(k.revenue), k.revenueDelta, true),
      kpiTile("RECIPIENTS", k.recipients.toLocaleString("en-US"), null),
    ]);
    v.appendChild(kp);
    v.appendChild(h("div", { class: "note-line" }, "Source: " + k.source + ". Set KLAVIYO_API_KEY to pull live. Revenue is a placeholder figure."));

    // Teams arc
    v.appendChild(sectionLabel("Q2 TEAMS REPOSITIONING"));
    v.appendChild(h("p", { class: "lede", style: "margin-top:-6px;margin-bottom:18px" }, D.campaigns.teams.meta + " Platform: " + D.campaigns.teams.platform + "."));

    // filter bar
    const counts = D.campaigns.teams.emails;
    const fb = h("div", { class: "filterbar" });
    fb.appendChild(h("span", { class: "fb-label" }, "Filter"));
    [["all", "All"], ["sent", "Sent"], ["scheduled", "Scheduled"], ["built", "Built"], ["placeholder_flagged", "Flagged"]].forEach(function (f) {
      const n = f[0] === "all" ? counts.length : counts.filter(function (e) { return e.status === f[0]; }).length;
      const b = h("button", { class: "fbtn" + (campaignFilter === f[0] ? " on" : "") }, f[1] + " (" + n + ")");
      b.addEventListener("click", function () { campaignFilter = f[0]; renderEmails(); fb.querySelectorAll(".fbtn").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); });
      fb.appendChild(b);
    });
    v.appendChild(fb);

    const list = h("div");
    v.appendChild(list);
    function renderEmails() {
      list.innerHTML = "";
      const rows = D.campaigns.teams.emails.filter(function (e) { return campaignFilter === "all" || e.status === campaignFilter; });
      if (!rows.length) { list.appendChild(h("div", { class: "note-line" }, "No emails in this state.")); return; }
      rows.forEach(function (e) {
        list.appendChild(emailRow(e));
      });
    }
    renderEmails();

    // Retail track
    v.appendChild(sectionLabel("RETAIL EMAIL TRACK"));
    v.appendChild(h("p", { class: "lede", style: "margin-top:-6px;margin-bottom:18px" }, D.campaigns.retail.meta + " Platform: " + D.campaigns.retail.platform + "."));
    const rlist = h("div");
    D.campaigns.retail.emails.forEach(function (e) { rlist.appendChild(emailRow(e)); });
    v.appendChild(rlist);

    return v;
  }
  function kpiTile(label, num, delta, isRev) {
    const children = [h("div", { class: "mono" }, "/ " + label), h("div", { class: "kpi-num" }, num)];
    if (delta != null) {
      children.push(h("div", { class: "kpi-delta " + (delta >= 0 ? "up" : "down") },
        (delta >= 0 ? "▲ +" : "▼ ") + Math.abs(delta) + (isRev ? "%" : " pts") + " vs last send"));
    } else {
      children.push(h("div", { class: "kpi-delta", style: "color:var(--muted)" }, "warm list"));
    }
    return h("div", { class: "tile light" }, [h("div", { class: "kpi" }, children)]);
  }
  function emailRow(e) {
    const subj = e.a;
    const right = h("div", { class: "right" }, [chip(e.status, titleCase(e.status)), scanBadge(subj)]);
    const mid = h("div", null, [
      h("div", { class: "subj" }, subj),
      e.b ? h("div", { class: "variant" }, "B: " + e.b) : (e.note ? h("div", { class: "variant" }, e.note) : null),
      e.flag ? h("div", { class: "flag" }, "⚠ " + e.flag) : null,
    ]);
    return h("div", { class: "email-row" }, [h("span", { class: "eno" }, String(e.no)), mid, right]);
  }

  /* ============================================================
     VIEW: PROMOS
     ============================================================ */
  function viewPromos() {
    const v = h("div", { class: "view" });
    v.appendChild(head("PROMOS", "Active and ended",
      "Active vs ended promotions in one place. We are not the cheapest. The discount line is held with intent."));

    const active = D.promos.filter(function (p) { return p.status === "active"; });
    const ended = D.promos.filter(function (p) { return p.status === "ended"; });

    v.appendChild(sectionLabel("ACTIVE"));
    active.forEach(function (p) {
      const card = h("div", { class: "panel" });
      card.appendChild(h("div", { style: "display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px" }, [
        chip("active", "Active"),
        h("strong", { style: "font-size:20px" }, p.name),
      ]));
      card.appendChild(h("div", { class: "mono", style: "margin-bottom:18px" }, p.scope + "  /  " + p.start + " → " + p.end));

      // Retail matrix
      if (p.retailTiers) {
        card.appendChild(h("div", { class: "mono", style: "margin-bottom:8px;color:var(--cream-ink)" }, "RETAIL ONLINE TIERS"));
        const t = h("table", { class: "matrix" });
        t.appendChild(h("thead", null, h("tr", null, [th("Order threshold"), th("Shipping"), th("Discount")])));
        const tb = h("tbody");
        p.retailTiers.forEach(function (r) {
          tb.appendChild(h("tr", null, [
            h("td", { class: "strong" }, r.threshold),
            h("td", null, r.ship),
            h("td", { class: "num-cell" }, r.discount),
          ]));
        });
        t.appendChild(tb);
        card.appendChild(t);
      }

      // Teams floor/ceiling
      if (p.teams) {
        card.appendChild(h("div", { class: "mono", style: "margin:22px 0 8px;color:var(--cream-ink)" }, "TEAMS / SMALL CLUBS"));
        const t2 = h("table", { class: "matrix" });
        t2.appendChild(h("thead", null, h("tr", null, [th("Floor"), th("Up to"), th("Ceiling")])));
        t2.appendChild(h("tbody", null, h("tr", null, [
          h("td", { class: "strong" }, p.teams.floor),
          h("td", { class: "strong" }, p.teams.upTo),
          h("td", { class: "ceiling" }, p.teams.ceiling),
        ])));
        card.appendChild(t2);
      }

      // rules
      if (p.rules) {
        const ul = h("ul", { class: "bullets", style: "margin-top:18px" });
        p.rules.forEach(function (rule) {
          if (rule.indexOf("PDP copy add") !== -1) {
            ul.appendChild(h("li", null, [document.createTextNode(rule + "  "), scanBadge('Buying for club? Contact us for special pricing.')]));
          } else {
            ul.appendChild(h("li", null, rule));
          }
        });
        card.appendChild(ul);
      }
      if (p.note) card.appendChild(h("div", { class: "note-line" }, "Note: " + p.note));
      v.appendChild(card);
    });

    v.appendChild(sectionLabel("ENDED / ARCHIVED"));
    ended.forEach(function (p) {
      v.appendChild(h("div", { class: "panel cream", style: "opacity:.92" }, [
        h("div", { style: "display:flex;align-items:center;gap:12px;flex-wrap:wrap" }, [
          chip("ended", "Ended"),
          h("strong", { style: "font-size:18px;color:var(--muted)" }, p.name),
          p.code ? h("span", { class: "tag" }, "code " + p.code) : null,
        ]),
        h("p", { style: "margin-top:10px;color:var(--muted)" }, p.terms),
        h("div", { class: "note-line hot" }, "⚠ " + p.note),
      ]));
    });

    return v;
  }
  function th(t) { return h("th", null, t); }

  /* ============================================================
     VIEW: BUDGET
     ============================================================ */
  function viewBudget() {
    const v = h("div", { class: "view" });
    v.appendChild(head("BUDGET", "Marketing P&L",
      "Spend by channel and category. Target mix vs actual, with the Test and Innovation carve-out tracked. Every figure here is a placeholder until the real pulls land."));

    const b = D.budget;
    const byCat = { Retail: 0, Team: 0, Shared: 0 };
    b.channels.forEach(function (c) { byCat[c.category] += c.monthly; });
    const total = byCat.Retail + byCat.Team + byCat.Shared;

    // tiles
    v.appendChild(h("div", { class: "grid g4", style: "margin-bottom:8px" }, [
      tilePlaceholder("dark", "MONTHLY TOTAL", money(total), "across all channels"),
      tilePlaceholder("light", "TEAM", money(byCat.Team), Math.round(byCat.Team / total * 100) + "% of spend"),
      tilePlaceholder("light", "RETAIL", money(byCat.Retail), Math.round(byCat.Retail / total * 100) + "% of spend"),
      tilePlaceholder("light", "SHARED", money(byCat.Shared), Math.round(byCat.Shared / total * 100) + "% of spend"),
    ]));
    v.appendChild(h("div", { class: "note-line" }, [
      h("span", { class: "placeholder-tag" }, "PLACEHOLDER"),
      document.createTextNode("  Figures are seeded. Swap them for Meta, Google, Klaviyo, Attentive, partnerships, tools, and labor pulls."),
    ]));

    // Stacked bar by source
    v.appendChild(sectionLabel("SPEND BY CHANNEL"));
    v.appendChild(stackedBySource(b));

    // Target mix vs actual
    v.appendChild(sectionLabel("TARGET MIX VS ACTUAL"));
    const mixWrap = h("div", { class: "panel" });
    [["Team", byCat.Team], ["Retail", byCat.Retail], ["Test", 0]].forEach(function (row) {
      const name = row[0];
      const actualPct = name === "Test" ? b.testCarveout.currentPct : Math.round(row[1] / total * 100);
      const target = b.targetMix[name];
      mixWrap.appendChild(h("div", { class: "mix-row" }, [
        h("div", { class: "mix-head" }, [
          h("span", { class: "strong", style: "font-weight:700" }, name),
          h("span", { class: "mono" }, "actual " + actualPct + "%  /  target " + target + "%"),
        ]),
        h("div", { class: "mix-track" }, [
          h("span", { class: "actual", "data-w": actualPct }),
          h("span", { class: "target", style: "left:0", "data-target": target }),
        ]),
      ]));
    });
    v.appendChild(mixWrap);

    // Test carve-out tracker
    v.appendChild(sectionLabel("TEST / INNOVATION CARVE-OUT"));
    const tc = b.testCarveout;
    v.appendChild(h("div", { class: "panel ink" }, [
      h("div", { class: "mono" }, "/ 5-10% TARGET"),
      h("div", { style: "display:flex;align-items:baseline;gap:14px;margin:12px 0" }, [
        h("span", { style: "font-size:42px;font-weight:700" }, tc.currentPct + "%"),
        h("span", { style: "color:var(--muted-ink)" }, "current  /  target " + tc.targetPct + "%"),
      ]),
      h("div", { class: "bar", style: "background:var(--line-ink)" }, [h("span", { "data-w": Math.round(tc.currentPct / tc.targetPct * 100) })]),
      h("p", { style: "margin-top:14px;color:var(--muted-ink)" }, "Carve-out is below the floor. Reallocation walkthrough with Andrew sets the target mix and funds the test line."),
    ]));

    animateBars(v);
    // set target marker positions
    requestAnimationFrame(function () {
      v.querySelectorAll("[data-target]").forEach(function (el) { el.style.left = el.getAttribute("data-target") + "%"; });
    });
    return v;
  }
  function tilePlaceholder(kind, label, num, sub) {
    const t = tile(kind, label, num, sub);
    t.querySelector(".mono").appendChild(document.createTextNode(""));
    return t;
  }
  function stackedBySource(b) {
    const sources = {};
    b.channels.forEach(function (c) {
      if (!sources[c.source]) sources[c.source] = { Retail: 0, Team: 0, Shared: 0, total: 0 };
      sources[c.source][c.category] += c.monthly;
      sources[c.source].total += c.monthly;
    });
    const names = Object.keys(sources).sort(function (a, c) { return sources[c].total - sources[a].total; });
    const max = Math.max.apply(null, names.map(function (n) { return sources[n].total; }));
    const catColor = { Team: "var(--red)", Retail: "var(--ink)", Shared: "var(--cream-deep)" };

    const W = 760, rowH = 38, gap = 14, padL = 110, padR = 70;
    const Hsvg = names.length * (rowH + gap);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + Hsvg);
    function rect(x, y, w, hh, fill) {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", Math.max(0, w)); r.setAttribute("height", hh);
      r.setAttribute("fill", fill); r.setAttribute("class", "bar-seg");
      const tt = document.createElementNS("http://www.w3.org/2000/svg", "title");
      r.appendChild(tt); r._tt = tt; return r;
    }
    function text(x, y, s, cls) {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", x); t.setAttribute("y", y); t.textContent = s;
      t.setAttribute("font-family", "var(--mono)"); t.setAttribute("font-size", cls === "lab" ? "11" : "12");
      t.setAttribute("fill", cls === "lab" ? "#6f6759" : "#1a1a1a");
      if (cls === "val") { t.setAttribute("text-anchor", "start"); t.setAttribute("font-weight", "700"); }
      return t;
    }
    const avail = W - padL - padR;
    names.forEach(function (n, i) {
      const y = i * (rowH + gap);
      svg.appendChild(text(0, y + rowH / 2 + 4, n, "lab"));
      let x = padL;
      ["Team", "Retail", "Shared"].forEach(function (cat) {
        const val = sources[n][cat];
        if (val <= 0) return;
        const w = (val / max) * avail;
        const r = rect(x, y, w, rowH, catColor[cat]);
        r._tt.textContent = n + " / " + cat + ": " + money(val);
        svg.appendChild(r);
        x += w;
      });
      svg.appendChild(text(x + 8, y + rowH / 2 + 4, money(sources[n].total), "val"));
    });

    const wrap = h("div", { class: "chart-wrap" });
    wrap.appendChild(svg);
    wrap.appendChild(h("div", { class: "legend" }, [
      legendItem("var(--red)", "Team"),
      legendItem("var(--ink)", "Retail"),
      legendItem("var(--cream-deep)", "Shared"),
    ]));
    return wrap;
  }
  function legendItem(color, label) {
    return h("span", null, [h("i", { style: "background:" + color }), document.createTextNode(label)]);
  }

  /* ============================================================
     VIEW: AUTOMATION
     ============================================================ */
  function viewAutomation() {
    const v = h("div", { class: "view" });
    const a = D.automation;
    v.appendChild(head("AUTOMATION", "n8n workflow health",
      "What is live, what is planned, and the idea backlog. Base: " + a.base + ". Set N8N_API_KEY to pull run status."));

    v.appendChild(sectionLabel("LIVE"));
    a.live.forEach(function (w) {
      const card = h("div", { class: "auto-card live" });
      card.appendChild(h("div", { style: "display:flex;align-items:center;gap:12px;margin-bottom:6px" }, [chip("live", "Live"), h("h3", null, w.name)]));
      card.appendChild(h("div", { class: "meta" }, w.desc));
      const spec = h("div", { class: "spec" });
      w.spec.forEach(function (s) { spec.appendChild(h("div", null, "• " + s)); });
      card.appendChild(spec);
      const tags = h("div", { class: "tags" });
      w.tags.forEach(function (t) { tags.appendChild(h("span", { class: "tag" }, t)); });
      card.appendChild(tags);
      v.appendChild(card);
    });

    v.appendChild(sectionLabel("VENDOR EXPANSION ROADMAP"));
    v.appendChild(h("p", { class: "lede", style: "margin-top:-6px;margin-bottom:16px" }, a.vendorRoadmap.note));
    const vg = h("div", { class: "grid g4" });
    a.vendorRoadmap.vendors.forEach(function (vn) {
      vg.appendChild(h("div", { class: "auto-card", style: "display:flex;align-items:center;justify-content:space-between" }, [
        h("strong", null, vn.name), chip(vn.status, "Planned"),
      ]));
    });
    v.appendChild(vg);

    v.appendChild(sectionLabel("IDEA BACKLOG"));
    const bg = h("div", { class: "grid g3" });
    a.backlog.forEach(function (idea) {
      bg.appendChild(h("div", { class: "auto-card", style: "display:flex;align-items:flex-start;justify-content:space-between;gap:12px" }, [
        h("span", { style: "font-size:14px" }, idea.name), chip("idea", "Idea"),
      ]));
    });
    v.appendChild(bg);
    return v;
  }

  /* ============================================================
     VIEW: CONTENT
     ============================================================ */
  function viewContent() {
    const v = h("div", { class: "view" });
    v.appendChild(head("CONTENT", "Team-side buildout",
      "Event coverage, knowledge content, spotlight series, and the UGC partnership. The brand shows up in real comments, not canned replies."));

    v.appendChild(sectionLabel("BUILDOUT PLAN"));
    const ul = h("ul", { class: "bullets" });
    D.content.buildout.forEach(function (item) { ul.appendChild(h("li", null, item)); });
    v.appendChild(h("div", { class: "panel" }, [ul]));

    v.appendChild(sectionLabel("UGC PARTNERSHIP"));
    D.partnerships.forEach(function (p) {
      v.appendChild(h("div", { class: "spotlight" }, [
        h("div", { style: "display:flex;align-items:center;gap:12px;flex-wrap:wrap" }, [
          chip(p.status, titleCase(p.status)),
          h("span", { class: "name" }, p.name),
        ]),
        h("div", { class: "role" }, p.role),
        h("p", { style: "margin-top:12px;color:var(--muted)" }, p.note),
        h("div", { class: "note-line" }, "Source: " + p.source),
      ]));
    });

    v.appendChild(sectionLabel("SPOTLIGHT SERIES"));
    const sg = h("div", { class: "grid g3" });
    D.content.spotlightSeries.forEach(function (s) {
      sg.appendChild(h("div", { class: "auto-card" }, [h("p", { style: "font-size:14px" }, s)]));
    });
    v.appendChild(sg);

    v.appendChild(sectionLabel("VOICE"));
    const lock = h("div", { class: "panel cream" });
    D.meta.phrases.forEach(function (p) {
      lock.appendChild(h("div", { style: "display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px dotted var(--line)" }, [
        h("span", { class: "locked-quote" }, p),
        scanBadge(p),
      ]));
    });
    v.appendChild(lock);
    return v;
  }

  /* ============================================================
     ROUTER
     ============================================================ */
  const ROUTES = {
    "/overview": { label: "OVERVIEW", render: viewOverview },
    "/rocks": { label: "ROCKS", render: viewRocks },
    "/campaigns": { label: "CAMPAIGNS", render: viewCampaigns },
    "/promos": { label: "PROMOS", render: viewPromos },
    "/budget": { label: "BUDGET", render: viewBudget },
    "/automation": { label: "AUTOMATION", render: viewAutomation },
    "/content": { label: "CONTENT", render: viewContent },
  };

  function currentPath() {
    const hash = location.hash.replace(/^#/, "");
    return ROUTES[hash] ? hash : "/overview";
  }
  function render() {
    const path = currentPath();
    const main = document.getElementById("main");
    main.innerHTML = "";
    main.appendChild(ROUTES[path].render());
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + path);
    });
    document.querySelector(".nav").classList.remove("open");
    main.scrollTop = 0; window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", function () {
    buildNav();
    buildRail();
    render();
  });

  function buildNav() {
    const nav = document.querySelector(".nav");
    const navItems = [
      ["/overview", "OVERVIEW"], ["/rocks", "ROCKS"], ["/campaigns", "CAMPAIGNS"],
      ["/promos", "PROMOS"], ["/budget", "BUDGET"], ["/automation", "AUTOMATION"], ["/content", "CONTENT"],
    ];
    nav.appendChild(h("div", { class: "nav-group-label" }, [h("span", { class: "mono" }, "/ VIEWS")]));
    // badge counts for exposed items
    const flagged = D.campaigns.teams.emails.filter(function (e) { return e.status === "placeholder_flagged"; }).length;
    const blocked = D.rocks.reduce(function (a, r) { return a + countStatus(rockLeaves(r), "blocked"); }, 0);
    navItems.forEach(function (it) {
      const a = h("a", { href: "#" + it[0] }, [h("span", { class: "slash" }, "/"), document.createTextNode(it[1])]);
      if (it[0] === "/campaigns" && flagged) a.appendChild(h("span", { class: "badge" }, String(flagged)));
      if (it[0] === "/rocks" && blocked) a.appendChild(h("span", { class: "badge" }, String(blocked)));
      nav.appendChild(a);
    });
    nav.appendChild(h("div", { class: "nav-foot" }, [
      h("p", { class: "phrase" }, "Volleyball only. That is the whole business."),
    ]));
  }

  function buildRail() {
    const right = document.querySelector(".rail-right");
    const sync = document.getElementById("sync-time");
    function stamp() {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      sync.textContent = hh + ":" + mm + ":" + ss;
    }
    stamp();
    setInterval(stamp, 1000);
    document.querySelector(".rail-menu").addEventListener("click", function () {
      document.querySelector(".nav").classList.toggle("open");
    });
  }
})();
