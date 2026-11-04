import React from 'react';
import {cyc, rand} from '../anim';
import {C, FONT} from '../theme';
import {type Cam, type V3, add, mul, norm} from './vbC';
import {type Mol} from './syD';
import {wlColor} from './viz';

// Utilitas grup D (uji napas, astronomi radio, exoplanet, rangkuman, penutup).

/* ------------------------------------------------------------------ */
/* Molekul.                                                             */
/* ------------------------------------------------------------------ */
const C1: V3 = [-1.0, 0, -0.4];
const C2: V3 = [0.53, 0, -0.4];
const O1: V3 = add(C2, mul([0.34, 0, 0.94], 1.43));
const HO: V3 = add(O1, [0.96, 0, 0]);
const H_C1: V3[] = [
  [-0.333, 0, -0.943],
  [-0.333, 0.817, 0.471],
  [-0.333, -0.817, 0.471],
];
const H_C2: V3[] = [
  [0.331, 0.816, -0.472],
  [0.331, -0.816, -0.472],
];
const SHIFT: V3 = [-0.38, 0, -0.12];
/** Indeks ikatan C–H pada etanol (urutan bonds). */
export const ETH_CH = [3, 4, 5, 6, 7];
/**
 * Etanol CH₃CH₂OH. `ph` = fase regangan C–H (radian), `amp` amplitudo (satuan 100 pm),
 * `glow` 0..1 mewarnai ikatan C–H jingga (vibrasi).
 */
export const ethanol = (ph = 0, amp = 0, glow = 0): Mol => {
  const hs: {c: V3; u: V3}[] = [...H_C1.map((u) => ({c: C1, u})), ...H_C2.map((u) => ({c: C2, u}))];
  const col = glow > 0.02 ? C.amber : undefined;
  const atoms: Mol['atoms'] = [
    {pos: C1, el: 'C'},
    {pos: C2, el: 'C'},
    {pos: O1, el: 'O'},
    {pos: HO, el: 'H'},
    ...hs.map((h, k) => ({pos: add(h.c, mul(norm(h.u), 1.09 + amp * Math.sin(ph + k * 0.9))), el: 'H'})),
  ];
  return {
    atoms: atoms.map((a) => ({...a, pos: add(a.pos, SHIFT)})),
    bonds: [
      {a: 0, b: 1},
      {a: 1, b: 2},
      {a: 2, b: 3},
      ...[4, 5, 6].map((b) => ({a: 0, b, color: col, width: 0.13 + 0.05 * glow})),
      ...[7, 8].map((b) => ({a: 1, b, color: col, width: 0.13 + 0.05 * glow})),
    ],
  };
};

/** CO (pusat massa di titik asal) sepanjang x. */
export const coMol = (): Mol => ({
  atoms: [
    {pos: [-0.646, 0, 0], el: 'C'},
    {pos: [0.484, 0, 0], el: 'O'},
  ],
  bonds: [{a: 0, b: 1, order: 3}],
});

/** Putar molekul di sekitar sumbu z (yaw) — untuk rotasi kaku. */
export const spinZ = (mol: Mol, a: number): Mol => ({
  ...mol,
  atoms: mol.atoms.map((at) => ({...at, pos: [at.pos[0] * Math.cos(a) - at.pos[1] * Math.sin(a), at.pos[0] * Math.sin(a) + at.pos[1] * Math.cos(a), at.pos[2]] as V3})),
});
/** Putar di sekitar sumbu y (rotasi "jungkir" di bidang layar). */
export const spinY = (mol: Mol, a: number): Mol => ({
  ...mol,
  atoms: mol.atoms.map((at) => ({...at, pos: [at.pos[0] * Math.cos(a) + at.pos[2] * Math.sin(a), at.pos[1], -at.pos[0] * Math.sin(a) + at.pos[2] * Math.cos(a)] as V3})),
});

export const camAt = (cx: number, cy: number, s: number, yaw = 0, pitch = -0.2, persp = 9): Cam => ({cx, cy, s, yaw, pitch, persp});

