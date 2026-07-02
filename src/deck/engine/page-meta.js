// Publishes page meta to a parent frame (used by the portfolio shell).
export function initPageMeta() {
  function publishPageMeta() {
    if (window.parent === window) return;
    window.parent.postMessage({
      type: "page-meta",
      file: location.pathname.split("/").pop(),
      title: document.querySelector("title")?.textContent?.trim() || document.title,
      description: document.querySelector('meta[name="description"]')?.content?.trim() || ""
    }, "*");
  }
  publishPageMeta();
  window.addEventListener("load", publishPageMeta);
}
