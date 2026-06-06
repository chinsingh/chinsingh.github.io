const COPY_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function attachCopy(el, getText) {
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.setAttribute("aria-label", "Copy");
  btn.innerHTML = COPY_ICON;
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(getText()).then(() => {
      btn.innerHTML = CHECK_ICON;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = COPY_ICON;
        btn.classList.remove("copied");
      }, 1500);
    });
  });
  el.appendChild(btn);
}

document.querySelectorAll('pre[class*="language-"]').forEach((pre) => {
  attachCopy(pre, () => pre.querySelector("code")?.textContent ?? pre.textContent);
});

document.querySelectorAll(".card-quote").forEach((card) => {
  attachCopy(card, () => card.querySelector(".prose")?.innerText.trim() ?? "");
});