/* ------------------------------------------------------------------ */
/* Gradien lokal.                                                       */
/* ------------------------------------------------------------------ */
export const SpDefs: React.FC = () => (
  <defs>
    <radialGradient id="sp-dark">
      <stop offset="0%" stopColor="#010205" stopOpacity="0.97" />
      <stop offset="55%" stopColor="#020309" stopOpacity="0.85" />
      <stop offset="100%" stopColor="#03040a" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="sp-dust">
      <stop offset="0%" stopColor="#3a2648" stopOpacity="0" />
      <stop offset="70%" stopColor="#4a2f52" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#4a2f52" stopOpacity="0" />
    </radialGradient>
    {[
      ['v', '#5b4bd8'],
      ['c', '#2fc6e8'],
      ['m', '#5ef0b0'],
      ['g', '#ffd25a'],
      ['w', '#fff6d8'],
    ].map(([k, col]) => (
      <radialGradient key={k} id={`sp-map-${k}`}>
        <stop offset="0%" stopColor={col} stopOpacity="1" />
        <stop offset="100%" stopColor={col} stopOpacity="0" />
      </radialGradient>
    ))}
    <radialGradient id="sp-star" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fffbea" />
      <stop offset="55%" stopColor="#ffe08a" />
      <stop offset="85%" stopColor="#ffb347" />
      <stop offset="100%" stopColor="#e07a2a" />
    </radialGradient>
    <radialGradient id="sp-corona">
      <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#ff9a3a" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="sp-tube" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1a2446" />
      <stop offset="50%" stopColor="#0c1228" />
      <stop offset="100%" stopColor="#141c3a" />
    </linearGradient>
    <linearGradient id="sp-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#c9d3f2" />
      <stop offset="50%" stopColor="#6b7698" />
      <stop offset="100%" stopColor="#3a4466" />
    </linearGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* Langit berbintang.                                                   */
/* ------------------------------------------------------------------ */
/** Bintang deterministik; `hide(x,y)` 0..1 meredupkan bintang (mis. di balik awan gelap). */
export const StarField: React.FC<{n?: number; t: number; seed?: number; opacity?: number; hide?: (x: number, y: number) => number; box?: [number, number, number, number]}> = ({
  n = 220,
  t,
  seed = 1,
  opacity = 1,
  hide,
  box = [0, 0, 1920, 1080],
}) => (
  <g opacity={opacity}>
    {Array.from({length: n}, (_, k) => {
      const x = box[0] + rand(k * 3.17 + seed) * box[2];
      const y = box[1] + rand(k * 7.31 + seed * 2) * box[3];
      const big = rand(k * 1.7 + seed) > 0.93;
      const r = big ? 2.2 : 0.8 + rand(k * 5.3) * 1.1;
      const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + rand(k) * 1.6) + k);
      const h = hide ? hide(x, y) : 0;
      const op = (0.25 + 0.6 * rand(k * 2.9)) * tw * (1 - h);
      if (op < 0.02) return null;
      return <circle key={k} cx={x} cy={y} r={r} fill={rand(k * 4.4) > 0.8 ? '#ffe2b0' : '#dfe8ff'} opacity={op} />;
    })}
  </g>
);

/* ------------------------------------------------------------------ */
/* Gelombang (garis sinus bergerak).                                    */
/* ------------------------------------------------------------------ */
/** Gelombang dari (x1,y1) ke (x2,y2); amplitudo boleh berubah di sepanjang jalan amp(u), u 0..1. */
export const wavePath = (x1: number, y1: number, x2: number, y2: number, lambda: number, ph: number, amp: (u: number) => number, n = 160) => {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const s = u * L;
    const a = amp(u) * Math.sin((2 * Math.PI * s) / lambda - ph);
    pts.push(`${i ? 'L' : 'M'}${(x1 + ux * s - uy * a).toFixed(1)},${(y1 + uy * s + ux * a).toFixed(1)}`);
  }
  return pts.join(' ');
};

