// Load ZXing via CDN inside your HTML (I'll give you this in manifest or HTML note below)
// This script assumes ZXing is globally available as ZXing

const categories = [
  'radio', 'panasonic', 'zebra', 'finger',
  'honeywell', 'expressScanner', 'expressFinger'
];

window.onload = () => {
  categories.forEach(cat => {
    loadList(cat);
    const input = document.getElementById(`${cat}Input`);
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") addSerial(cat);
    });
  });
  loadBattery();

  // Setup scanner overlay elements
  createScannerOverlay();
};

function addSerial(category) {
  const input = document.getElementById(`${category}Input`);
  const value = input.value.trim();
  if (value === "") return alert("Cannot add empty serial number");

  let data = JSON.parse(localStorage.getItem(category)) || [];
  data.push(value);
  localStorage.setItem(category, JSON.stringify(data));
  input.value = "";
  loadList(category);
  stopScanner(); // Stop scanning when added manually or via scan
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
  localStorage.removeItem('batteryCount');
  loadBattery();
  stopScanner();
}

function exportPDF() {
  const win = window.open('', '', 'width=800,height=900');
  win.document.write('<html><head><title>Audit PDF</title></head><body>');
  win.document.write('<h1>Outbound Equipment Audit</h1>');
  categories.forEach(cat => {
    const title = prettifyCategory(cat);
    const data = JSON.parse(localStorage.getItem(cat)) || [];
    win.document.write(`<h2>${title}</h2><ol>`);
    data.forEach(s => win.document.write(`<li>${s}</li>`));
    win.document.write('</ol>');
  });
  const batteryCount = localStorage.getItem('batteryCount') || '0';
  win.document.write(`<h2>Radio Batteries On Hand</h2><p>${batteryCount}</p>`);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

function prettifyCategory(cat) {
  switch (cat) {
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

// Battery functions
function addBattery() {
  const input = document.getElementById('batteryInput');
  let val = input.value.trim();
  if (!/^\d{1,2}$/.test(val)) return alert("Enter a valid number (up to 2 digits)");
  localStorage.setItem('batteryCount', val);
  loadBattery();
  input.value = "";
}

function loadBattery() {
  const batteryList = document.getElementById('batteryList');
  batteryList.innerHTML = "";
  const val = localStorage.getItem('batteryCount') || "0";
  const li = document.createElement("li");
  li.textContent = val;
  batteryList.appendChild(li);
}

// === ZXing Scanner Integration ===

// Scanner overlay container & video
let scannerOverlay, videoElem, canvasElem, canvasCtx;
let codeReader;
let activeCategory = null;

function createScannerOverlay() {
  // Create overlay elements once
  scannerOverlay = document.createElement('div');
  scannerOverlay.id = 'scannerOverlay';
  scannerOverlay.style = `
    position: fixed;
    top:0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 9999;
  `;

  videoElem = document.createElement('video');
  videoElem.style = `
    width: 80vw;
    max-width: 600px;
    border: 5px solid #4d148c;
    border-radius: 10px;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = "Cancel Scan";
  closeBtn.style = `
    margin-top: 20px;
    padding: 10px 20px;
    background: #ff6600;
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 5px;
  `;
  closeBtn.onclick = () => stopScanner();

  scannerOverlay.appendChild(videoElem);
  scannerOverlay.appendChild(closeBtn);
  document.body.appendChild(scannerOverlay);
}

async function startScan(category) {
  if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
    alert("Camera scan not supported on this device/browser.");
    return;
  }
  activeCategory = category;

  scannerOverlay.style.display = "flex";

  codeReader = new ZXing.BrowserBarcodeReader();

  try {
    const videoInputDevices = await codeReader.getVideoInputDevices();
    if (videoInputDevices.length === 0) {
      alert("No camera device found.");
      stopScanner();
      return;
    }
    // Pick the first back camera if possible
    let selectedDeviceId = videoInputDevices[0].deviceId;
    for (const device of videoInputDevices) {
      if (device.label.toLowerCase().includes('back')) {
        selectedDeviceId = device.deviceId;
        break;
      }
    }

    codeReader.decodeFromVideoDevice(selectedDeviceId, videoElem, (result, err) => {
      if (result) {
        // Got a code!
        addSerialFromScan(activeCategory, result.text);
        stopScanner();
      }
      // else ignore error or no result
    });
  } catch (e) {
    alert("Error accessing camera: " + e.message);
    stopScanner();
  }
}

function addSerialFromScan(category, scannedValue) {
  if (!scannedValue || scannedValue.trim() === "") return;
  let data = JSON.parse(localStorage.getItem(category)) || [];
  data.push(scannedValue.trim());
  localStorage.setItem(category, JSON.stringify(data));
  loadList(category);

  // Also update input for user feedback
  const input = document.getElementById(`${category}Input`);
  if (input) input.value = scannedValue.trim();
}

function stopScanner() {
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  if (scannerOverlay) scannerOverlay.style.display = "none";
  activeCategory = null;
}
