function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Outbound Equipment Audit", 20, 20);

  let inputs = document.querySelectorAll("input");
  let y = 30;

  inputs.forEach((input, index) => {
    doc.text(`${input.placeholder}: ${input.value}`, 20, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("equipment-audit.pdf");
}

document.getElementById('auditForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert("Form submitted!");
});
