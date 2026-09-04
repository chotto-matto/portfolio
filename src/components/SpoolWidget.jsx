import { useEffect, useRef } from 'react';

// Ports the mockup's scroll-driven filament spool animation to a React effect.
export default function SpoolWidget() {
  const spinRef = useRef(null);
  const pctRef = useRef(null);
  const statusRef = useRef(null);
  const feedLineRef = useRef(null);
  const feedTipRef = useRef(null);
  const ringRefs = useRef([]);

  useEffect(() => {
    const rings = ringRefs.current.filter(Boolean);
    const spin = spinRef.current;
    const pct = pctRef.current;
    const status = statusRef.current;
    const feedLine = feedLineRef.current;
    const feedTip = feedTipRef.current;
    if (!rings.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NUM_RINGS = rings.length;

    let lastY = window.scrollY || document.documentElement.scrollTop;
    let angle = 0;
    let idleTimer = null;
    let ticking = false;

    function setStatus(dir) {
      status.className = 'spool-status ' + (dir === 'down' ? 'st-down' : dir === 'up' ? 'st-up' : 'st-idle');
      status.innerHTML = '<span class="dot"></span>' + (dir === 'down' ? 'UNWINDING' : dir === 'up' ? 'REWINDING' : 'IDLE');
    }

    function update() {
      ticking = false;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

      const remaining = (1 - progress) * NUM_RINGS;
      rings.forEach((ring) => {
        const k = parseInt(ring.getAttribute('data-k'), 10);
        const visibility = Math.min(1, Math.max(0, remaining - k));
        ring.style.opacity = visibility;
      });

      pct.textContent = Math.round((1 - progress) * 100) + '%';

      if (feedLine) {
        feedLine.style.transform = 'scaleY(' + progress + ')';
      }
      if (feedTip) {
        const lineTopPx = window.innerHeight * 0.5 + 48;
        const lineMaxPx = window.innerHeight * 0.42;
        feedTip.style.top = (lineTopPx + lineMaxPx * progress) + 'px';
        feedTip.style.opacity = progress > 0.02 ? 0.75 : 0;
      }

      const delta = scrollTop - lastY;
      if (!reduceMotion) {
        angle += delta * 0.55;
        spin.style.transform = 'rotate(' + angle + 'deg)';
      }

      if (delta > 0.5) setStatus('down');
      else if (delta < -0.5) setStatus('up');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setStatus('idle'), 500);

      lastY = scrollTop;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idleTimer);
    };
  }, []);

  const setRingRef = (index) => (el) => {
    ringRefs.current[index] = el;
  };

  return (
    <>
      <div className="spool-widget" id="spoolWidget" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle className="flange-rim" cx="60" cy="60" r="52" strokeWidth="1.4" />
          <circle className="flange-rim" cx="60" cy="60" r="49" strokeWidth="1" opacity="0.5" />
          <g id="spinGroup" ref={spinRef}>
            <circle ref={setRingRef(8)} className="coil-ring" data-k="8" cx="60" cy="60" r="47" fill="none" stroke="var(--rust)" strokeWidth="2.6" />
            <circle ref={setRingRef(7)} className="coil-ring" data-k="7" cx="60" cy="60" r="43.25" fill="none" stroke="var(--rust-dark)" strokeWidth="2.6" />
            <circle ref={setRingRef(6)} className="coil-ring" data-k="6" cx="60" cy="60" r="39.5" fill="none" stroke="var(--rust)" strokeWidth="2.6" />
            <circle ref={setRingRef(5)} className="coil-ring" data-k="5" cx="60" cy="60" r="35.75" fill="none" stroke="var(--rust-dark)" strokeWidth="2.6" />
            <circle ref={setRingRef(4)} className="coil-ring" data-k="4" cx="60" cy="60" r="32" fill="none" stroke="var(--rust)" strokeWidth="2.6" />
            <circle ref={setRingRef(3)} className="coil-ring" data-k="3" cx="60" cy="60" r="28.25" fill="none" stroke="var(--rust-dark)" strokeWidth="2.6" />
            <circle ref={setRingRef(2)} className="coil-ring" data-k="2" cx="60" cy="60" r="24.5" fill="none" stroke="var(--rust)" strokeWidth="2.6" />
            <circle ref={setRingRef(1)} className="coil-ring" data-k="1" cx="60" cy="60" r="20.75" fill="none" stroke="var(--rust-dark)" strokeWidth="2.6" />
            <circle ref={setRingRef(0)} className="coil-ring" data-k="0" cx="60" cy="60" r="17" fill="none" stroke="var(--rust)" strokeWidth="2.6" />
            <circle className="bolt-hole" cx="60" cy="17" r="3.2" />
            <circle className="bolt-hole" cx="88.5" cy="33.5" r="3.2" />
            <circle className="bolt-hole" cx="88.5" cy="86.5" r="3.2" />
            <circle className="bolt-hole" cx="60" cy="103" r="3.2" />
            <circle className="bolt-hole" cx="31.5" cy="86.5" r="3.2" />
            <circle className="bolt-hole" cx="31.5" cy="33.5" r="3.2" />
          </g>
          <circle cx="60" cy="60" r="14" fill="var(--paper)" stroke="var(--blue)" strokeWidth="1.5" />
          <path d="M60 55 L60 65 M55 60 L65 60" stroke="var(--blue)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <div className="spool-label">FILAMENT</div>
        <div className="spool-pct" ref={pctRef} id="spoolPct">100%</div>
        <div className="spool-status st-idle" ref={statusRef} id="spoolStatus"><span className="dot"></span>IDLE</div>
      </div>

      <div className="feed-line" ref={feedLineRef} id="feedLine"></div>
      <div className="feed-tip" ref={feedTipRef} id="feedTip"></div>
    </>
  );
}
