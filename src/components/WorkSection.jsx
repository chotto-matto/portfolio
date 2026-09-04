import { workItems } from '../data/portfolioData';

export default function WorkSection() {
  return (
    <section id="work">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">02 / SELECTED WORK</div>
            <div className="section-title">Shipped &amp; playable</div>
          </div>
          <a href="#" className="section-link">Full case studies →</a>
        </div>

        <div className="work-grid">
          {workItems.map((item) => (
            <div className="spec-card" key={item.title}>
              <div className="spec-screen">
                <div className="dim-corner tl"></div>
                <div className="dim-corner br"></div>
                <span className="play-badge">{item.badge}</span>
              </div>
              <div className="card-body">
                <div className="card-title">{item.title}</div>
                <p className="card-desc">{item.description}</p>
                <div className="layer-bar"></div>
                <div className="tb-strip">
                  <span><b>SCALE</b> {item.scale}</span>
                  <span><b>REV</b> {item.rev}</span>
                  <span><b>STATUS</b> {item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
