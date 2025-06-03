function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Outbound Equipment Audit", 20, 20);

  const inputs = document.querySelectorAll("input");
  let y = 30;

  inputs.forEach(input => {
    doc.text(`${input.placeholder}: ${input.value}`, 20, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("equipment-audit.pdf");
}

function saveToLocal() {
  const formValues = {};
  document.querySelectorAll("input").forEach((input, index) => {
    formValues[`input_${index}`] = input.value;
  });
  localStorage.setItem("equipmentAuditData", JSON.stringify(formValues));
  alert("Saved locally");
}

function loadFromLocal() {
  const saved = localStorage.getItem("equipmentAuditData");
  if (saved) {
    const values = JSON.parse(saved);
    document.querySelectorAll("input").forEach((input, index) => {
      input.value = values[`input_${index}`] || "";
    });
  }
}

document.getElementById("auditForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveToLocal();
});

window.onload = loadFromLocal;
