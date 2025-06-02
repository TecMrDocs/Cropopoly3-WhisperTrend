function forceHoverPermanent(container) {
  let children = Array.from(container.querySelectorAll('*'));

  const overEvent = new MouseEvent('mouseover', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  const pointerOverEvent = new PointerEvent('pointerover', {
    bubbles: true,
    cancelable: true
  });
  const focusEvent = new FocusEvent('focus', {
    bubbles: true,
    cancelable: true
  });

  function injectEvents() {
    children.forEach(child => {
      if (document.body.contains(child)) {
        child.dispatchEvent(overEvent);
        child.dispatchEvent(pointerOverEvent);
        try {
          child.dispatchEvent(focusEvent);
        } catch (e) {
        }
      }
    });
  }

  let rafId;
  function rafLoop() {
    injectEvents();
    rafId = requestAnimationFrame(rafLoop);
  }
  rafLoop();

  const observer = new MutationObserver((_) => {
    children = Array.from(container.querySelectorAll('*'));
  });
  observer.observe(container, { childList: true, subtree: true });

  return {
    stop: () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    }
  };
}