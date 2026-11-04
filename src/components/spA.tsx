import React from 'react';
import {rand} from '../anim';
import {C, FONT} from '../theme';
import {type Mol} from './syD';
import {wlColor} from './viz';

// Komponen grup A (hook, judul, peta, tangga energi, penggaris spektrum, Boltzmann).

/* ------------------------------------------------------------------ */
/* Molekul CO (C–O ≈ 113 pm), pusat massa di titik asal.                 */
/* ------------------------------------------------------------------ */
const R_CO = 1.13;
export const CO_MC = 12;
export const CO_MO = 16;
/** CO di sepanjang x; `stretch` = perpanjangan ikatan (satuan dunia), pusat massa tetap. */
export const coMol = (stretch = 0): Mol => {
  const r = R_CO + stretch;
  const xc = (-r * CO_MO) / (CO_MC + CO_MO);
  const xo = (r * CO_MC) / (CO_MC + CO_MO);
  return {
    atoms: [
      {pos: [xc, 0, 0], el: 'C', q: 0.1},
      {pos: [xo, 0, 0], el: 'O', q: -0.1},
    ],
    bonds: [{a: 0, b: 1, order: 3}],
  };
};

/* ------------------------------------------------------------------ */
/* Latar bintang berkelip.                                              */
/* ------------------------------------------------------------------ */
export const Starfield: React.FC<{t: number; n?: number; opacity?: number; y0?: number; y1?: number; seed?: number}> = ({t, n = 140, opacity = 1, y0 = 0, y1 = 900, seed = 1}) => {
  if (opacity <= 0.003) return null;
  return (
    <g opacity={opacity}>
      {Array.from({length: n}, (_, i) => {
        const x = rand(i * 1.37 + seed) * 1920;
        const y = y0 + rand(i * 2.11 + seed * 3) * (y1 - y0);
        const r = 0.8 + rand(i * 3.7 + seed) * 1.8;
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (0.8 + rand(i) * 1.6) + i));
        return <circle key={i} cx={x} cy={y} r={r} fill={i % 7 === 0 ? '#cfe0ff' : i % 11 === 0 ? '#ffe3b0' : '#ffffff'} opacity={0.18 + 0.5 * tw * rand(i * 5.3)} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Teleskop bercermin segi enam emas (gaya umum, tanpa logo).            */
/* ------------------------------------------------------------------ */
const hexPath = (cx: number, cy: number, r: number) =>
  Array.from({length: 6}, (_, k) => {
    const a = (Math.PI / 3) * k;
    return `${k ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + ' Z';

// 18 segmen: cincin 1 (6) + cincin 2 (12), pusat kosong.
const HEX_AX: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let q = -2; q <= 2; q++)
    for (let r = -2; r <= 2; r++) {
      const s = -q - r;
      const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      if (d === 1 || d === 2) out.push([q, r]);
    }
  return out;
})();

export const HexTelescope: React.FC<{x: number; y: number; s?: number; t: number; opacity?: number; lit?: number}> = ({x, y, s = 1, t, opacity = 1, lit = 0}) => {
  if (opacity <= 0.003) return null;
  const r = 22;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      {/* perisai matahari berlapis */}
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={`M${-150 + k * 6},${118 + k * 9} L0,${92 + k * 9} L${150 - k * 6},${118 + k * 9} L0,${150 + k * 7} Z`} fill={k % 2 ? '#3d3a66' : '#5a4f8a'} opacity={0.75 - k * 0.1} stroke="#a79cdf" strokeWidth={1} strokeOpacity={0.4} />
      ))}
      <circle r={150} fill="url(#soft-gold)" opacity={0.3 + 0.35 * lit} />
      {HEX_AX.map(([q, rr], i) => {
        const hx = r * 1.5 * q;
        const hy = r * Math.sqrt(3) * (rr + q / 2);
        const sh = 0.5 + 0.5 * Math.sin(t * 1.6 - (hx + hy) * 0.03);
        return (
          <g key={i}>
            <path d={hexPath(hx, hy, r * 0.94)} fill="#c9922c" stroke="#ffe39a" strokeWidth={1.4} />
            <path d={hexPath(hx, hy, r * 0.94)} fill="#fff3c4" opacity={0.08 + 0.3 * sh * (0.4 + 0.6 * lit)} />
          </g>
        );
      })}
      {/* penyangga cermin sekunder */}
      <g stroke="#9aa6c6" strokeWidth={2.5} opacity={0.85}>
        <path d="M-70,-50 L0,-128" fill="none" />
        <path d="M70,-50 L0,-128" fill="none" />
        <path d="M0,70 L0,-128" fill="none" strokeOpacity={0.5} />
      </g>
      <circle cx={0} cy={-128} r={9} fill="#ffe39a" stroke="#fff" strokeWidth={1.5} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Pita spektrum dengan celah serapan.                                  */
/* ------------------------------------------------------------------ */
export type Gap = {u: number; w: number; depth: number};
/** Strip warna (u 0..1 → warna) dengan celah gelap; `reveal` 0..1 dari kiri. */
export const AbsStrip: React.FC<{x: number; y: number; w: number; h: number; color: (u: number) => string; gaps: Gap[]; reveal?: number; opacity?: number; n?: number}> = ({
  x,
  y,
  w,
  h,
  color,
  gaps,
  reveal = 1,
  opacity = 1,
  n = 160,
}) => {
  if (opacity <= 0.003 || reveal <= 0) return null;
  const nShow = Math.ceil(n * Math.min(1, reveal));
  const cw = w / n;
  return (
    <g opacity={opacity}>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={10} fill="#05070f" stroke={C.faint} strokeWidth={1.5} />
      {Array.from({length: nShow}, (_, k) => {
        const u = (k + 0.5) / n;
        let a = 0;
        for (const g of gaps) a = Math.max(a, g.depth * Math.exp(-(((u - g.u) / g.w) ** 2)));
        const edge = Math.min(1, (nShow - k) / 4);
        return <rect key={k} x={x + k * cw - 0.3} y={y} width={cw + 0.6} height={h} fill={color(u)} opacity={(1 - 0.94 * a) * edge} />;
      })}
    </g>
  );
};

/** Warna semu untuk strip IR (gaya grafik JWST): ungu → biru → hijau → kuning → merah. */
export const falseColor = (u: number) => wlColor(400 + 300 * Math.max(0, Math.min(1, u)));

/* ------------------------------------------------------------------ */
/* Gelombang sinus berjalan (garis), panjang gelombang boleh berubah.    */
/* ------------------------------------------------------------------ */
export const wavePath = (x0: number, x1: number, y: number, lam: (x: number) => number, amp: number, phase: number, n = 300) => {
  let ph = 0;
  let d = '';
  const dx = (x1 - x0) / n;
  for (let k = 0; k <= n; k++) {
    const x = x0 + k * dx;
    if (k) ph += (2 * Math.PI * dx) / lam(x);
    const env = Math.min(1, k / 20, (n - k) / 20);
    d += `${k ? 'L' : 'M'}${x.toFixed(1)},${(y - amp * env * Math.sin(ph - phase)).toFixed(1)}`;
  }
  return d;
};

/* ------------------------------------------------------------------ */
/* Daun & ikon sidik jari (SVG sederhana).                               */
/* ------------------------------------------------------------------ */
export const Leaf: React.FC<{x: number; y: number; s?: number; t: number; opacity?: number}> = ({x, y, s = 1, t, opacity = 1}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s}) rotate(${-20 + 5 * Math.sin(t * 1.2)})`}>
    <path d="M0,40 Q2,10 0,0" stroke="#2f9a52" strokeWidth={4} fill="none" />
    <path d="M0,0 C34,-16 46,-56 0,-104 C-46,-56 -34,-16 0,0 Z" fill="#35b45f" stroke="#9cf0b4" strokeWidth={2} />
    <path d="M0,-4 L0,-94" stroke="#c9ffd8" strokeWidth={2} opacity={0.8} />
    {[-1, 1].map((sd) => [22, 44, 66].map((yy, j) => <path key={`${sd}${j}`} d={`M0,${-yy} Q${sd * 14},${-yy - 8} ${sd * 24},${-yy - 18}`} fill="none" stroke="#c9ffd8" strokeWidth={1.4} opacity={0.6} />))}
  </g>
);

export const Fingerprint: React.FC<{x: number; y: number; s?: number; color?: string; opacity?: number; p?: number}> = ({x, y, s = 1, color = C.amber, opacity = 1, p = 1}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
    {[10, 18, 26, 34, 42].map((r, k) => (
      <path key={k} d={`M${-r * 0.9},${r * 0.5} C${-r},${-r * 1.2} ${r},${-r * 1.2} ${r * 0.9},${r * 0.6}`} pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - Math.min(1, p * 1.4 - k * 0.1))} opacity={0.9 - k * 0.1} />
    ))}
  </g>
);

/** Label kecil berbingkai kapsul di SVG. */
export const Tag: React.FC<{x: number; y: number; text: React.ReactNode; color: string; opacity?: number; size?: number; w?: number}> = ({x, y, text, color, opacity = 1, size = 24, w}) => {
  if (opacity <= 0.003) return null;
  const ww = w ?? size * 4.2;
  return (
    <g opacity={opacity}>
      <rect x={x - ww / 2} y={y - size * 0.85} width={ww} height={size * 1.7} rx={size * 0.85} fill="rgba(8,12,28,0.88)" stroke={color} strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};
