const categories = ['radio', 'panasonic', 'zebra', 'finger'];

window.onload = () => {
  categories.forEach(cat => {
    loadList(cat);
    const input = document.getElementById(`${cat}Input`);
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") addSerial(cat);
    });
  });
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
  data.forEach((serial, i) => {
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
}

function exportPDF() {
  const win = window.open('', '', 'width=800,height=900');
  win.document.write('<html><head><title>Audit PDF</title></head><body>');
  win.document.write('<h1>Outbound Equipment Audit</h1>');
  categories.forEach(cat => {
    const title = cat.charAt(0).toUpperCase() + cat.slice(1) + 's';
    const data = JSON.parse(localStorage.getItem(cat)) || [];
    win.document.write(`<h2>${title}</h2><ol>`);
    data.forEach(s => win.document.write(`<li>${s}</li>`));
    win.document.write('</ol>');
  });
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}
