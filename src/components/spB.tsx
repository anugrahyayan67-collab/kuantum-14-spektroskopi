// Komponen grup B (selection, rotation, rovib): molekul diatomik berputar, foton spiral, spektrum garis.
// Sumbu dunia mengikuti vbC: x kanan, y menjauh, z atas; 1 satuan ≈ 100 pm. Pitch negatif = kamera dari atas.
import React from 'react';
import {C, FONT} from '../theme';
import {type SMol} from './syC';
import {type V3, rotZ} from './vbC';

/** Warna foton di luar cahaya tampak (berlabel di adegan). */
export const MW = '#5cc4e6'; // gelombang mikro: sian redup
export const IR = '#e0564a'; // inframerah: merah tua

/* ------------------------------------------------------------------ */
/* Molekul (posisi relatif pusat massa).                                */
/* ------------------------------------------------------------------ */
/** CO: r = 112,8 pm; pusat massa: C di −r·16/28, O di +r·12/28. */
export const CO: SMol = {
  atoms: [
    {el: 'C', pos: [-1.128 * (16 / 28), 0, 0], label: 'C'},
    {el: 'O', pos: [1.128 * (12 / 28), 0, 0], label: 'O'},
  ],
  bonds: [[0, 1, 3]],
};
/** N₂: r = 110 pm. */
export const N2: SMol = {
  atoms: [
    {el: 'N', pos: [-0.55, 0, 0]},
    {el: 'N', pos: [0.55, 0, 0]},
  ],
  bonds: [[0, 1, 3]],
};
/** HCl: r = 127 pm; pusat massa hampir di Cl. */
export const HCL2: SMol = {
  atoms: [
    {el: 'H', pos: [-1.27 * (35 / 36), 0, 0], label: 'H'},
    {el: 'Cl', pos: [1.27 * (1 / 36), 0, 0]},
  ],
  bonds: [[0, 1]],
};
/** CO₂: r(C=O) = 116 pm. */
export const CO2M: SMol = {
  atoms: [
    {el: 'O', pos: [-1.16, 0, 0]},
    {el: 'C', pos: [0, 0, 0], label: 'C'},
    {el: 'O', pos: [1.16, 0, 0]},
  ],
  bonds: [
    [0, 1, 2],
    [1, 2, 2],
  ],
};

/** Molekul diatomik dengan panjang ikatan diregang faktor s (getaran, pusat massa tetap). */
export const stretch = (m: SMol, s: number): SMol => ({...m, atoms: m.atoms.map((a) => ({...a, pos: [a.pos[0] * s, a.pos[1] * s, a.pos[2] * s] as V3}))});

/**
 * Sudut putar terintegrasi: θ(t) = ∫₀ᵗ ω(τ) dτ (langkah 1/30 dtk) — laju boleh berubah mulus tanpa loncatan sudut.
 */
export const spinAngle = (t: number, omega: (tau: number) => number, t0 = -1) => {
  const dt = 1 / 30;
  let a = 0;
  for (let tau = t0; tau < t; tau += dt) a += omega(Math.min(t, tau + dt / 2)) * Math.min(dt, t - tau);
  return a;
};

/** Putaran di sekitar sumbu z (dilihat sedikit dari atas → lintasan elips). */
export const spinTf = (ang: number, tilt = 0.0) => (v: V3): V3 => {
  const r = rotZ(v, ang);
  return [r[0], r[1], r[2] + tilt * r[1]];
};

