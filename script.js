const body = document.getElementById("inventoryBody");

const labels = [
  ...Array.from({ length: 20 }, (_, i) => `${i + 1} Cent`),
  "22 Cent", "25 Cent", "28 Cent", "30 Cent",
  ...Array.from({ length: 5 }, (_, i) => `Item ${i + 1}`)
];

// CREATE ROWS
labels.forEach(label => {
  body.innerHTML += `
  <tr>
    <td>${label}</td>
    <td>
      <input type="number" class="opP" oninput="calc()">
      <span class="low-stock">⬇</span>
    </td>
    <td><input type="number" step="0.001" class="opW" oninput="calc()"></td>
    <td><input type="number" class="sP" oninput="calc()"></td>
    <td><input type="number" step="0.001" class="sW" oninput="calc()"></td>
    <td>
      <input class="rP" readonly>
      <input class="rW" readonly>
    </td>
  </tr>`;
});

// LOAD INVENTORY
window.onload = () => {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  document.querySelectorAll("tbody tr").forEach((row, i) => {
    if (!inventory[i]) return;
    row.querySelector(".opP").value = inventory[i].opP;
    row.querySelector(".opW").value = inventory[i].opW;
  });
  calc();
};

// AUTO CALCULATION + LOW STOCK INDICATOR
function calc() {
  let tOP=0, tOW=0, tSP=0, tSW=0, tRP=0, tRW=0;

  document.querySelectorAll("tbody tr").forEach(row => {
    let opP = +row.querySelector(".opP").value || 0;
    let opW = +row.querySelector(".opW").value || 0;
    let sP  = +row.querySelector(".sP").value || 0;
    let sW  = +row.querySelector(".sW").value || 0;

    let rP = opP - sP;
    let rW = opW - sW;

    row.querySelector(".rP").value = rP;
    row.querySelector(".rW").value = rW.toFixed(3);

    // 🔴 LOW STOCK INDICATOR
    const arrow = row.querySelector(".low-stock");
    arrow.style.display = rP <= 10 ? "inline" : "none";

    tOP+=opP; tOW+=opW;
    tSP+=sP;  tSW+=sW;
    tRP+=rP;  tRW+=rW;
  });

  document.getElementById("tOP").innerText = tOP;
  document.getElementById("tOW").innerText = tOW.toFixed(3);
  document.getElementById("tSP").innerText = tSP;
  document.getElementById("tSW").innerText = tSW.toFixed(3);
  document.getElementById("tR").innerText =
    `${tRP} , ${tRW.toFixed(3)}`;
}

// SAVE → REDUCE INVENTORY → RESET SOLD
function saveAndViewHistory() {
  const today = new Date().toISOString().split("T")[0];
  let history = JSON.parse(localStorage.getItem("soldHistory")) || {};
  let inventory = [];

  history[today] = [];

  document.querySelectorAll("tbody tr").forEach(row => {
    let opP = +row.querySelector(".opP").value || 0;
    let opW = +row.querySelector(".opW").value || 0;
    let sP  = +row.querySelector(".sP").value || 0;
    let sW  = +row.querySelector(".sW").value || 0;

    let rP = opP - sP;
    let rW = opW - sW;

    history[today].push({ pieces: sP, weight: sW });

    row.querySelector(".opP").value = rP;
    row.querySelector(".opW").value = rW.toFixed(3);

    row.querySelector(".sP").value = 0;
    row.querySelector(".sW").value = 0;

    inventory.push({ opP: rP, opW: rW });
  });

  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("soldHistory", JSON.stringify(history));

  calc();
  window.open("sold.html", "_blank");
}
