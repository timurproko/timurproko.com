// Pillars venn diagram timing (no-ops when the page has no .pillars-venn).
export function initVenn() {
  function setupVenn() {
    var venn = document.querySelector('.pillars-venn');
    if (venn) {
      venn.removeAttribute('data-anim');
      venn.style.removeProperty('--anim-name');
      venn.style.removeProperty('--anim-delay');
    }
    var rings = document.querySelectorAll('.venn-rings circle');
    [60,150,240,330].forEach(function(d,i){ if(rings[i]) rings[i].style.setProperty('--vd', d+'ms'); });
    var labels = document.querySelectorAll('.venn-label text');
    [200,290,380,470].forEach(function(d,i){ if(labels[i]) labels[i].style.setProperty('--vd', d+'ms'); });
    var core = document.querySelector('.venn-core-circle');
    if (core) core.style.setProperty('--vd','440ms');
    var coreTexts = document.querySelectorAll('.venn-core');
    [560,620].forEach(function(d,i){ if(coreTexts[i]) coreTexts[i].style.setProperty('--vd', d+'ms'); });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupVenn); }
  else { setupVenn(); }
}
