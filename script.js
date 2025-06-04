document.addEventListener('DOMContentLoaded', function () {
  let activeInput = null;

  // Attach scanner button listeners
  document.querySelectorAll('.scan-btn').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      activeInput = input;
      startScanner();
    });
  });

  // Close scanner button
  document.getElementById('close-scanner').addEventListener('click', stopScanner);

  // Export button to trigger browser print (for PDF)
  document.getElementById('exportBtn').addEventListener('click', function () {
    const formContent = document.getElementById('auditForm').innerHTML;
    const win = window.open('', '', 'width=800,height=900');
    win.document.write('<html><head><title>PDF Export</title></head><body>');
    win.document.write(formContent);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  });

  // Start barcode scanner
  function startScanner() {
    document.getElementById('scanner-container').style.display = 'flex';

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#scanner')
      },
      decoder: {
        readers: ["code_128_reader", "ean_reader", "upc_reader"]
      }
    }, function (err) {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected(function (result) {
      if (activeInput) {
        activeInput.value = result.codeResult.code;
      }
      stopScanner();
    });
  }

  // Stop barcode scanner
  function stopScanner() {
    Quagga.stop();
    document.getElementById('scanner-container').style.display = 'none';
  }

  // Save form data locally
  const form = document.getElementById('auditForm');
  const fields = form.querySelectorAll('input');
  fields.forEach((field, i) => {
    const key = 'field-' + i;
    field.value = localStorage.getItem(key) || '';
    field.addEventListener('input', () => {
      localStorage.setItem(key, field.value);
    });
  });
});
