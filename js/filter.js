(function () {
  const VALID_FIELDS = ["software", "science", "art"];

  function applyFilters(field, section) {
    const validSections = [...document.querySelectorAll(".section-group")].map(g => g.dataset.section);
    const activeField = field && VALID_FIELDS.includes(field) ? field : null;
    const activeSection = section && validSections.includes(section) ? section : null;

    document.querySelectorAll(".field-filter").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.field === activeField);
    });

    document.querySelectorAll(".section-group").forEach((group) => {
      const groupSection = group.dataset.section;
      const items = group.querySelectorAll("li");
      let visible = 0;

      items.forEach((li) => {
        const fields = li.dataset.fields.split(" ").filter(Boolean);
        const fieldMatch = !activeField || fields.includes(activeField);
        const sectionMatch = !activeSection || groupSection === activeSection;
        const show = fieldMatch && sectionMatch;
        li.style.display = show ? "" : "none";
        if (show) visible++;
      });

      group.style.display = visible > 0 ? "" : "none";
    });
  }

  function getParams() {
    const params = new URLSearchParams(window.location.search);
    return { field: params.get("field"), section: params.get("section") };
  }

  function setParam(key, value) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    history.pushState({}, "", qs ? "?" + qs : window.location.pathname);
  }

  document.querySelectorAll(".field-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { field } = getParams();
      const clicked = btn.dataset.field;
      const next = field === clicked ? null : clicked;
      setParam("field", next);
      const { section } = getParams();
      applyFilters(next, section);
    });
  });

  const { field, section } = getParams();
  applyFilters(field, section);
})();
