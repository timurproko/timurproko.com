// Page-specific end-slide canvas art (runs on #zxCanvasCube).
export function initHeroCanvas() {
  'use strict';

  var canvas = document.getElementById('zxCanvasCube');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var particles = [];

  function makeParticle(x, y, rim) {
    return {
      x: x,
      y: y,
      rim: rim,
      r: rim ? (0.9 + Math.random() * 1.25) : (0.7 + Math.random() * 1.5),
      phase: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.7,
      speedY: 0.35 + Math.random() * 0.65,
      ax: (rim ? 0.02 : 0.05) + Math.random() * (rim ? 0.03 : 0.06),
      ay: (rim ? 0.02 : 0.05) + Math.random() * (rim ? 0.03 : 0.06),
      alpha: rim ? (0.7 + Math.random() * 0.3) : (0.28 + Math.random() * 0.34)
    };
  }

  function buildParticles() {
    particles = [];
    var poly = [];
    var STEPS = 300;
    var raw = [];
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (var s = 0; s < STEPS; s++) {
      var th = (s / STEPS) * Math.PI * 2;
      var x = 16 * Math.pow(Math.sin(th), 3);
      var y = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th);
      raw.push([x, y]);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    var cX = (minX + maxX) / 2, cY = (minY + maxY) / 2;
    var half = Math.max(maxX - minX, maxY - minY) / 2;
    for (var r = 0; r < raw.length; r++) {
      poly.push([(raw[r][0] - cX) / half, (raw[r][1] - cY) / half]);
    }

    // Crisp outline particles along the parametric curve
    for (var o = 0; o < poly.length; o++) {
      particles.push(makeParticle(
        poly[o][0] + (Math.random() - 0.5) * 0.022,
        poly[o][1] + (Math.random() - 0.5) * 0.022,
        true
      ));
    }

    function inPoly(px, py) {
      var inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
      }
      return inside;
    }

    // Lighter interior fill
    var fillTarget = 210, nFill = 0, attempts = 0;
    while (nFill < fillTarget && attempts < 40000) {
      attempts++;
      var fx = -1.05 + Math.random() * 2.1;
      var fy = -1.05 + Math.random() * 2.1;
      if (!inPoly(fx, fy)) continue;
      nFill++;
      particles.push(makeParticle(fx, fy, false));
    }
  }

  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var size = Math.max(1, Math.round(Math.min(rect.width || 600, rect.height || 600)));
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var pixelSize = Math.round(size * ratio);
    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return size;
  }

  function drawGlow(cx, cy, size, beat) {
    var glow = ctx.createRadialGradient(cx, cy, size * 0.02, cx, cy, size * (0.32 + beat * 0.02));
    glow.addColorStop(0, 'rgba(206,214,230,0.09)');
    glow.addColorStop(0.5, 'rgba(206,214,230,0.035)');
    glow.addColorStop(1, 'rgba(206,214,230,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  }

  function draw(now) {
    var size = resizeCanvas();
    var t = now * 0.001;
    ctx.clearRect(0, 0, size, size);
    var beat = reduceMotion ? 0 : Math.pow(Math.max(0, Math.sin(t * Math.PI * 1.35)), 8);
    var scale = size * (0.34 + beat * 0.014);
    var cx = size * 0.5;
    var cy = size * 0.48;
    drawGlow(cx, cy, size, beat);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var wanderX = reduceMotion ? 0 : Math.sin(t * p.speed + p.phase) * p.ax;
      var wanderY = reduceMotion ? 0 : Math.cos(t * p.speedY + p.phaseY) * p.ay;
      var px = cx + (p.x + wanderX) * scale * (1 + beat * 0.06);
      var py = cy - (p.y + wanderY) * scale * (1 + beat * 0.06);
      var shimmer = reduceMotion ? 0 : Math.sin(t * p.speed + p.phase) * 0.08;
      var alpha = Math.min(1, p.alpha + beat * 0.28 + shimmer);
      var radius = p.r * (0.9 + beat * 0.22);
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = (i % 11 === 0)
        ? 'rgba(224,36,94,' + (alpha * 0.85).toFixed(3) + ')'
        : 'rgba(226,232,240,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
    window.requestAnimationFrame(draw);
  }

  buildParticles();
  window.addEventListener('resize', resizeCanvas);
  draw(0);
}
