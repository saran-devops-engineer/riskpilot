(function () {
  "use strict";

  var MAX_RISK = 1000;
  var RISK_REWARD = 2;

  var stockInput = document.getElementById("stock");
  var entryInput = document.getElementById("entry");
  var stoplossInput = document.getElementById("stoploss");
  var errorEl = document.getElementById("input-error");
  var resetBtn = document.getElementById("reset-btn");

  var out = {
    qty: document.getElementById("out-qty"),
    qtySub: document.getElementById("out-qty-sub"),
    target: document.getElementById("out-target"),
    targetSub: document.getElementById("out-target-sub"),
    entry: document.getElementById("out-entry"),
    sl: document.getElementById("out-sl"),
    risk: document.getElementById("out-risk"),
    totalRisk: document.getElementById("out-totalrisk"),
    capital: document.getElementById("out-capital"),
    points: document.getElementById("out-points"),
    target2: document.getElementById("out-target2"),
    profit: document.getElementById("out-profit"),
    ratio: document.getElementById("out-ratio"),
    maxRisk: document.getElementById("out-maxrisk")
  };

  var shareBtn = document.getElementById("share-btn");
  var resultsTitle = document.getElementById("results-title");
  var zeroQtyMsg = document.getElementById("zero-qty-msg");

  function formatINR(value) {
    return "₹" + value.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function parseValue(raw) {
    var cleaned = String(raw).trim().replace(/[₹,\s]/g, "");
    if (cleaned === "") return NaN;
    if (!/^\d*\.?\d*$/.test(cleaned)) return NaN;
    var n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function setError(message) {
    errorEl.textContent = message || "";
    errorEl.hidden = !message;
    entryInput.classList.toggle("invalid", !!message);
    stoplossInput.classList.toggle("invalid", !!message);
  }

  function clearResults() {
    var keys = ["qty", "target", "entry", "sl", "risk", "totalRisk", "capital", "points", "target2", "profit", "ratio"];
    keys.forEach(function (k) {
      out[k].textContent = "—";
    });
    out.qtySub.textContent = "shares";
    out.targetSub.textContent = "1:2 reward";
    out.maxRisk.textContent = formatINR(MAX_RISK);
    zeroQtyMsg.hidden = true;
  }

  function calculate() {
    var stockName = (stockInput.value || "").trim();
    if (resultsTitle) {
      resultsTitle.textContent = stockName ? "Trade Summary — " + stockName : "Trade Summary";
    }

    var entryRaw = entryInput.value;
    var slRaw = stoplossInput.value;

    if (String(entryRaw).trim() === "" && String(slRaw).trim() === "") {
      setError("");
      clearResults();
      return;
    }

    var entry = parseValue(entryRaw);
    var sl = parseValue(slRaw);

    if (String(entryRaw).trim() === "" || String(slRaw).trim() === "") {
      setError("");
      clearResults();
      return;
    }

    if (!Number.isFinite(entry) || !Number.isFinite(sl)) {
      setError("Enter valid positive numbers in both fields.");
      clearResults();
      return;
    }

    if (entry <= 0 || sl <= 0) {
      setError("Both entry and stop-loss prices must be positive numbers.");
      clearResults();
      return;
    }

    var riskPerShare = entry - sl;

    if (riskPerShare <= 0) {
      setError("Entry Price must be greater than Stop-Loss Price for a long trade.");
      clearResults();
      return;
    }

    setError("");

    var qty = Math.floor(MAX_RISK / riskPerShare);
    var targetPoints = riskPerShare * RISK_REWARD;
    var targetPrice = entry + targetPoints;
    var totalRisk = riskPerShare * qty;
    var potentialProfit = (targetPrice - entry) * qty;
    var capitalRequired = entry * qty;

    out.entry.textContent = formatINR(entry);
    out.sl.textContent = formatINR(sl);
    out.risk.textContent = formatINR(riskPerShare);
    out.maxRisk.textContent = formatINR(MAX_RISK);
    out.totalRisk.textContent = formatINR(totalRisk);
    out.capital.textContent = formatINR(capitalRequired);
    out.points.textContent = formatINR(targetPoints);
    out.target2.textContent = formatINR(targetPrice);
    out.profit.textContent = formatINR(potentialProfit);
    out.ratio.textContent = "1:" + RISK_REWARD;

    out.qty.textContent = qty.toLocaleString("en-IN");
    out.qtySub.textContent = qty === 1 ? "share" : "shares";
    out.target.textContent = formatINR(targetPrice);
    out.targetSub.textContent = formatINR(targetPoints) + " above entry";

    zeroQtyMsg.hidden = qty !== 0;
  }

  entryInput.addEventListener("input", calculate);
  stoplossInput.addEventListener("input", calculate);
  stockInput.addEventListener("input", calculate);

  resetBtn.addEventListener("click", function () {
    stockInput.value = "";
    entryInput.value = "";
    stoplossInput.value = "";
    setError("");
    clearResults();
    if (resultsTitle) resultsTitle.textContent = "Trade Summary";
    entryInput.focus();
  });

  shareBtn.addEventListener("click", function () {
    var stockName = (stockInput.value || "").trim() || "Stock";
    var entryVal = entryInput.value;
    var slVal = stoplossInput.value;

    if (!entryVal || !slVal) {
      setError("Enter entry and stop-loss to share.");
      return;
    }

    var entry = parseValue(entryVal);
    var sl = parseValue(slVal);
    if (!Number.isFinite(entry) || !Number.isFinite(sl) || entry <= sl) {
      setError("Please enter valid entry > stop-loss first.");
      return;
    }

    var riskPerShare = entry - sl;
    var qty = Math.max(0, Math.floor(MAX_RISK / riskPerShare));
    var targetPoints = riskPerShare * RISK_REWARD;
    var targetPrice = entry + targetPoints;
    var totalRisk = riskPerShare * qty;
    var potentialProfit = (targetPrice - entry) * qty;
    var capital = entry * qty;

    var text =
      "RiskPilot — " + stockName + "\n" +
      "Entry: " + formatINR(entry) + " | SL: " + formatINR(sl) + "\n" +
      "Risk/Share: " + formatINR(riskPerShare) + " | Risk-Reward: 1:" + RISK_REWARD + "\n" +
      "Qty: " + qty + " shares | Capital Required: " + formatINR(capital) + "\n" +
      "Target: " + formatINR(targetPrice) + " (" + formatINR(targetPoints) + " pts) | Planned Risk: " + formatINR(totalRisk) + "\n" +
      "Potential Profit: " + formatINR(potentialProfit) + "\n\n" +
      "Tool only — no brokerage, taxes, slippage included.";

    if (navigator.share) {
      navigator.share({ title: "RiskPilot — " + stockName, text: text }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        // brief visual feedback
        var old = shareBtn.textContent;
        shareBtn.textContent = "Copied!";
        setTimeout(function () { shareBtn.textContent = old; }, 1200);
      }).catch(function () {
        prompt("Copy this:", text);
      });
    } else {
      prompt("Copy this:", text);
    }
  });

  clearResults();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* service worker registration failed — app still works */
      });
    });
  }
})();
