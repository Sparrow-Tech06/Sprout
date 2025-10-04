function searchRedirect(e) {
  e.preventDefault();
  const q = document.getElementById("searchInput").value.trim();
  if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
}

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("storyContainer");
    data.sections.forEach(section => {
      const sectionHTML = `
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h5 class="m-0 text-success">${section.title}</h5>
              <small class="text-muted">${section.description}</small>
            </div>
            <a href="stories/Top Stories.html" class="text-decoration-none text-light">See all <i class="bi bi-arrow-right"></i></a>
          </div>
          <div class="d-flex overflow-auto gap-3 pb-2">
            ${section.items
              .map(
                item => `
                <a href="${item.link}" class="text-decoration-none text-light">
                  <div class="card bg-secondary border-0 rounded-3" style="width: 160px; flex-shrink: 0;">
                    <img src="${item.img}" class="card-img-top rounded-top-3" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center p-2">${item.title}</div>
                  </div>
                </a>`
              )
              .join("")}
          </div>
        </div>
      `;
      container.innerHTML += sectionHTML;
    });
  });


