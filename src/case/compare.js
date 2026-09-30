// Before/after image slider for case pages — same behavior as the deck's
// MeshCompare: follows the pointer on hover and drags on touch. It stays where
// the pointer left it (clamped to the edges) rather than snapping back to center.
export function setupCompare(root = document) {
  root.querySelectorAll('[data-compare]').forEach(host => {
    let activePointerId = null;

    function setPosition(clientX) {
      const rect = host.getBoundingClientRect();
      if (!rect.width) return;
      const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      host.style.setProperty('--compare-pos', `${percent.toFixed(2)}%`);
    }

    function endPointer(event) {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      try { host.releasePointerCapture(event.pointerId); } catch (_) {}
    }

    host.addEventListener('pointerenter', event => setPosition(event.clientX));
    host.addEventListener('pointermove', event => {
      if (activePointerId !== null && event.pointerId !== activePointerId) return;
      setPosition(event.clientX);
    });
    host.addEventListener('pointerdown', event => {
      activePointerId = event.pointerId;
      try { host.setPointerCapture(event.pointerId); } catch (_) {}
      setPosition(event.clientX);
    });
    // Leaving past a side edge pins the divider to that edge.
    host.addEventListener('pointerleave', event => {
      if (activePointerId === null) setPosition(event.clientX);
    });
    host.addEventListener('pointerup', endPointer);
    host.addEventListener('pointercancel', endPointer);
  });
}
