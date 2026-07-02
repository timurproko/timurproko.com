// Page-specific end-slide canvas art (runs on #zxCanvasCube).
export function initHeroCanvas() {
  'use strict';

  var canvas = document.getElementById('zxCanvasCube');
  if (!canvas || !canvas.getContext) return;
  var tapCompute = document.querySelector('.zx-tap-compute');
  var endSlide = canvas.closest('.slide-zx-end');

  // Adapted from anirudhkhanna/juspay-hackathon-canvas-cube: real 3D points
  // projected and redrawn on HTML5 Canvas instead of the previous static SVG cube.
  function Point3D(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  Point3D.prototype.rotateX = function (angle) {
    var rad = angle * Math.PI / 180;
    var cosa = Math.cos(rad);
    var sina = Math.sin(rad);
    return new Point3D(this.x, this.y * cosa - this.z * sina, this.y * sina + this.z * cosa);
  };
  Point3D.prototype.rotateY = function (angle) {
    var rad = angle * Math.PI / 180;
    var cosa = Math.cos(rad);
    var sina = Math.sin(rad);
    return new Point3D(this.z * sina + this.x * cosa, this.y, this.z * cosa - this.x * sina);
  };
  Point3D.prototype.project = function (viewWidth, viewHeight, fov, viewDistance) {
    var factor = fov / (viewDistance + this.z);
    return new Point3D(this.x * factor + viewWidth / 2, this.y * factor + viewHeight / 2, this.z);
  };

  var vertices = [
    new Point3D(-1, 1, -1), new Point3D(1, 1, -1),
    new Point3D(1, -1, -1), new Point3D(-1, -1, -1),
    new Point3D(-1, 1, 1), new Point3D(1, 1, 1),
    new Point3D(1, -1, 1), new Point3D(-1, -1, 1)
  ];
  var faces = [[0,1,2,3], [1,5,6,2], [5,4,7,6], [4,0,3,7], [0,4,5,1], [3,2,6,7]];
  var diagonals = [[0,6], [1,7], [2,4], [3,5]];
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerDown = false;
  var pointerMoved = false;
  var oldX = 0;
  var oldY = 0;
  var baseX = reduceMotion ? 0 : 0.006;
  var baseY = reduceMotion ? 0 : 0.003;
  var targetX = baseX;
  var targetY = baseY;
  var spinX = 0;
  var spinY = 0;
  var nextSpeedShuffle = 0;
  var theta = -0.55;
  var phi = 0.35;
  var spinAmortization = 0.982;
  var tapComputePaused = false;
  var tapComputeActive = false;
  var tapComputeHideTimer = 0;
  var tapComputeMinResumeAt = 0;
  var tapComputeSettleBurstQueued = false;
  var tapComputeSettleThreshold = 0.010;

  function randomSigned(min, max) {
    var value = min + Math.random() * (max - min);
    return (Math.random() < 0.5 ? -1 : 1) * value;
  }

  function shuffleBaseSpeed(now) {
    if (reduceMotion || now < nextSpeedShuffle) return;
    targetX = randomSigned(0.0045, 0.015);
    targetY = randomSigned(0.0025, 0.010);
    nextSpeedShuffle = now + 650 + Math.random() * 1350;
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

  function projectedPoints(size) {
    var points = [];
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < vertices.length; i++) {
      var point = vertices[i]
        .rotateX(phi * 50)
        .rotateY(theta * 50)
        .project(size, size, size * 0.72, 3.2);
      points.push(point);
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    // Perspective can make the projected bounding box drift away from the
    // canvas center. Recenter the actual visible cube so it sits in the halo.
    var offsetX = size / 2 - (minX + maxX) / 2;
    var offsetY = size / 2 - (minY + maxY) / 2;
    for (var p = 0; p < points.length; p++) {
      points[p].x += offsetX;
      points[p].y += offsetY;
    }
    return points;
  }

  function strokeSegment(points, a, b, width, alpha, dash) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.setLineDash(dash || [1, 13]);
    ctx.beginPath();
    ctx.moveTo(points[a].x, points[a].y);
    ctx.lineTo(points[b].x, points[b].y);
    ctx.stroke();
  }

  function draw() {
    var size = resizeCanvas();
    var now = performance.now();
    shuffleBaseSpeed(now);
    baseX += (targetX - baseX) * 0.018;
    baseY += (targetY - baseY) * 0.018;
    spinX *= spinAmortization;
    spinY *= spinAmortization;
    updateTapComputePause(now);
    theta += baseX + spinX;
    phi += baseY + spinY;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.strokeStyle = '#f8f8f9';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255,255,255,0.45)';
    ctx.shadowBlur = 8;

    var points = projectedPoints(size);
    for (var i = 0; i < diagonals.length; i++) {
      strokeSegment(points, diagonals[i][0], diagonals[i][1], 2.5, 0.32, [1, 18]);
    }
    for (var f = 0; f < faces.length; f++) {
      var face = faces[f];
      for (var e = 0; e < face.length; e++) {
        strokeSegment(points, face[e], face[(e + 1) % face.length], 4, 0.86, [1, 12]);
      }
    }
    ctx.setLineDash([]);
    ctx.fillStyle = '#f8f8f9';
    ctx.globalAlpha = 0.96;
    for (var p = 0; p < points.length; p++) {
      ctx.beginPath();
      ctx.arc(points[p].x, points[p].y, p === 6 ? 4.2 : 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    window.requestAnimationFrame(draw);
  }

  function pointerPoint(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function kickCube() {
    if (reduceMotion) return;
    var now = performance.now();
    targetX = randomSigned(0.010, 0.024);
    targetY = randomSigned(0.006, 0.018);
    spinX += randomSigned(0.055, 0.115);
    spinY += randomSigned(0.035, 0.085);
    nextSpeedShuffle = now + 900 + Math.random() * 900;
    hideTapComputeUntilSettled(now);
  }

  function hideTapComputeUntilSettled(now) {
    tapComputePaused = true;
    tapComputeSettleBurstQueued = false;
    tapComputeMinResumeAt = now + 1400;
    hideTapComputeText();
  }

  function updateTapComputePause(now) {
    if (!tapComputePaused) return;
    if (now < tapComputeMinResumeAt) return;
    if ((Math.abs(spinX) + Math.abs(spinY)) > tapComputeSettleThreshold) return;
    tapComputePaused = false;
    if (tapComputeSettleBurstQueued) return;
    tapComputeSettleBurstQueued = true;
    window.setTimeout(function () {
      tapComputeSettleBurstQueued = false;
      burstTapCompute();
    }, 900);
  }

  function isEndSlideVisible() {
    return !!tapCompute && !!endSlide && endSlide.classList.contains('is-visible');
  }

  function hideTapComputeText() {
    if (!tapCompute) return;
    tapComputeActive = false;
    if (tapComputeHideTimer) {
      window.clearTimeout(tapComputeHideTimer);
      tapComputeHideTimer = 0;
    }
    tapCompute.classList.remove('is-active');
    tapCompute.style.opacity = '0';
  }

  function burstTapCompute() {
    if (reduceMotion || tapComputePaused || tapComputeActive || !isEndSlideVisible()) return;
    tapComputeActive = true;
    tapCompute.style.opacity = '';
    tapCompute.style.setProperty('--tap-x', '50%');
    tapCompute.style.setProperty('--tap-y', '106%');
    tapCompute.classList.remove('is-active');
    void tapCompute.offsetWidth;
    tapCompute.classList.add('is-active');
    tapComputeHideTimer = window.setTimeout(hideTapComputeText, 2680);
  }

  if (tapCompute) {
    tapCompute.addEventListener('animationend', function (e) {
      if (e.animationName === 'zxTapComputeBurst') hideTapComputeText();
    });
  }

  function scheduleTapCompute() {
    if (!tapCompute) return;
    window.setTimeout(function () {
      if (!tapComputeActive) burstTapCompute();
      scheduleTapCompute();
    }, 1600 + Math.random() * 2400);
  }
  scheduleTapCompute();

  canvas.addEventListener('pointerdown', function (e) {
    var p = pointerPoint(e);
    pointerDown = true;
    pointerMoved = false;
    oldX = p.x;
    oldY = p.y;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!pointerDown) return;
    var p = pointerPoint(e);
    var moveX = p.x - oldX;
    var moveY = p.y - oldY;
    if ((moveX * moveX + moveY * moveY) > 64) pointerMoved = true;
  });
  function endPointer(e) {
    if (pointerDown && !pointerMoved) kickCube();
    pointerDown = false;
    pointerMoved = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', function (e) {
    pointerDown = false;
    pointerMoved = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener('pointerleave', function () {
    pointerDown = false;
    pointerMoved = false;
  });
  window.addEventListener('resize', resizeCanvas);
  draw();
}
