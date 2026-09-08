export default function LoadingScreen({ label = 'LOADING…' }) {
  return (
    <div className="th-loading-screen">
      <div className="th-spinner" />
      <span>{label}</span>
    </div>
  );
}
