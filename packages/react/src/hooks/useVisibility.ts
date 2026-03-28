import { useEffect, useState, type RefObject } from 'react';
import type { ElementVisibility } from '@ui-llm/core';

function checkCssVisibility(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.visibility !== 'collapse' &&
    parseFloat(style.opacity) > 0 &&
    el.offsetWidth > 0 &&
    el.offsetHeight > 0
  );
}

export function useVisibility(ref: RefObject<HTMLElement | null>): ElementVisibility {
  const [inViewport, setInViewport] = useState(false);
  const [cssVisible, setCssVisible] = useState(true);

  // IntersectionObserver for viewport visibility
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  // MutationObserver for CSS visibility changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setCssVisible(checkCssVisibility(el));
    update();

    const observer = new MutationObserver(update);
    const observeOptions = {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    };

    // Observe element and its ancestors
    observer.observe(el, observeOptions);
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      observer.observe(parent, observeOptions);
      parent = parent.parentElement;
    }

    return () => observer.disconnect();
  }, [ref]);

  return {
    inViewport,
    cssVisible,
    visible: inViewport && cssVisible,
  };
}