/* ------------------------------------------------------------------ */
/* Foton spiral (polarisasi melingkar = membawa momentum sudut).        */
/* ------------------------------------------------------------------ */
export const Helix: React.FC<{
  x: number; // pusat paket
  y: number;
  len?: number;
  amp?: number;
  wl?: number;
  phase?: number;
  color: string;
  opacity?: number;
  angle?: number;
}> = ({x, y, len = 320, amp = 30, wl = 70, phase = 0, color, opacity = 1, angle = 0}) => {
  if (opacity <= 0.003) return null;
  const N = 180;
  let prevFront: boolean | null = null;
  let cur: string[] = [];
  const segs: {front: boolean; d: string}[] = [];
  for (let i = 0; i <= N; i++) {
    const u = -len / 2 + (len * i) / N;
    const env = Math.exp(-((u / (len * 0.36)) ** 2));
    const ph = (2 * Math.PI * u) / wl - phase;
    const px = u + 0.32 * amp * env * Math.sin(ph);
    const py = amp * env * Math.cos(ph);
    const isFront = Math.sin(ph) > 0;
    const pt = `${px.toFixed(1)},${py.toFixed(1)}`;
    if (prevFront === null || isFront === prevFront) cur.push(pt);
    else {
      cur.push(pt);
      segs.push({front: prevFront, d: `M${cur.join(' L')}`});
      cur = [pt];
    }
    prevFront = isFront;
  }
  if (cur.length > 1) segs.push({front: !!prevFront, d: `M${cur.join(' L')}`});
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
      <line x1={-len / 2} y1={0} x2={len / 2} y2={0} stroke={color} strokeWidth={1.5} strokeDasharray="4 8" opacity={0.35} />
      {segs
        .filter((s) => !s.front)
        .map((s, i) => (
          <path key={`b${i}`} d={s.d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        ))}
      {segs
        .filter((s) => s.front)
        .map((s, i) => (
          <g key={`f${i}`}>
            <path d={s.d} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" opacity={0.18} />
            <path d={s.d} fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" />
            <path d={s.d} fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
          </g>
        ))}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Teks SVG kecil dengan subskrip/superskrip.                           */
/* ------------------------------------------------------------------ */
type Seg = string | [string, 'sub' | 'sup' | 'i'];
export const RichText: React.FC<{
  x: number;
  y: number;
  segs: Seg[];
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  opacity?: number;
  font?: 'sans' | 'mono' | 'serif';
}> = ({x, y, segs, size = 28, color = C.ink, anchor = 'middle', weight = 600, opacity = 1, font = 'sans'}) =>
  opacity <= 0.003 ? null : (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fontFamily={FONT[font]}
      fontWeight={weight}
      fontSize={size}
      fill={color}
      opacity={opacity}
      style={{paintOrder: 'stroke', stroke: 'rgba(4,6,12,0.88)', strokeWidth: size * 0.14}}
    >
      {segs.map((s, i) =>
        typeof s === 'string' ? (
          <tspan key={i}>{s}</tspan>
        ) : s[1] === 'i' ? (
          <tspan key={i} fontFamily={FONT.serif} fontStyle="italic">
            {s[0]}
          </tspan>
        ) : (
          <tspan key={i} baselineShift={s[1] === 'sub' ? 'sub' : 'super'} fontSize={size * 0.62}>
            {s[0]}
          </tspan>
        ),
      )}
    </text>
  );

/* ------------------------------------------------------------------ */
/* Spektrum garis (absorbans ke atas).                                  */
/* ------------------------------------------------------------------ */
export type SLine = {nu: number; h: number; color?: string; op?: number; w?: number};
export const LineSpectrum: React.FC<{
  x: number;
  y: number; // garis dasar
  w: number;
  h: number; // tinggi maksimum
  nu0: number;
  nu1: number;
  lines: SLine[];
  ticks?: number[];
  tickOp?: number;
  t: number;
  opacity?: number;
}> = ({x, y, w, h, nu0, nu1, lines, ticks = [], tickOp = 1, t, opacity = 1}) => {
  if (opacity <= 0.003) return null;
  const X = (nu: number) => x + ((nu - nu0) / (nu1 - nu0)) * w;
  return (
    <g opacity={opacity}>
      <rect x={x - 24} y={y - h - 40} width={w + 48} height={h + 40 + 52} rx={16} fill="rgba(8,12,28,0.62)" stroke={C.faint} strokeWidth={1.5} />
      <line x1={x - 8} y1={y} x2={x + w + 8} y2={y} stroke={C.muted} strokeWidth={2} />
      <g opacity={tickOp}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={X(tk)} y1={y} x2={X(tk)} y2={y + 8} stroke={C.muted} strokeWidth={2} />
            <text x={X(tk)} y={y + 28} textAnchor="middle" fontFamily={FONT.mono} fontSize={19} fill={C.muted}>
              {tk}
            </text>
          </g>
        ))}
      </g>
      {lines.map((l, i) => {
        const op = l.op ?? 1;
        if (op <= 0.003 || l.h <= 0.001) return null;
        const xx = X(l.nu);
        const hh = l.h * h;
        const col = l.color ?? C.cyan;
        const tw = 0.85 + 0.15 * Math.sin(t * 2.2 + i * 1.7);
        return (
          <g key={i} opacity={op}>
            <rect x={xx - (l.w ?? 3) * 2.2} y={y - hh} width={(l.w ?? 3) * 4.4} height={hh} fill={col} opacity={0.14 * tw} rx={3} />
            <rect x={xx - (l.w ?? 3) / 2} y={y - hh} width={l.w ?? 3} height={hh} fill={col} />
            <circle cx={xx} cy={y - hh} r={(l.w ?? 3) * 1.1} fill="#fff" opacity={0.55 * tw} />
          </g>
        );
      })}
    </g>
  );
};
