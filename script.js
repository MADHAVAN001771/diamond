const rowsDiv = document.getElementById("rows");
const CENTS = Array.from({ length: 20 }, (_, i) => i + 1);
const today = new Date().toISOString().split("T")[0];

// Load stock & sold
let stock = JSON.parse(localStorage.getItem("stock")) || {};
let soldHistory = JSON.parse(localStorage.getItem("sold-history")) || {};
soldHistory[today] ??= {};

// Totals elements
const totalOpenNoEl = document.getElementById("total-open-no");
const totalOpenWtEl = document.getElementById("total-open-wt");
const totalSoldNoEl = document.getElementById("total-sold-no");
const totalSoldWtEl = document.getElementById("total-sold-wt");
const totalRemainNoEl = document.getElementById("total-remain-no");
const totalRemainWtEl = document.getElementById("total-remain-wt");

// Create rows
CENTS.forEach(cent => {
  stock[cent] ??= { products: 0, weight: 0 };

  const row = document.createElement("div");
  row.className = "row";

  row.innerHTML = `
    <div>${cent} Cent</div>

    <div class="small-box">
      <input type="number" id="open-no-${cent}" placeholder="No." value="${stock[cent].products}">
      <input type="number" id="open-wt-${cent}" placeholder="Wt." value="${stock[cent].weight}">
    </div>

    <div class="small-box">
      <input type="number" id="sold-no-${cent}" placeholder="No." value="${soldHistory[today][cent]?.products || 0}">
      <input type="number" id="sold-wt-${cent}" placeholder="Wt." value="${soldHistory[today][cent]?.weight || 0}">
    </div>

    <div class="small-box">
      <input type="number" id="remain-no-${cent}" placeholder="No." readonly>
      <input type="number" id="remain-wt-${cent}" placeholder="Wt." readonly>
    </div>
  `;

  rowsDiv.appendChild(row);

  // Event listeners
  const openNo = document.getElementById(`open-no-${cent}`);
  const openWt = document.getElementById(`open-wt-${cent}`);
  const soldNo = document.getElementById(`sold-no-${cent}`);
  const soldWt = document.getElementById(`sold-wt-${cent}`);

  openNo.addEventListener("input", () => validateAndSave(cent, "openNo"));
  openWt.addEventListener("input", () => validateAndSave(cent, "openWt"));
  soldNo.addEventListener("input", () => validateAndSave(cent, "soldNo"));
  soldWt.addEventListener("input", () => validateAndSave(cent, "soldWt"));

  updateRemaining(cent);
});

// Validate input: if empty or NaN, set 0
function validateAndSave(cent, type) {
  let el, value;
  if (type === "openNo") el = document.getElementById(`open-no-${cent}`);
  if (type === "openWt") el = document.getElementById(`open-wt-${cent}`);
  if (type === "soldNo") el = document.getElementById(`sold-no-${cent}`);
  if (type === "soldWt") el = document.getElementById(`sold-wt-${cent}`);

  value = Number(el.value);
  if (isNaN(value) || value < 0) value = 0;
  el.value = value;

  if (type.startsWith("open")) saveOpening(cent);
  else updateSold(cent);
}

function saveOpening(cent) {
  stock[cent] = {
    products: Number(document.getElementById(`open-no-${cent}`).value),
    weight: Number(document.getElementById(`open-wt-${cent}`).value)
  };
  localStorage.setItem("stock", JSON.stringify(stock));
  updateRemaining(cent);
}

function updateSold(cent) {
  soldHistory[today][cent] = {
    products: Number(document.getElementById(`sold-no-${cent}`).value),
    weight: Number(document.getElementById(`sold-wt-${cent}`).value)
  };
  localStorage.setItem("sold-history", JSON.stringify(soldHistory));
  updateRemaining(cent);
}

function updateRemaining(cent) {
  const opening = stock[cent];
  const sold = soldHistory[today][cent] || { products: 0, weight: 0 };

  const remainNo = opening.products - sold.products >= 0 ? opening.products - sold.products : 0;
  const remainWt = opening.weight - sold.weight >= 0 ? opening.weight - sold.weight : 0;

  document.getElementById(`remain-no-${cent}`).value = remainNo;
  document.getElementById(`remain-wt-${cent}`).value = remainWt;

  updateTotals();
}

// Update totals row
function updateTotals() {
  let totalOpenNo = 0, totalOpenWt = 0;
  let totalSoldNo = 0, totalSoldWt = 0;
  let totalRemainNo = 0, totalRemainWt = 0;

  CENTS.forEach(cent => {
    const opening = stock[cent];
    const sold = soldHistory[today][cent] || { products: 0, weight: 0 };
    const remainNo = opening.products - sold.products >= 0 ? opening.products - sold.products : 0;
    const remainWt = opening.weight - sold.weight >= 0 ? opening.weight - sold.weight : 0;

    totalOpenNo += opening.products;
    totalOpenWt += opening.weight;

    totalSoldNo += sold.products;
    totalSoldWt += sold.weight;

    totalRemainNo += remainNo;
    totalRemainWt += remainWt;
  });

  totalOpenNoEl.textContent = totalOpenNo;
  totalOpenWtEl.textContent = totalOpenWt;

  totalSoldNoEl.textContent = totalSoldNo;
  totalSoldWtEl.textContent = totalSoldWt;

  totalRemainNoEl.textContent = totalRemainNo;
  totalRemainWtEl.textContent = totalRemainWt;
}

// Initial totals
updateTotals();
const historyDateInput = document.getElementById("history-date");
const historyRowsDiv = document.getElementById("history-rows");
const historyTotalNoEl = document.getElementById("history-total-no");
const historyTotalWtEl = document.getElementById("history-total-wt");

// Set default date as today
historyDateInput.value = today;

// Render when date changes
historyDateInput.addEventListener("change", renderHistory);

// Render history table
function renderHistory() {
  const date = historyDateInput.value;
  historyRowsDiv.innerHTML = "";

  let totalNo = 0;
  let totalWt = 0;

  for (let cent = 1; cent <= 20; cent++) {
    const sold = soldHistory[date]?.[cent] || { products: 0, weight: 0 };

    totalNo += sold.products;
    totalWt += sold.weight;

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div>${cent} Cent</div>
      <div>${sold.products}</div>
      <div>${sold.weight}</div>
    `;
    historyRowsDiv.appendChild(row);
  }

  historyTotalNoEl.textContent = totalNo;
  historyTotalWtEl.textContent = totalWt;
}

// Call once on page load
renderHistory();
