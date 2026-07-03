// Cover 3D object (three.js), page-specific.
import * as THREE from 'three';

export function initCover3d() {
    var host = document.getElementById('coverHeart');
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    var w = host.clientWidth || 1200, h = host.clientHeight || 800;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 0, 10.2);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    host.appendChild(renderer.domElement);

    // Faceted "digital identity" orb
    var geo = new THREE.IcosahedronGeometry(2.15, 2);

    var mat = new THREE.MeshStandardMaterial({
      color: 0x0d9488, roughness: 0.38, metalness: 0.2,
      emissive: 0x00241f, emissiveIntensity: 0.5, flatShading: true
    });
    var heart = new THREE.Group();
    var orb = new THREE.Mesh(geo, mat);
    heart.add(orb);
    var wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.26 })
    );
    wire.scale.setScalar(1.012);
    heart.add(wire);
    heart.scale.set(1.0, 1.0, 1.0);
    scene.add(heart);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0x14b8a6, 1.2); rim.position.set(-4, -1, 2); scene.add(rim);
    var fill = new THREE.PointLight(0x5eead4, 0.9, 30); fill.position.set(0, 0, 4); scene.add(fill);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var previewCoverMode = new URLSearchParams(window.location.search).get('preview') === 'cover';
    var previewMotionEnabled = !previewCoverMode;
    var t0 = performance.now();
    var motionFrame = 0;
    var returnFrame = 0;
    var currentPose = poseAt(0);
    function poseAt(t) {
      // Gentle rotation + heartbeat pulse
      var beat = reduce ? 1 : 1 + (Math.pow(Math.sin(t * 1.8), 8)) * 0.05 + (Math.pow(Math.sin(t * 1.8 - 0.28), 8)) * 0.03;
      return {
        ry: reduce ? -0.35 : Math.sin(t * 0.35) * 0.55 - 0.15,
        rx: reduce ? 0.12 : Math.sin(t * 0.5) * 0.08 + 0.08,
        scale: 1.0 * beat
      };
    }
    function applyPose(pose) {
      currentPose = pose;
      heart.rotation.y = pose.ry;
      heart.rotation.x = pose.rx;
      heart.scale.setScalar(pose.scale);
      renderer.render(scene, camera);
    }
    function renderPose(t) {
      applyPose(poseAt(t));
    }
    function lerpPose(from, to, eased) {
      return {
        ry: from.ry + (to.ry - from.ry) * eased,
        rx: from.rx + (to.rx - from.rx) * eased,
        scale: from.scale + (to.scale - from.scale) * eased
      };
    }
    function frame(now) {
      motionFrame = 0;
      if (!previewMotionEnabled && previewCoverMode) return;
      renderPose((now - t0) / 1000);
      if (!reduce && previewMotionEnabled) motionFrame = requestAnimationFrame(frame);
    }
    function startPreviewMotion() {
      if (!previewCoverMode || previewMotionEnabled || reduce) return;
      cancelAnimationFrame(returnFrame);
      returnFrame = 0;
      previewMotionEnabled = true;
      t0 = performance.now();
      if (!motionFrame) motionFrame = requestAnimationFrame(frame);
    }
    function stopPreviewMotion() {
      if (!previewCoverMode) return;
      previewMotionEnabled = false;
      cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      cancelAnimationFrame(returnFrame);
      var from = currentPose;
      var to = poseAt(0);
      var startTime = performance.now();
      var duration = 560;
      function tick(now) {
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        applyPose(lerpPose(from, to, eased));
        if (progress < 1) {
          returnFrame = requestAnimationFrame(tick);
          return;
        }
        returnFrame = 0;
        renderPose(0);
      }
      returnFrame = requestAnimationFrame(tick);
    }
    window.addEventListener('preview-cover-motion-start', startPreviewMotion);
    window.addEventListener('preview-cover-motion-stop', stopPreviewMotion);
    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'preview-cover:start') startPreviewMotion();
      if (event.data && event.data.type === 'preview-cover:stop') stopPreviewMotion();
    });
    if (previewCoverMode || reduce) {
      renderPose(0);
    } else {
      motionFrame = requestAnimationFrame(frame);
    }

    function onResize() {
      var nw = host.clientWidth || w, nh = host.clientHeight || h;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);
  }
