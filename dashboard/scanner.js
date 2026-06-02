/* ============================================================
   DISCIPLINE SCANNER
   Brand requirement. scanCopy(text) flags:
     - em dashes
     - banned words
     - hard year references (4-digit, 2000-2099)
     - "24 hour" / "same day" near "quote"
   Returns { clean: boolean, violations: Violation[] }
   Violation = { type, term, message }
   ============================================================ */
window.Discipline = (function () {
  "use strict";

  const BANNED = [
    "solutions", "premium", "best in class", "passionate", "reach out",
    "excited to announce", "game changer", "next level", "world class",
    "leverage", "synergy", "ecosystem", "family", "bulk",
  ];

  function scanCopy(text) {
    const violations = [];
    if (text == null) return { clean: true, violations };
    const str = String(text);
    const lower = str.toLowerCase();

    // 1. Em dashes (also catch the en dash used as a dash)
    if (/[—]/.test(str)) {
      violations.push({ type: "em-dash", term: "—", message: "Em dash found. Use periods and colons only." });
    }

    // 2. Banned words (word-boundary aware where single words)
    BANNED.forEach(function (word) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = word.indexOf(" ") === -1
        ? new RegExp("\\b" + escaped + "\\b", "i")
        : new RegExp(escaped, "i");
      if (re.test(lower)) {
        violations.push({ type: "banned-word", term: word, message: 'Banned word: "' + word + '".' });
      }
    });

    // 3. Hard year reference (2000-2099)
    const years = str.match(/\b20\d{2}\b/g);
    if (years) {
      Array.from(new Set(years)).forEach(function (y) {
        violations.push({ type: "year", term: y, message: "Hard year reference: " + y + ". Use season-relative language." });
      });
    }

    // 4. Quote-promise: "24 hour" / "same day" near "quote"
    if (lower.indexOf("quote") !== -1) {
      if (/(24[\s-]?hour|same[\s-]?day)/.test(lower)) {
        violations.push({
          type: "quote-promise",
          term: "24 hour / same day + quote",
          message: "No 24-hour or same-day quote promises. Quote flow is consultative.",
        });
      }
    }

    return { clean: violations.length === 0, violations: violations };
  }

  return { scanCopy: scanCopy, BANNED: BANNED };
})();
