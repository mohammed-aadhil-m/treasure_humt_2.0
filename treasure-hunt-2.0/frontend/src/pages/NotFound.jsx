import { Link } from 'react-router-dom';
import Brand from '../components/Brand';

export default function NotFound() {
  return (
    <div className="th-screen th-center-text">
      <div className="th-container">
        <Brand small />
        <div className="th-panel th-mt-24">
          <h3>404 — NOTHING HERE</h3>
          <p className="th-muted th-mt-8">This clue leads nowhere. Double-check the QR code you scanned.</p>
          <Link to="/" className="th-btn th-btn-primary th-mt-24" style={{ textDecoration: 'none', display: 'block' }}>
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
