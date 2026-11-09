const progressInputs = Array.from(document.querySelectorAll("input[data-course-progress]"));

if (progressInputs.length > 0) {
  const status = document.querySelector("[data-progress-status]");
  const summaries = Array.from(document.querySelectorAll("[data-progress-summary]"));
  let storageAvailable = true;

  const renderSummaries = () => {
    summaries.forEach((summary) => {
      const group = summary.dataset.progressSummary;
      const inputs = progressInputs.filter((input) => input.dataset.progressGroup === group);
      const completed = inputs.filter((input) => input.checked).length;
      summary.value = `${completed}/${inputs.length}`;
      summary.textContent = `${completed}/${inputs.length}`;
    });
  };

  const showStorageError = () => {
    storageAvailable = false;
    if (status) {
      status.textContent = "Pokrok sa nepodarilo uložiť v tomto prehliadači. Zmeny zostanú dostupné len do obnovenia stránky.";
    }
  };

  try {
    progressInputs.forEach((input) => {
      input.checked = window.localStorage.getItem(`programovanie-course-progress:v1:${input.dataset.courseProgress}`) === "1";
    });
  } catch {
    showStorageError();
  }

  if (storageAvailable && status) {
    status.textContent = "Pokrok sa ukladá iba v tomto prehliadači.";
  }

  progressInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (storageAvailable) {
        try {
          window.localStorage.setItem(
            `programovanie-course-progress:v1:${input.dataset.courseProgress}`,
            input.checked ? "1" : "0",
          );
        } catch {
          showStorageError();
        }
      }

      renderSummaries();
    });
  });

  renderSummaries();
}
