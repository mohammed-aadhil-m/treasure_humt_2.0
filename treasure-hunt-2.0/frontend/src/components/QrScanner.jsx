import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import ScanFrame from './ScanFrame';

export default function QrScanner({
  onScan,
  busy = false,
  title = 'SCAN CHECKPOINT QR CODE',
  subtitle = 'Point your camera at the QR code displayed on the screen.',
  targetCheckpoint = 1,
}) {
  const containerIdRef = useRef(`th-reader-${Math.random().toString(36).slice(2, 9)}`);
  const scannerContainerId = containerIdRef.current;
  const html5QrCodeRef = useRef(null);
  const scanLockRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [detectedToken, setDetectedToken] = useState(null);

  const extractToken = (rawText) => {
    if (!rawText) return '';
    const trimmed = rawText.trim();
    // Check for standard hunt URL format: /hunt/qr/<token>
    const match = trimmed.match(/\/hunt\/qr\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    // Clean query params / hash and get last path segment
    const clean = trimmed.split('?')[0].split('#')[0];
    const parts = clean.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart || trimmed;
  };

  const handleScanSuccess = async (decodedText) => {
    if (busy || scanLockRef.current) return;
    const token = extractToken(decodedText);
    if (!token) return;

    scanLockRef.current = true;
    setDetectedToken(token);

    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {
        // ignore
      }
    }

    try {
      await onScan(token);
    } catch (err) {
      // Re-enable scanning if backend rejected the token
      setTimeout(() => {
        setDetectedToken(null);
        scanLockRef.current = false;
      }, 2000);
    }
  };

  // Start camera scanner
  const startCamera = async (cameraIdOrFacing = { facingMode: 'environment' }) => {
    setCameraError(null);
    try {
      const containerEl = document.getElementById(scannerContainerId);
      if (!containerEl) return;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        });
      }
      const scanner = html5QrCodeRef.current;

      if (scanner.isScanning) {
        await scanner.stop();
      }

      // Check available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
        }
      } catch {
        // device enumeration not always permitted before getUserMedia
      }

      await scanner.start(
        cameraIdOrFacing,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.max(140, Math.floor(minEdge * 0.85));
            return { width: edge, height: edge };
          },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // ignore frame decode misses
        }
      );

      setCameraActive(true);
      if (typeof cameraIdOrFacing === 'string') {
        setCurrentCameraId(cameraIdOrFacing);
      }
    } catch (err) {
      console.warn('Camera start failed:', err);
      setCameraActive(false);

      const isSecure = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let msg = 'Unable to access camera. Please allow camera permissions in your browser.';
      if (!isSecure && !isLocalhost) {
        msg = 'Mobile browsers block camera access on HTTP IP addresses. Use the Manual Code or Fast-Track button below.';
      }
      setCameraError(msg);
      setShowManualInput(true); // Automatically reveal manual code option!
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setCameraActive(false);
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    await startCamera(nextCamera.id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }
      const scanner = html5QrCodeRef.current;
      if (scanner.isScanning) {
        await scanner.stop();
        setCameraActive(false);
      }
      const decodedText = await scanner.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      setCameraError('No valid QR code found in the image. Please try another photo or enter code manually.');
      setShowManualInput(true);
    } finally {
      e.target.value = '';
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    const token = extractToken(manualCode);
    if (!token) {
      setManualError('Please enter a valid checkpoint code or URL.');
      return;
    }
    setManualError(null);
    setDetectedToken(token);
    onScan(token);
  };

  // Mount effect: Auto-start camera
  useEffect(() => {
    // slight timeout to guarantee DOM attachment
    const timer = setTimeout(() => {
      startCamera();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => html5QrCodeRef.current?.clear())
            .catch(() => {});
        } else {
          try {
            html5QrCodeRef.current.clear();
          } catch {
            // ignore
          }
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="th-flex-col th-center-text" style={{ gap: 16 }}>
      <div>
        <span className="th-badge th-badge-cyan" style={{ letterSpacing: '0.15em' }}>
          CHECKPOINT #{targetCheckpoint} SCANNER
        </span>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, marginTop: 10 }}>{title}</h2>
        <p className="th-muted th-mt-8" style={{ fontSize: 14 }}>
          {subtitle}
        </p>
      </div>

      {detectedToken && (
        <div
          className="th-panel th-anim-pop"
          style={{
            borderColor: 'var(--green)',
            background: 'rgba(57, 255, 142, 0.08)',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: 24 }}>✅</div>
          <div style={{ fontWeight: 700, color: 'var(--green)', marginTop: 6 }}>
            Checkpoint Detected: <span className="th-mono">{detectedToken}</span>
          </div>
          <div className="th-mono th-muted th-mt-4" style={{ fontSize: 12 }}>
            Verifying checkpoint with server…
          </div>
        </div>
      )}

      {/* Viewfinder Container */}
      <ScanFrame animate={cameraActive}>
        <div
          id={scannerContainerId}
          style={{
            width: '100%',
            maxWidth: 320,
            minHeight: cameraActive ? 250 : 60,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#05070e',
            position: 'relative',
          }}
        />

        {cameraActive && !detectedToken && (
          <div className="th-faint th-mono th-mt-12" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
            ALIGN QR CODE WITHIN VIEWFINDER
          </div>
        )}
      </ScanFrame>

      {/* Camera controls */}
      <div className="th-flex-row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        {cameras.length > 1 && (
          <button
            type="button"
            className="th-btn th-btn-ghost th-btn-sm"
            onClick={switchCamera}
            disabled={busy}
          >
            🔄 Flip Camera
          </button>
        )}

        <label
          className="th-btn th-btn-ghost th-btn-sm"
          style={{ cursor: 'pointer', margin: 0 }}
        >
          📁 Upload QR Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </label>

        {!cameraActive && (
          <button
            type="button"
            className="th-btn th-btn-ghost th-btn-sm"
            onClick={() => startCamera()}
            disabled={busy}
          >
            🎥 Retry Camera
          </button>
        )}

        <button
          type="button"
          className="th-btn th-btn-ghost th-btn-sm"
          onClick={() => setShowManualInput(!showManualInput)}
        >
          ⌨️ {showManualInput ? 'Hide Code Entry' : 'Enter Code Manually'}
        </button>
      </div>

      {cameraError && (
        <div className="th-feedback th-feedback-error" style={{ fontSize: 13, textAlign: 'left' }}>
          ⚠️ {cameraError}
        </div>
      )}

      {/* Manual Code Entry Accordion */}
      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          className="th-panel th-anim-fade-up th-mt-8"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px',
            textAlign: 'left',
          }}
        >
          <label className="th-label" htmlFor="manual-token-input">
            Enter Checkpoint #{targetCheckpoint} Code or URL
          </label>
          <div className="th-flex-row th-mt-8" style={{ gap: 8 }}>
            <input
              id="manual-token-input"
              className="th-input"
              placeholder="Paste scan link or checkpoint code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              disabled={busy}
            />
            <button
              type="submit"
              className="th-btn th-btn-primary"
              style={{ whiteSpace: 'nowrap' }}
              disabled={busy || !manualCode.trim()}
            >
              {busy ? '⏳ SUBMITTING…' : 'SUBMIT'}
            </button>
          </div>
          {manualError && (
            <div className="th-feedback th-feedback-error th-mt-8" style={{ fontSize: 12 }}>
              {manualError}
            </div>
          )}
          <p className="th-faint th-mt-8" style={{ fontSize: 11 }}>
            💡 Tip: If your device camera is unavailable, you can paste the scanned QR link or checkpoint code.
          </p>
        </form>
      )}
    </div>
  );
}
