document.addEventListener("DOMContentLoaded", () => {
  const radios = document.getElementById("radios");
  const panasonics = document.getElementById("panasonics");
  const zebras = document.getElementById("zebras");
  const fingers = document.getElementById("fingers");

  for (let i = 0; i < 15; i++) {
    radios.innerHTML += `<input type="text" placeholder="Radio Serial #" maxlength="12"/>`;
    panasonics.innerHTML += `<input type="text" placeholder="Panasonic Scanner #" maxlength="12"/>`;
    fingers.innerHTML += `<input type="text" placeholder="Finger Scanner #" maxlength="12"/>`;
  }

  for (let i = 0; i < 20; i++) {
    zebras.innerHTML += `<input type="text" placeholder="Zebra Scanner #" maxlength="12"/>`;
  }

  document.getElementById("auditForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const formValues = {};
    document.querySelectorAll("input").forEach((input, index) => {
      formValues[`input_${index}`] = input.value;
    });
    localStorage.setItem("equipmentAuditData", JSON.stringify(formValues));
    alert("Saved locally.");
  });

  document.getElementById("loadSaved").addEventListener("click", () => {
    const saved = localStorage.getItem("equipmentAuditData");
    if (saved) {
      const values = JSON.parse(saved);
      document.querySelectorAll("input").forEach((input, index) => {
        input.value = values[`input_${index}`] || "";
      });
      alert("Loaded from local storage.");
    }
  });

  document.getElementById("downloadPDF").addEventListener("click", async () => {
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
  });
});
