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
    var raw = [];
    // Same smooth teardrop profile as the cover balloon (cubic beziers, y grows downward).
    var segs = [
      [[150,336],[106,316],[32,250],[32,150]],
      [[32,150],[32,54],[92,12],[150,12]],
      [[150,12],[208,12],[268,54],[268,150]],
      [[268,150],[268,250],[194,316],[150,336]]
    ];
    var STEPS = 30;
    for (var si = 0; si < segs.length; si++) {
      var sg = segs[si];
      for (var i = 0; i < STEPS; i++) {
        var u = i / STEPS, mu = 1 - u;
        var a0 = mu*mu*mu, a1 = 3*mu*mu*u, a2 = 3*mu*u*u, a3 = u*u*u;
        raw.push([a0*sg[0][0]+a1*sg[1][0]+a2*sg[2][0]+a3*sg[3][0], -(a0*sg[0][1]+a1*sg[1][1]+a2*sg[2][1]+a3*sg[3][1])]);
      }
    }
    var tipX = 150, tipY = 336;
    var basketTopY = 362, basketBotY = 392, bTopHalf = 16, bBotHalf = 22;

    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (var b = 0; b < raw.length; b++) {
      var rx = raw[b][0], ry = raw[b][1];
      if (rx < minX) minX = rx; if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry; if (ry > maxY) maxY = ry;
    }
    if (-basketBotY < minY) minY = -basketBotY; // include basket depth (raw space)
    var cX = (minX + maxX) / 2, cY = (minY + maxY) / 2;
    var half = Math.max(maxX - minX, maxY - minY) / 2;
    function norm(x, y) { return [(x - cX) / half, (y - cY) / half]; }
    function normC(x, yDown) { return norm(x, -yDown); }
    for (var r = 0; r < raw.length; r++) { var n = norm(raw[r][0], raw[r][1]); poly.push(n); }

    // Crisp outline particles along the canopy curve
    for (var o = 0; o < poly.length; o++) {
      particles.push(makeParticle(
        poly[o][0] + (Math.random() - 0.5) * 0.02,
        poly[o][1] + (Math.random() - 0.5) * 0.02,
        true
      ));
    }

    function inPoly(px, py) {
      var inside = false;
      for (var i3 = 0, j = poly.length - 1; i3 < poly.length; j = i3++) {
        var xi = poly[i3][0], yi = poly[i3][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
      }
      return inside;
    }

    // Lighter interior fill
    var fillTarget = 200, nFill = 0, attempts = 0;
    while (nFill < fillTarget && attempts < 40000) {
      attempts++;
      var fx = -1.1 + Math.random() * 2.2;
      var fy = -1.1 + Math.random() * 2.2;
      if (!inPoly(fx, fy)) continue;
      nFill++;
      particles.push(makeParticle(fx, fy, false));
    }

    // Dotted basket + suspension ropes
    function addLine(a, bb, count, rim) {
      for (var k = 0; k <= count; k++) {
        var tt = k / count;
        var nn = normC(a[0] + (bb[0] - a[0]) * tt, a[1] + (bb[1] - a[1]) * tt);
        particles.push(makeParticle(nn[0] + (Math.random() - 0.5) * 0.012, nn[1] + (Math.random() - 0.5) * 0.012, rim));
      }
    }
    var bTL = [tipX - bTopHalf, basketTopY], bTR = [tipX + bTopHalf, basketTopY], bBR = [tipX + bBotHalf, basketBotY], bBL = [tipX - bBotHalf, basketBotY];
    addLine(bTL, bTR, 5, true); addLine(bTR, bBR, 4, true); addLine(bBR, bBL, 5, true); addLine(bBL, bTL, 4, true);
    addLine([tipX - 6, tipY - 2], bTL, 7, true);
    addLine([tipX + 6, tipY - 2], bTR, 7, true);
    addLine([tipX - 2, tipY - 2], [tipX - bTopHalf * 0.45, basketTopY], 7, true);
    addLine([tipX + 2, tipY - 2], [tipX + bTopHalf * 0.45, basketTopY], 7, true);
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
    glow.addColorStop(0, 'rgba(120,220,150,0.11)');
    glow.addColorStop(0.5, 'rgba(120,220,150,0.045)');
    glow.addColorStop(1, 'rgba(120,220,150,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  }

  function draw(now) {
    var size = resizeCanvas();
    var t = now * 0.001;
    ctx.clearRect(0, 0, size, size);
    var floatY = reduceMotion ? 0 : (Math.sin(t * 0.6) * size * 0.022 + Math.sin(t * 0.24 + 1.3) * size * 0.012);
    var floatX = reduceMotion ? 0 : Math.sin(t * 0.41 + 0.8) * size * 0.014;
    var scale = size * 0.34;
    var cx = size * 0.5 + floatX;
    var cy = size * 0.47 + floatY;
    drawGlow(cx, cy, size, 0);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var wanderX = reduceMotion ? 0 : Math.sin(t * p.speed + p.phase) * p.ax;
      var wanderY = reduceMotion ? 0 : Math.cos(t * p.speedY + p.phaseY) * p.ay;
      var px = cx + (p.x + wanderX) * scale;
      var py = cy - (p.y + wanderY) * scale;
      var shimmer = reduceMotion ? 0 : Math.sin(t * p.speed + p.phase) * 0.08;
      var alpha = Math.min(1, p.alpha + shimmer);
      var radius = p.r * 0.98;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = (i % 11 === 0)
        ? 'rgba(34,197,94,' + (alpha * 0.9).toFixed(3) + ')'
        : 'rgba(226,232,240,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
    window.requestAnimationFrame(draw);
  }

  buildParticles();
  window.addEventListener('resize', resizeCanvas);
  draw(0);
}
