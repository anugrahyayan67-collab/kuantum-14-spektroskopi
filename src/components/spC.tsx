// Komponen bersama adegan grup C (raman, electronic, translation).
import React from 'react';
import {C, FONT} from '../theme';

/** Integral ∫₀ᵗ f(τ) dτ (trapesium, langkah 1/30 dtk) — fase yang tetap mulus saat laju berubah. */
export const integ = (f: (t: number) => number, t: number, t0 = -1, dt = 1 / 30) => {
  if (t <= t0) return 0;
  const n = Math.ceil((t - t0) / dt);
  const h = (t - t0) / n;
  let s = 0.5 * (f(t0) + f(t));
  for (let i = 1; i < n; i++) s += f(t0 + i * h);
  return s * h;
};

export const gauss = (x: number, mu: number, sig: number) => Math.exp(-0.5 * ((x - mu) / sig) ** 2);

/** Foton kecil: potongan gelombang sinus berselubung Gauss (tanpa filter, murah). */
export const Wavelet: React.FC<{x: number; y: number; angle: number; color: string; len?: number; amp?: number; wl?: number; opacity?: number; phase?: number}> = ({
  x,
  y,
  angle,
  color,
  len = 64,
  amp = 8,
  wl = 14,
  opacity = 1,
  phase = 0,
}) => {
  if (opacity <= 0.01) return null;
  const n = 28;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = -len / 2 + (len * i) / n;
    const v = amp * Math.exp(-((u / (len * 0.3)) ** 2)) * Math.sin((2 * Math.PI * u) / wl + phase);
    d += `${i ? 'L' : 'M'}${u.toFixed(1)},${v.toFixed(1)}`;
  }
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((angle * 180) / Math.PI).toFixed(2)})`} opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeWidth={9} strokeOpacity={0.22} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

/** Berkas cahaya lurus: garis lebar transparan sebagai pendar + inti (tanpa filter). */
export const Beam: React.FC<{x1: number; y1: number; x2: number; y2: number; color: string; width?: number; opacity?: number}> = ({x1, y1, x2, y2, color, width = 8, opacity = 1}) =>
  opacity <= 0.005 || Math.hypot(x2 - x1, y2 - y1) < 1 ? null : (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width * 4} strokeOpacity={0.1} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width * 2} strokeOpacity={0.18} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width * 0.6} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={width * 0.18} strokeOpacity={0.7} strokeLinecap="round" />
    </g>
  );

/** Medali sederhana (tanpa wajah) untuk lencana penghargaan, HTML-inline SVG. */
export const Medal: React.FC<{size?: number; t: number}> = ({size = 86, t}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 80 100" style={{display: 'block', overflow: 'visible'}}>
    <path d="M24,0 L40,34 L56,0 Z" fill={C.cyan} opacity={0.75} />
    <path d="M32,0 L40,18 L48,0 Z" fill={C.blue} />
    <circle cx={40} cy={62} r={32} fill="#b07a12" />
    <circle cx={40} cy={62} r={27} fill={C.gold} />
    <circle cx={40} cy={62} r={20} fill="none" stroke="#8a5a10" strokeWidth={2} />
    {Array.from({length: 8}, (_, k) => {
      const a = (k / 8) * Math.PI * 2 + t * 0.4;
      return <circle key={k} cx={40 + 23.5 * Math.cos(a)} cy={62 + 23.5 * Math.sin(a)} r={1.6} fill="#fff4cc" />;
    })}
    <text x={40} y={63} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontWeight={600} fontSize={22} fill="#5a3a06">
      ν
    </text>
    <ellipse cx={30} cy={50} rx={8} ry={4} fill="#fff" opacity={0.35 + 0.2 * Math.sin(t * 2)} transform="rotate(-30 30 50)" />
  </svg>
);

/** Stopwatch: jarum berputar sesuai sudut `ang` (radian); `frost` 0..1 = tampilan membeku. */
export const Stopwatch: React.FC<{x: number; y: number; r?: number; ang: number; frost?: number; opacity?: number}> = ({x, y, r = 48, ang, frost = 0, opacity = 1}) =>
  opacity <= 0.005 ? null : (
    <g opacity={opacity}>
      <rect x={x - 8} y={y - r - 16} width={16} height={12} rx={3} fill={C.muted} />
      <circle cx={x} cy={y} r={r + 6} fill="#0b1124" stroke={C.muted} strokeWidth={4} />
      <circle cx={x} cy={y} r={r + 6} fill={C.cyan} opacity={0.18 * frost} />
      <circle cx={x} cy={y} r={r + 14} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.7 * frost} strokeDasharray="6 8" />
      {Array.from({length: 12}, (_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return <line key={k} x1={x + Math.sin(a) * r * 0.82} y1={y - Math.cos(a) * r * 0.82} x2={x + Math.sin(a) * r * 0.95} y2={y - Math.cos(a) * r * 0.95} stroke={C.muted} strokeWidth={2.5} />;
      })}
      <line x1={x} y1={y} x2={x + Math.sin(ang) * r * 0.8} y2={y - Math.cos(ang) * r * 0.8} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
      <circle cx={x} cy={y} r={5} fill={C.gold} />
    </g>
  );
