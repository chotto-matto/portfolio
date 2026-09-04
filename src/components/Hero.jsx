export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap" style={{ display: 'contents' }}>
        <div>
          <div className="eyebrow">SHEET 01 / REV 03 — OPEN FOR GAME &amp; WEB ROLES</div>
          <h1>I draft the plan, then <em>build</em> it — in code, in mesh, and in PLA.</h1>
          <p className="sub">
            Full-stack game &amp; web developer. Most projects ship with assets I modeled myself and
            a soundtrack I wrote — one plan, carried through every material.
          </p>
          <div className="spec-tags">
            <span className="spec-tag">TypeScript</span>
            <span className="spec-tag">Three.js</span>
            <span className="spec-tag">Unity / C#</span>
            <span className="spec-tag">Blender</span>
            <span className="spec-tag">PrusaSlicer</span>
          </div>
          <div className="hero-ctas">
            <a href="#work" className="btn-primary">View work →</a>
            <a href="#" className="btn-ghost">▶ Play latest demo</a>
          </div>
        </div>

        <div className="titleblock">
          <div className="tb-row">
            <div className="tb-cell"><div className="k">DRAWN BY</div><div className="v">J. Kade</div></div>
            <div className="tb-cell"><div className="k">SCALE</div><div className="v">1 : 1</div></div>
          </div>
          <div className="tb-row">
            <div className="tb-cell"><div className="k">SHEET</div><div className="v">01 OF 04</div></div>
            <div className="tb-cell"><div className="k">DATE</div><div className="v">2026.07.30</div></div>
          </div>
          <div className="tb-queue">
            <div className="k">PRINT QUEUE — CURRENT DISCIPLINES</div>
            <div className="queue-item"><span className="name">game_dev.stl</span><span className="status complete"><span className="dot"></span>COMPLETE</span></div>
            <div className="queue-item"><span className="name">web_dev.stl</span><span className="status complete"><span className="dot"></span>COMPLETE</span></div>
            <div className="queue-item"><span className="name">model_assets.stl</span><span className="status printing"><span className="dot"></span>PRINTING</span></div>
            <div className="queue-item"><span className="name">soundtrack.wav</span><span className="status queued"><span className="dot"></span>QUEUED</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
