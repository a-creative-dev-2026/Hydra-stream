export function getAdRemovalScript() {
  return `
(function() {
  const badWords = /ad|ads|banner|popup|sponsor|promo|overlay|preroll|midroll|advert|doubleclick|taboola|outbrain|juicy|exoclick|popads|adsterra|propeller/i;

  function isBad(el) {
    if (!el || el.nodeType !== 1) return false;
    const id = (el.id || '').toLowerCase();
    const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
    const src = (el.src || el.href || '').toLowerCase();
    return badWords.test(id + ' ' + cls + ' ' + src);
  }

  function clean() {
    document.querySelectorAll('div, iframe, ins, section, aside, span').forEach(function(el) {
      if (isBad(el)) {
        try { el.remove(); } catch(e) {}
      }
    });

    document.querySelectorAll('[style*="fixed"],[style*="absolute"]').forEach(function(el) {
      if (isBad(el) || (el.offsetWidth > 300 && el.offsetHeight > 250)) {
        try { el.remove(); } catch(e) {}
      }
    });

    document.querySelectorAll('body > div, body > iframe').forEach(function(el) {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'absolute') {
        if (parseInt(style.zIndex) > 10) {
          el.style.display = 'none';
        }
      }
    });
  }

  clean();
  setInterval(clean, 800);

  const obs = new MutationObserver(function() { clean(); });
  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      obs.observe(document.body, { childList: true, subtree: true });
    });
  }

  window.open = function() { return null; };

  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (a && a.href && badWords.test(a.href)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
`;
}
