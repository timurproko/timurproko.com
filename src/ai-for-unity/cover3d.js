// Cover 3D object (three.js), page-specific.
import * as THREE from 'three';

export function initCover3d() {
    var host = document.getElementById('coverHeart');
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    var w = host.clientWidth || 1200, h = host.clientHeight || 800;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 0, 10.4);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    var cube = new THREE.Group();
    scene.add(cube);

    var vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    var edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    var innerLines = [
      [0, 6], [1, 7], [2, 4], [3, 5]
    ];
    var rainbow = [
      new THREE.Color(0xff4d6d),
      new THREE.Color(0xff9f1c),
      new THREE.Color(0xffd166),
      new THREE.Color(0x38d996),
      new THREE.Color(0x4cc9f0),
      new THREE.Color(0xb56cff)
    ];

    function buildLineGeometry(pairs, scale, alphaOffset) {
      var positions = [];
      var colors = [];
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var a = vertices[pair[0]];
        var b = vertices[pair[1]];
        var colorA = rainbow[(i + alphaOffset) % rainbow.length];
        var colorB = rainbow[(i + alphaOffset + 2) % rainbow.length];
        positions.push(a[0] * scale, a[1] * scale, a[2] * scale, b[0] * scale, b[1] * scale, b[2] * scale);
        colors.push(colorA.r, colorA.g, colorA.b, colorB.r, colorB.g, colorB.b);
      }
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return geometry;
    }

    // Semi-transparent rainbow fill so the cube reads as a volume, while the
    // thicker rainbow wires stay dominant over the dark cover.
    var fillMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xff4d6d, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0xff9f1c, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.11, side: THREE.DoubleSide, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0x38d996, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0xb56cff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
    ];
    var fill = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.9, 2.9), fillMaterials);
    cube.add(fill);

    function makeEdgeTubes(pairs, scale, radius, opacity, alphaOffset, additive) {
      var group = new THREE.Group();
      var up = new THREE.Vector3(0, 1, 0);
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var a = vertices[pair[0]];
        var b = vertices[pair[1]];
        var start = new THREE.Vector3(a[0] * scale, a[1] * scale, a[2] * scale);
        var end = new THREE.Vector3(b[0] * scale, b[1] * scale, b[2] * scale);
        var mid = start.clone().add(end).multiplyScalar(0.5);
        var delta = end.clone().sub(start);
        var length = delta.length();
        var material = new THREE.MeshBasicMaterial({
          color: rainbow[(i + alphaOffset) % rainbow.length],
          transparent: true,
          opacity: opacity,
          blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false
        });
        var tube = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10, 1), material);
        tube.position.copy(mid);
        tube.quaternion.setFromUnitVectors(up, delta.normalize());
        group.add(tube);
      }
      return group;
    }

    var glow = makeEdgeTubes(edges, 1.455, 0.052, 0.20, 1, true);
    cube.add(glow);

    var outer = makeEdgeTubes(edges, 1.45, 0.024, 0.94, 0, false);
    cube.add(outer);

    var crispLines = new THREE.LineSegments(
      buildLineGeometry(edges, 1.45, 0),
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, linewidth: 2 })
    );
    cube.add(crispLines);

    var diagonals = new THREE.LineSegments(
      buildLineGeometry(innerLines, 1.28, 3),
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, linewidth: 2 })
    );
    cube.add(diagonals);

    var pointPositions = [];
    var pointColors = [];
    for (var p = 0; p < vertices.length; p++) {
      var point = vertices[p];
      var pointColor = rainbow[p % rainbow.length];
      pointPositions.push(point[0] * 1.45, point[1] * 1.45, point[2] * 1.45);
      pointColors.push(pointColor.r, pointColor.g, pointColor.b);
    }
    var pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
    pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));
    var points = new THREE.Points(
      pointGeometry,
      new THREE.PointsMaterial({ size: 0.13, vertexColors: true, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending })
    );
    cube.add(points);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var cool = new THREE.PointLight(0x4cc9f0, 0.8, 30); cool.position.set(3, -2, 4); scene.add(cool);
    var warm = new THREE.PointLight(0xff4d6d, 0.7, 30); warm.position.set(-3, 2, 4); scene.add(warm);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var previewCoverMode = new URLSearchParams(window.location.search).get('preview') === 'cover';
    var previewMotionEnabled = !previewCoverMode;
    var t0 = performance.now();
    function renderPose(t) {
      cube.rotation.y = reduce ? -0.58 : t * 0.36 - 0.58;
      cube.rotation.x = reduce ? 0.44 : Math.sin(t * 0.42) * 0.20 + 0.44;
      cube.rotation.z = reduce ? -0.10 : Math.sin(t * 0.28) * 0.07 - 0.10;
      var pulse = reduce ? 1 : 1 + Math.sin(t * 1.2) * 0.014;
      cube.scale.setScalar(pulse);
      renderer.render(scene, camera);
    }
    function frame(now) {
      renderPose((now - t0) / 1000);
      if (!reduce && previewMotionEnabled) requestAnimationFrame(frame);
    }
    function startPreviewMotion() {
      if (!previewCoverMode || previewMotionEnabled || reduce) return;
      previewMotionEnabled = true;
      t0 = performance.now();
      requestAnimationFrame(frame);
    }
    function stopPreviewMotion() {
      if (!previewCoverMode) return;
      previewMotionEnabled = false;
      renderPose(0);
    }
    window.addEventListener('preview-cover-motion-start', startPreviewMotion);
    window.addEventListener('preview-cover-motion-stop', stopPreviewMotion);
    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'preview-cover:start') startPreviewMotion();
      if (event.data && event.data.type === 'preview-cover:stop') stopPreviewMotion();
    });
    requestAnimationFrame(frame);
    if (reduce) renderer.render(scene, camera);

    function onResize() {
      var nw = host.clientWidth || w, nh = host.clientHeight || h;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);
  }
