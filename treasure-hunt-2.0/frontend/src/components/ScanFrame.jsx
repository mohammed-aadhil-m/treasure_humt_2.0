export default function ScanFrame({ children, animate = true }) {
  return (
    <div className="th-scan-frame">
      <span className="th-corner-tl" />
      <span className="th-corner-tr" />
      <span className="th-corner-bl" />
      <span className="th-corner-br" />
      {animate && <span className="th-scanline" />}
      {children}
    </div>
  );
}
