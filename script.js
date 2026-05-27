const pages = document.querySelector("#pages");
const pageCounter = document.querySelector("#pageCounter");
const controls = document.querySelectorAll("[data-direction]");
const labels = ["Tapa", "1 / 3", "2 / 3", "3 / 3"];

let activePage = 0;

function pageWidth() {
  return pages.clientWidth;
}

function updateCounter() {
  const nextPage = Math.round(pages.scrollLeft / pageWidth());
  activePage = Math.min(Math.max(nextPage, 0), labels.length - 1);
  pageCounter.textContent = labels[activePage];
}

function goToPage(index) {
  const nextPage = Math.min(Math.max(index, 0), labels.length - 1);
  pages.scrollTo({
    left: nextPage * pageWidth(),
    behavior: "smooth",
  });
}

controls.forEach((button) => {
  button.addEventListener("click", () => {
    goToPage(activePage + Number(button.dataset.direction));
  });
});

pages.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateCounter);
});

pages.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goToPage(activePage + 1);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToPage(activePage - 1);
  }
});

window.addEventListener("resize", () => {
  goToPage(activePage);
});

updateCounter();
