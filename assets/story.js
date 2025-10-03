document.addEventListener("DOMContentLoaded", () => {
  const langSwitcher = document.getElementById("langSwitcher");
  const animalName = document.getElementById("animalName");
  const animalDesc = document.getElementById("animalDesc");
  const animalFact = document.getElementById("animalFact");

  let data = {};

  // JSON fetch
  fetch("data.json")
    .then(res => res.json())
    .then(json => {
      data = json;
      loadAnimal("eng"); // Default English
    })
    .catch(err => console.error("Error loading JSON:", err));

  // Language switcher event
  langSwitcher.addEventListener("change", (e) => {
    loadAnimal(e.target.value);
  });

  function loadAnimal(lang) {
  if (!data[lang]) return;

  animalName.textContent = data[lang].name;

  // desc যদি array হয় তাহলে join করে দেখাও
  if (Array.isArray(data[lang].desc)) {
    animalDesc.innerHTML = data[lang].desc.map(line => `<p>${line}</p>`).join("");
  } else {
    animalDesc.textContent = data[lang].desc;
  }

  animalFact.textContent = data[lang].fact;
}

});
