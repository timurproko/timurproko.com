// Full-screen viewer for the deploy-built CV PDF: Back, zoom, Download and Print
// in the same toolbar on every browser, instead of each browser's own PDF view
// (which on phones leaves no obvious way back). Pages are drawn with PDF.js,
// loaded only when the viewer first opens.
import './pdf-viewer.css';

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const PRINT_SCALE = 2.5; // ≈180 dpi on A4 — sharp on paper, light enough to build quickly

export function createPdfViewer({ url, fileName }) {
  let root = null;
  let pages = null;
  let zoomLabel = null;
  let pdf = null;
  let loading = null;
  let zoomIndex = ZOOMS.indexOf(1);
  let renderToken = 0;
  let returnFocus = null;

  function build() {
    root = document.createElement('div');
    root.className = 'pdf-viewer';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'CV as PDF');
    root.hidden = true;
    root.innerHTML = `
      <div class="pdf-bar">
        <button type="button" class="pdf-btn" data-act="back" aria-label="Back to the CV"><kbd>←</kbd> <span>Back</span></button>
        <div class="pdf-zoom" role="group" aria-label="Zoom">
          <button type="button" class="pdf-btn pdf-icon" data-act="out" aria-label="Zoom out">−</button>
          <output class="pdf-zoom-value" aria-live="polite">100%</output>
          <button type="button" class="pdf-btn pdf-icon" data-act="in" aria-label="Zoom in">+</button>
        </div>
        <div class="pdf-actions">
          <a class="pdf-btn" data-act="download" href="${url}" download="${fileName}" aria-label="Download the PDF"><kbd>↓</kbd> <span>Download</span></a>
          <button type="button" class="pdf-btn" data-act="print" aria-label="Print the PDF"><kbd>P</kbd> <span>Print</span></button>
        </div>
      </div>
      <div class="pdf-pages" tabindex="-1"><p class="pdf-status">Loading…</p></div>`;
    document.body.append(root);
    pages = root.querySelector('.pdf-pages');
    zoomLabel = root.querySelector('.pdf-zoom-value');

    root.querySelector('[data-act="back"]').addEventListener('click', close);
    root.querySelector('[data-act="out"]').addEventListener('click', () => zoom(-1));
    root.querySelector('[data-act="in"]').addEventListener('click', () => zoom(1));
    root.querySelector('[data-act="print"]').addEventListener('click', print);

    // A resize makes the measured button spots stale: fall back to the CSS layout
    window.addEventListener('resize', () => {
      root.style.removeProperty('--pdf-left');
      root.style.removeProperty('--pdf-right');
    });

    let resizeFrame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => { if (!root.hidden && pdf) render(); });
    }).observe(pages);
  }

  async function load() {
    if (pdf) return pdf;
    loading ||= (async () => {
      const [pdfjs, { default: workerSrc }] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      pdf = await pdfjs.getDocument(url).promise;
      return pdf;
    })();
    return loading;
  }

  // 100% fits the page to the width of the viewer (capped so it never gets huge on desktop).
  async function fitScale() {
    const first = await pdf.getPage(1);
    const width = first.getViewport({ scale: 1 }).width;
    const room = Math.min(pages.clientWidth - 32, 900);
    return Math.max(room, 200) / width;
  }

  async function render() {
    const token = ++renderToken;
    const scale = (await fitScale()) * ZOOMS[zoomIndex];
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const sheets = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Page ${n} of ${pdf.numPages}`);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0] }).promise;
      if (token !== renderToken) return; // a newer zoom or resize took over
      sheets.push(canvas);
    }
    // Keep the reader's place: the same fraction of the document stays at the top.
    const at = pages.scrollHeight ? pages.scrollTop / pages.scrollHeight : 0;
    pages.replaceChildren(...sheets);
    pages.scrollTop = at * pages.scrollHeight;
    zoomLabel.textContent = `${Math.round(ZOOMS[zoomIndex] * 100)}%`;
    root.querySelector('[data-act="out"]').disabled = zoomIndex === 0;
    root.querySelector('[data-act="in"]').disabled = zoomIndex === ZOOMS.length - 1;
  }

  function zoom(step) {
    const next = Math.min(ZOOMS.length - 1, Math.max(0, zoomIndex + step));
    if (next === zoomIndex || !pdf) return;
    zoomIndex = next;
    render();
  }

  // Print the PDF's own pages: each one drawn at print resolution as an image,
  // one per sheet, while everything else on the page is hidden (pdf-viewer.css).
  async function print() {
    if (!pdf) return;
    const button = root.querySelector('[data-act="print"]');
    button.disabled = true;
    try {
      // A browser that ignored the last window.print() never fired afterprint
      document.querySelectorAll('.pdf-print').forEach(old => old.remove());
      const sheet = document.createElement('div');
      sheet.className = 'pdf-print';
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: PRINT_SCALE });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const img = new Image();
        img.alt = '';
        img.src = canvas.toDataURL('image/jpeg', 0.92);
        await img.decode().catch(() => {});
        sheet.append(img);
      }
      document.body.append(sheet);
      document.documentElement.classList.add('pdf-printing');
      const done = () => {
        document.documentElement.classList.remove('pdf-printing');
        sheet.remove();
      };
      // The print copy is display:none on screen, so it can wait for afterprint
      // (Safari's dialog renders after print() returns).
      window.addEventListener('afterprint', done, { once: true });
      window.print();
    } finally {
      button.disabled = false;
    }
  }

  async function open() {
    if (!root) build();
    if (!root.hidden) return;
    returnFocus = document.activeElement;
    // Back and Print take the exact spots of the CV's Back and Open PDF buttons,
    // measured before the page's scrollbar goes away under the viewer.
    const back = document.querySelector('.back-shortcut')?.getBoundingClientRect();
    const opener = document.getElementById('print-cv')?.getBoundingClientRect();
    if (back?.width && opener?.width) {
      root.style.setProperty('--pdf-left', `${Math.round(back.left)}px`);
      root.style.setProperty('--pdf-right', `${Math.round(window.innerWidth - opener.right)}px`);
    }
    root.hidden = false;
    document.documentElement.classList.add('pdf-viewer-open');
    history.pushState({ cvPdf: true }, '');
    root.querySelector('[data-act="back"]').focus();
    try {
      await load();
      await render();
    } catch (error) {
      // Could not draw it here: hand over to the browser's own PDF view.
      console.error(error);
      window.location.href = url;
    }
  }

  function hide() {
    if (!root || root.hidden) return;
    root.hidden = true;
    document.documentElement.classList.remove('pdf-viewer-open');
    returnFocus?.focus?.();
  }

  // Back steps the history entry open() added, so the browser's own back
  // gesture and the Back button do the same thing.
  function close() {
    if (history.state?.cvPdf) history.back();
    else hide();
  }

  window.addEventListener('popstate', hide);
  window.addEventListener('keydown', event => {
    if (!root || root.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (!event.ctrlKey && !event.metaKey && (event.key === '+' || event.key === '=')) { event.preventDefault(); zoom(1); }
    else if (!event.ctrlKey && !event.metaKey && (event.key === '-' || event.key === '_')) { event.preventDefault(); zoom(-1); }
  });

  return { open, close, get isOpen() { return !!root && !root.hidden; } };
}
