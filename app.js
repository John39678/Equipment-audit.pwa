const categories = ['radio', 'panasonic', 'zebra', 'finger', 'honeywell', 'expressScanner', 'expressFinger'];

window.onload = () => {
  categories.forEach(cat => {
    loadList(cat);
    const input = document.getElementById(`${cat}Input`);
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") addSerial(cat);
    });
  });
  loadBatteryDisplay();
};

function addSerial(category) {
  const input = document.getElementById(`${category}Input`);
  const value = input.value.trim();
  if (value === "") return;
  let data = JSON.parse(localStorage.getItem(category)) || [];
  data.push(value);
  localStorage.setItem(category, JSON.stringify(data));
  input.value = "";
  loadList(category);
}

function loadList(category) {
  const list = document.getElementById(`${category}List`);
  list.innerHTML = "";
  const data = JSON.parse(localStorage.getItem(category)) || [];
  data.forEach(serial => {
    const li = document.createElement("li");
    li.textContent = serial;
    list.appendChild(li);
  });
}

function clearAll() {
  categories.forEach(cat => {
    localStorage.removeItem(cat);
    loadList(cat);
  });
  localStorage.removeItem("batteries");
  document.getElementById("batteryDisplay").textContent = "";
}

function exportPDF() {
  const win = window.open('', '', 'width=800,height=900');
  win.document.write('<html><head><title>Audit PDF</title></head><body>');
  win.document.write('<h1>Outbound Equipment Audit</h1>');
  categories.forEach(cat => {
    const title = cat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + 's';
    const data = JSON.parse(localStorage.getItem(cat)) || [];
    win.document.write(`<h2>${title}</h2><ol>`);
    data.forEach(s => win.document.write(`<li>${s}</li>`));
    win.document.write('</ol>');
  });
  const batteries = localStorage.getItem("batteries");
  if (batteries) {
    win.document.write(`<h2>Radio Batteries On Hand</h2><p>${batteries}</p>`);
  }
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

function saveBatteries() {
  const val = document.getElementById("batteryInput").value.trim();
  if (/^\d{1,2}$/.test(val)) {
    localStorage.setItem("batteries", val);
    loadBatteryDisplay();
    document.getElementById("batteryInput").value = "";
  }
}

function loadBatteryDisplay() {
  const val = localStorage.getItem("batteries");
  if (val) {
    document.getElementById("batteryDisplay").textContent = `Batteries: ${val}`;
  }
}

let codeReader;

function startScanner(inputId) {
  const preview = document.getElementById("scanner-preview");
  document.getElementById("scanner").style.display = "flex";

  codeReader = new ZXing.BrowserBarcodeReader();
  codeReader.decodeFromVideoDevice(null, preview, (result, err) => {
    if (result) {
      document.getElementById(inputId).value = result.text;
      stopScanner();
    }
  });
}

function stopScanner() {
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  document.getElementById("scanner").style.display = "none";
}
