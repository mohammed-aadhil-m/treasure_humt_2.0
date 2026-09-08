import { useEffect, useState } from 'react';
import { API_URL } from '../services/api';

// Fetches an admin-only QR PNG with an Authorization header (an <img src>
// alone can't send headers) and exposes the resulting object URL so the
// caller can also offer a download button.
export default function QrImage({ token, path, alt, size = 220, onLoaded }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load QR image.');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setSrc(objectUrl);
          if (onLoaded) onLoaded(objectUrl);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, path]);

  if (error) {
    return (
      <div className="th-feedback th-feedback-error" style={{ fontSize: 12 }}>
        ⚠️ {error}
      </div>
    );
  }
  if (!src) return <div className="th-spinner" />;

  return <img src={src} alt={alt} width={size} height={size} style={{ display: 'block' }} />;
}
