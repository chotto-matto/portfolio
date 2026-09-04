import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <div className="wrap" style={{ padding: '160px 0 120px', textAlign: 'center' }}>
        <div className="eyebrow">404 / SHEET NOT FOUND</div>
        <h1 style={{ margin: '0 auto' }}>This page hasn't been drafted yet.</h1>
        <p className="sub" style={{ margin: '20px auto 0' }}>
          The route you followed doesn't match any sheet in the set.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '28px' }}>
          ← Back to sheet 01
        </Link>
      </div>
    </section>
  );
}
