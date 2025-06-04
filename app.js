// Paste this into app.js
let data = {
  radio: [],
  panasonic: [],
  zebra: [],
  finger: [],
  battery: ""
};

function addEntry(type) {
  const input = document.getElementById(type + 'Input');
  const value = input.value.trim();
  if (value && value.length <= 12) {
    data[type].push(value);
    localStorage.setItem('auditData', JSON.stringify(data));
    renderList(type);
    input.value = '';
  }
}

function renderList(type) {
  const list = document.getElementById(type + 'List');
  list.innerHTML = '';
  data[type].forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    list.appendChild(li);
  });
}

function saveBatteryCount() {
  const count = document.getElementById('batteryCount').value;
  if (count.length <= 2) {
    data.battery = count;
    localStorage.setItem('auditData', JSON.stringify(data));
    document.getElementById('batteryDisplay').textContent = "Count: " + count;
  }
}

function exportPDF() {
  let content = "FedEx Outbound Equipment Audit\\n\\n";
  for (let type in data) {
    if (type !== 'battery') {
      content += type.toUpperCase() + ":\\n" + data[type].join("\\n") + "\\n\\n";
    }
  }
  content += "Radio Batteries On Hand: " + (data.battery || '') + "\\n";

  const blob = new Blob([content], {type: 'application/pdf'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'equipment_audit.pdf';
  link.click();
}

function loadData() {
  const stored = localStorage.getItem('auditData');
  if (stored) {
    data = JSON.parse(stored);
    ['radio','panasonic','zebra','finger'].forEach(renderList);
    document.getElementById('batteryDisplay').textContent = "Count: " + (data.battery || '');
  }
}

function scanCode(inputId) {
  if (!('BarcodeDetector' in window)) {
    alert('Barcode scanning not supported on this device.');
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      const detector = new BarcodeDetector();
      const scan = () => {
        detector.detect(video).then(codes => {
          if (codes.length > 0) {
            document.getElementById(inputId).value = codes[0].rawValue;
            stream.getTracks().forEach(track => track.stop());
          } else {
            requestAnimationFrame(scan);
          }
        });
      };
      scan();
    });
}

loadData();