/* ------------------------------------------------------------------ */
/* Meter jarum.                                                         */
/* ------------------------------------------------------------------ */
export const Gauge: React.FC<{x: number; y: number; r?: number; v: number; label: string; color?: string; opacity?: number; t: number}> = ({x, y, r = 100, v, label, color = C.amber, opacity = 1, t}) => {
  const a0 = Math.PI * 0.85;
  const a1 = Math.PI * 0.15;
  const ang = (u: number) => a0 + (a1 - a0) * u;
  const pt = (u: number, rr: number) => [x + rr * Math.cos(ang(u)), y - rr * Math.sin(ang(u))];
  const vv = Math.max(0, Math.min(1, v + 0.006 * Math.sin(t * 9)));
  const [nx, ny] = pt(vv, r * 0.82);
  const arc = (u0: number, u1: number, rr: number) => {
    const [ax, ay] = pt(u0, rr);
    const [bx, by] = pt(u1, rr);
    return `M${ax},${ay} A${rr},${rr} 0 0 1 ${bx},${by}`;
  };
  return (
    <g opacity={opacity}>
      <rect x={x - r - 26} y={y - r - 26} width={2 * r + 52} height={r + 96} rx={22} fill="rgba(10,14,32,0.88)" stroke={C.faint} strokeWidth={2} />
      <path d={arc(0, 1, r)} fill="none" stroke={C.faint} strokeWidth={14} strokeLinecap="round" />
      <path d={arc(0, 0.34, r)} fill="none" stroke={C.mint} strokeWidth={14} opacity={0.55} />
      <path d={arc(0.34, 0.67, r)} fill="none" stroke={C.gold} strokeWidth={14} opacity={0.55} />
      <path d={arc(0.67, 1, r)} fill="none" stroke={C.red} strokeWidth={14} opacity={0.55} />
      {Array.from({length: 11}, (_, k) => {
        const [ax, ay] = pt(k / 10, r - 16);
        const [bx, by] = pt(k / 10, r - (k % 5 ? 26 : 34));
        return <line key={k} x1={ax} y1={ay} x2={bx} y2={by} stroke={C.muted} strokeWidth={2} />;
      })}
      <line x1={x} y1={y} x2={nx} y2={ny} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <circle cx={x} cy={y} r={10} fill={color} />
      <text x={x} y={y + 46} textAnchor="middle" fontFamily={FONT.sans} fontSize={26} fill={C.ink}>
        {label}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Antena radio parabola.                                               */
/* ------------------------------------------------------------------ */
export const Dish: React.FC<{x: number; y: number; s?: number; tilt?: number; opacity?: number; t: number; live?: number}> = ({x, y, s = 1, tilt = -35, opacity = 1, t, live = 0}) => {
  const R = 90;
  const D = 34;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      {/* menara */}
      <path d="M-46,120 L-14,10 L14,10 L46,120 Z" fill="#1a2240" stroke="#5a6690" strokeWidth={3} />
      <path d="M-30,64 L30,64 M-38,92 L38,92" stroke="#5a6690" strokeWidth={2.5} />
      <rect x={-70} y={118} width={140} height={14} rx={5} fill="#262f52" />
      <g transform={`rotate(${tilt})`}>
        <path d={`M${-R},${-D} Q0,${D * 1.6} ${R},${-D} Z`} fill="url(#sp-metal)" stroke="#dfe6ff" strokeWidth={3} />
        <path d={`M${-R},${-D} Q0,${D * 1.6} ${R},${-D}`} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.5} transform="translate(0,-6) scale(0.86)" />
        <line x1={-R * 0.8} y1={-D} x2={0} y2={-D - 82} stroke="#aab4d8" strokeWidth={3} />
        <line x1={R * 0.8} y1={-D} x2={0} y2={-D - 82} stroke="#aab4d8" strokeWidth={3} />
        <circle cx={0} cy={-D - 86} r={9} fill={C.cyan} opacity={0.5 + 0.5 * live * (0.6 + 0.4 * Math.sin(t * 6))} />
        <circle cx={0} cy={-D - 86} r={22} fill="url(#soft-cyan)" opacity={live * (0.6 + 0.4 * Math.sin(t * 6))} />
      </g>
      <circle cx={0} cy={10} r={12} fill="#3a4466" stroke="#8c96bb" strokeWidth={2} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Ikon kecil (rangkuman, exoplanet, penutup).                           */
/* ------------------------------------------------------------------ */
/** Labu laboratorium + berkas spektrometer. */
export const LabIcon: React.FC<{x: number; y: number; s?: number; t: number; opacity?: number}> = ({x, y, s = 1, t, opacity = 1}) => {
  const lvl = 0.5 + 0.03 * Math.sin(t * 2);
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14,-60 L-14,-18 L-50,46 Q-54,58 -42,58 L42,58 Q54,58 50,46 L14,-18 L14,-60 Z" fill="rgba(79,214,255,0.08)" stroke="#cfe6ff" strokeWidth={3.5} strokeLinejoin="round" />
      <path d={`M${-50 + 36 * (1 - lvl)},${58 - 100 * lvl * 0.7} L${50 - 36 * (1 - lvl)},${58 - 100 * lvl * 0.7} L50,46 Q54,58 42,58 L-42,58 Q-54,58 -50,46 Z`} fill={C.violet} opacity={0.55} />
      <line x1={-20} y1={-60} x2={20} y2={-60} stroke="#cfe6ff" strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2].map((k) => {
        const ph = ((t * 0.5 + k / 3) % 1 + 1) % 1;
        return <circle key={k} cx={-12 + k * 12} cy={40 - ph * 50} r={4} fill="#e8deff" opacity={cyc(ph) * 0.8} />;
      })}
    </g>
  );
};

