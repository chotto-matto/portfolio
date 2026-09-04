import { bomItems } from '../data/portfolioData';

export default function MaterialsSection() {
  return (
    <section id="lab">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">03 / MATERIALS</div>
            <div className="section-title">Bill of materials</div>
          </div>
          <a href="#" className="section-link">See all craft work →</a>
        </div>
        <p className="bom-note">
          Everything below mostly exists to serve the projects above — assets, prints, and sound
          built for the games and sites, not separate from them.
        </p>

        <table className="bom">
          <thead>
            <tr><th>Item</th><th>Description</th><th>Material / Tool</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {bomItems.map((row) => (
              <tr key={row.no}>
                <td className="bom-no">{row.no}</td>
                <td className="bom-desc">{row.desc}</td>
                <td className="bom-material">{row.material}</td>
                <td className="bom-notes">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
