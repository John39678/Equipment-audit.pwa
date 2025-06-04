const fields = {
  "radio": 15,
  "panasonic": 15,
  "zebra": 20,
  "finger": 15
};

window.onload = function () {
  for (const [key, count] of Object.entries(fields)) {
    const group = document.getElementById(key + "-group");
    for (let i = 0; i < count; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "input-row";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = key.charAt(0).toUpperCase() + key.slice(1) + " Serial";
      input.dataset.key = key;
      input.dataset.index = i;

      input.value = localStorage.getItem(key + "-" + i) || "";

      input.onchange = () => {
        localStorage.setItem(key + "-" + i, input.value);
      };

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Scan";
      button.onclick = () => scanBarcode(input);

      wrapper.appendChild(input);
      wrapper.appendChild(button);
      group.appendChild(wrapper);
    }
  }
};

function scanBarcode(inputEl) {
  const codeReader = new ZXing.BrowserBarcodeReader();
  const previewElem = document.getElementById("scanner-preview");
  previewElem.style.display = "block";
  codeReader.decodeOnceFromVideoDevice(undefined, "scanner-preview").then(result => {
    inputEl.value = result.text;
    localStorage.setItem(inputEl.dataset.key + "-" + inputEl.dataset.index, result.text);
    codeReader.reset();
    previewElem.style.display = "none";
  }).catch(err => {
    console.error(err);
    previewElem.style.display = "none";
  });
}

function exportPDF() {
  window.print();
}