/** Teleskop cermin segi enam (gaya JWST). */
export const ScopeIcon: React.FC<{x: number; y: number; s?: number; t: number; opacity?: number}> = ({x, y, s = 1, t, opacity = 1}) => {
  const r = 15;
  const cells: [number, number][] = [[0, 0]];
  for (let k = 0; k < 6; k++) cells.push([Math.cos((k * Math.PI) / 3 + Math.PI / 6) * r * 1.76, Math.sin((k * Math.PI) / 3 + Math.PI / 6) * r * 1.76]);
  for (let k = 0; k < 12; k++) {
    const ring = k % 2 === 0 ? 3.52 : 3.05;
    const a = (k * Math.PI) / 6 + Math.PI / 6;
    cells.push([Math.cos(a) * r * ring, Math.sin(a) * r * ring]);
  }
  const hex = (cx: number, cy: number) =>
    Array.from({length: 6}, (_, k) => `${(cx + r * 0.94 * Math.cos((k * Math.PI) / 3)).toFixed(1)},${(cy + r * 0.94 * Math.sin((k * Math.PI) / 3)).toFixed(1)}`).join(' ');
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-80,78 L80,78 L60,62 L-60,62 Z" fill="#4a3a6a" opacity={0.7} />
      {cells.map(([cx, cy], k) => (
        <polygon key={k} points={hex(cx, cy)} fill={C.gold} opacity={k === 0 ? 0.15 : 0.55 + 0.4 * Math.max(0, Math.sin(t * 2 - Math.hypot(cx, cy) * 0.06))} stroke="#8a5a00" strokeWidth={1.5} />
      ))}
      <line x1={-40} y1={-48} x2={0} y2={-80} stroke="#aab4d8" strokeWidth={2.5} />
      <line x1={40} y1={-48} x2={0} y2={-80} stroke="#aab4d8" strokeWidth={2.5} />
      <circle cx={0} cy={-80} r={5} fill="#cfe6ff" />
    </g>
  );
};

