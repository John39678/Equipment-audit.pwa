const categories = [
  'radio', 'panasonic', 'zebra', 'finger',
  'honeywell', 'expressScanner', 'expressFinger'
];

// Load saved data and set up Enter key
window.onload = () => {
  categories.forEach(cat => {
    loadList(cat);
    const input = document.getElementById(`${cat}Input`);
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") addSerial(cat);
    });
  });
  loadBatteryCount();
};

function addSerial(category) {
  const input = document.getElementById(`${category}Input`);
  const value = input.value.trim();
  if (value === "") return alert("Please enter a serial number.");

  let data = JSON.parse(localStorage.getItem(category)) || [];
  if(data.includes(value)) {
    alert("Serial already added.");
    input.value = "";
    return;
  }

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
  if (!confirm("Clear all saved data? This cannot be undone.")) return;
  categories.forEach(cat => {
    localStorage.removeItem(cat);
    loadList(cat);
  });
  localStorage.removeItem('radioBatteries');
  loadBatteryCount();
}

// Radio Batteries functions
function addBatteryCount() {
  const input = document.getElementById("radioBatteriesInput");
  let val = input.value.trim();
  if (!val.match(/^\d{1,2}$/)) return alert("Enter a number between 0 and 99.");
  localStorage.setItem('radioBatteries', val);
  input.value = "";
  loadBatteryCount();
}

function loadBatteryCount() {
  const display = document.getElementById("radioBatteriesDisplay");
  const count = localStorage.getItem('radioBatteries') || "(none)";
  display.textContent = `Batteries on hand: ${count}`;
}

// Barcode scanner logic
let currentCategory = null;

function startScanner(category) {
  currentCategory = category;
  document.getElementById('scannerContainer').style.display = "block";
  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector('#scannerPreview'),
      constraints: {
        facingMode: "environment"
      },
      area: { // defines rectangle of scanning area
        top: "0%",    // top offset
        right: "0%",  // right offset
        left: "0%",   // left offset
        bottom: "0%"  // bottom offset
      }
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "upc_reader", "upc_e_reader", "codabar_reader"]
    },
    locate: true
  }, err => {
    if (err) {
      alert("Failed to start scanner: " + err);
      stopScanner();
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(onDetected);
}

function onDetected(result) {
  if (!result || !result.codeResult || !result.codeResult.code) return;
  const code = result.codeResult.code;
  if (!code) return;

  Quagga.offDetected(onDetected);
  stopScanner();

  const input = document.getElementById(`${currentCategory}Input`);
  input.value = code;
  addSerial(currentCategory);
  currentCategory = null;
}

function stopScanner() {
  Quagga.stop();
  document.getElementById('scannerContainer').style.display = "none";
  Quagga.offDetected(onDetected);
}

// PDF Export
function exportPDF() {
  let content = `<h1>Outbound Equipment Audit</h1>`;
  categories.forEach(cat => {
    const data = JSON.parse(localStorage.getItem(cat)) || [];
    if(data.length > 0) {
      content += `<h2>${formatCategory(cat)}</h2><ol>`;
      data.forEach(item => {
        content += `<li>${item}</li>`;
      });
      content += `</ol>`;
    }
  });
  const batteries = localStorage.getItem('radioBatteries') || "(none)";
  content += `<h2>Radio Batteries On Hand</h2><p>${batteries}</p>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`<html><head><title>Export</title></head><body>${content}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function formatCategory(cat) {
  switch(cat) {
    case 'radio': return 'Radios';
    case 'panasonic': return 'Panasonic Scanners';
    case 'zebra': return 'Zebra Scanners';
    case 'finger': return 'Finger Scanners';
    case 'honeywell': return 'Honeywell Printers';
    case 'expressScanner': return 'Express Scanners';
    case 'expressFinger': return 'Express Finger Scanners';
    default: return cat;
  }
}
