import { useEffect, useState, useMemo } from 'react';
import './Wormhole.css';

export default function Wormhole({ onComplete }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 1000);
    const t2 = setTimeout(() => setPhase('flash'), 2400);
    const t3 = setTimeout(() => setPhase('exit'), 2800);
    const t4 = setTimeout(onComplete, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const rings = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      delay: i * 0.07,
      hue: 260 + i * 5,
    })), []
  );

  const stars = useMemo(() =>
    Array.from({ length: 80 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 60;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        delay: Math.random() * 1.8,
        duration: 0.5 + Math.random() * 0.8,
        size: 1 + Math.random() * 2.5,
      };
    }), []
  );

  return (
    <div className={`wormhole wormhole--${phase}`}>
      <div className="wormhole__glow" />
      {rings.map((r, i) => (
        <div key={i} className="wormhole__ring" style={{
          animationDelay: `${r.delay}s`,
          borderColor: `hsla(${r.hue}, 80%, 55%, 0.7)`,
          boxShadow: `0 0 12px hsla(${r.hue}, 80%, 55%, 0.3)`,
        }} />
      ))}
      {stars.map((s, i) => (
        <div key={`s${i}`} className="wormhole__star" style={{
          '--dx': `${s.dx}vmin`, '--dy': `${s.dy}vmin`,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
          width: `${s.size}px`, height: `${s.size}px`,
        }} />
      ))}
      <div className="wormhole__flash" />
      <div className="wormhole__text">
        <div className="wormhole__text-icon">🌀</div>
        <div className="wormhole__text-sub">ENTERING</div>
        <div className="wormhole__text-main">SUPER DEPTH</div>
        <div className="wormhole__text-mode">MODE ACTIVATED</div>
      </div>
    </div>
  );
}