/** Planet berpita dengan cincin atmosfer. */
export const PlanetIcon: React.FC<{x: number; y: number; r?: number; t: number; opacity?: number; atm?: number}> = ({x, y, r = 54, t, opacity = 1, atm = 1}) => {
  const id = `pl-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
        <radialGradient id={`${id}-g`} cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#e0b48a" />
          <stop offset="60%" stopColor="#9a6a48" />
          <stop offset="100%" stopColor="#3a2418" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 1.22} fill="none" stroke={C.cyan} strokeWidth={r * 0.14} opacity={0.35 * atm} />
      <circle cx={x} cy={y} r={r * 1.1} fill="none" stroke={C.cyan} strokeWidth={2} opacity={0.6 * atm} />
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-g)`} />
      <g clipPath={`url(#${id})`}>
        {[-0.5, -0.15, 0.25, 0.6].map((v, k) => {
          const off = ((t * 14 + k * 37) % (r * 2)) - r;
          return <rect key={k} x={x - r * 1.5 + off * 0.2} y={y + v * r - r * 0.08} width={r * 3} height={r * (0.1 + 0.06 * k)} fill="#f4d9b8" opacity={0.25} />;
        })}
      </g>
    </g>
  );
};

/** Alat uji napas mini (tabung + berkas IR yang melemah). */
export const BreathIcon: React.FC<{x: number; y: number; s?: number; t: number; opacity?: number}> = ({x, y, s = 1, t, opacity = 1}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-18} width={120} height={36} rx={18} fill="url(#sp-tube)" stroke="#6b7698" strokeWidth={2.5} />
    <circle cx={-72} cy={0} r={8} fill={C.amber} opacity={0.7 + 0.3 * Math.sin(t * 5)} />
    <path d={wavePath(-58, 0, 58, 0, 18, t * 9, (u) => 9 * Math.exp(-1.3 * u))} fill="none" stroke="#c0392b" strokeWidth={3} />
    <rect x={64} y={-14} width={14} height={28} rx={3} fill="#3a4466" stroke="#8c96bb" strokeWidth={2} />
    <path d="M-20,-18 L-20,-40 L-6,-40 L-6,-18" fill="none" stroke="#6b7698" strokeWidth={2.5} />
    {[0, 1].map((k) => {
      const ph = ((t * 0.7 + k * 0.5) % 1 + 1) % 1;
      return <circle key={k} cx={-13} cy={-52 + ph * 30} r={4} fill="#cfe6ff" opacity={cyc(ph) * 0.7} />;
    })}
  </g>
);

/** Spektrum garis mini (latar hiasan): garis rotasi berjarak sama dengan amplop Boltzmann. */
export const LineStrip: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string; n?: number; gap?: boolean; opacity?: number}> = ({x, y, w, h, t, color = C.cyan, n = 22, gap, opacity = 1}) => (
  <g opacity={opacity}>
    <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={C.faint} strokeWidth={2} />
    {Array.from({length: n}, (_, k) => {
      let amp: number;
      let xx: number;
      if (gap) {
        const half = n / 2;
        const j = k < half ? half - k : k - half + 1; // P kiri, R kanan
        amp = j * Math.exp(-j * j / 14);
        xx = x + w / 2 + (k < half ? -1 : 1) * (j * (w / (n + 2)) + (k < half ? 0.012 * j * j * (w / n) : -0.012 * j * j * (w / n)));
      } else {
        const J = k;
        amp = (2 * J + 1) * Math.exp(-(J * (J + 1)) / 40);
        xx = x + ((k + 0.5) / n) * w;
      }
      const norm0 = gap ? 1.75 : 6.2;
      const hh = (h * amp) / norm0;
      const pulse = 0.55 + 0.45 * Math.max(0, Math.sin(t * 1.6 - k * 0.45));
      return <rect key={k} x={xx - 2} y={y + h - hh} width={4} height={hh} rx={2} fill={color} opacity={pulse} />;
    })}
  </g>
);

/** Warna untuk IR (garis serapan) di luar tampak. */
export const IR_COL = '#d8473c';
export const IR_DEEP = wlColor(3400);
