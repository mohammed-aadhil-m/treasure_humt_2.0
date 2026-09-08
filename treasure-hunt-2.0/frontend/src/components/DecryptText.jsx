import { useEffect, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_/[]{}=+*#';

// A short "decrypting" scramble-to-reveal effect for hint text — the one
// signature motion in the app, tied directly to the QR-hunt/mystery premise.
export default function DecryptText({ text, className, speed = 26 }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let frame = 0;
    const revealDelay = 8;
    const id = setInterval(() => {
      frame += 1;
      const revealCount = Math.max(0, frame - revealDelay);
      let out = '';
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === ' ' || i < revealCount) {
          out += text[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(out);
      if (revealCount >= text.length) clearInterval(id);
    }, speed);

    return () => clearInterval(id);
  }, [text, speed]);

  return <span className={className}>{display}</span>;
}
