import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, rand, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {VbDefs as VbADefs} from '../components/vbA';
import {Render3D, VbDefs, rotZ, type Cam} from '../components/vbC';
import {co2, co2Mode, molItems3, place, vibrate, water, waterMode} from '../components/syD';
import {AbsStrip} from '../components/spA';
import {wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const Letters: React.FC<{text: string; t: number; start: number; step: number; style: React.CSSProperties}> = ({text, t, start, step, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', ...style}}>
    {text.split('').map((ch, i) => {
      const p = ramp(t, start + i * step, start + i * step + 0.9);
      return (
        <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p, translate: `0px ${(1 - p) * 40}px`, scale: String(0.92 + 0.08 * p)}}>
          {ch}
        </span>
      );
    })}
  </div>
);

// Simbol spektroskopi yang melayang samar di latar.
const sb = (s: number, v: string, col?: string) => (
  <tspan fontSize={s * 0.6} baselineShift="sub" fill={col}>
    {v}
  </tspan>
);
const sp = (s: number, v: string, col?: string) => (
  <tspan fontSize={s * 0.6} baselineShift="super" fill={col}>
    {v}
  </tspan>
);
const FLOATS: ((s: number) => React.ReactNode)[] = [
  () => <tspan fill={C.gold}>hν</tspan>,
  () => <tspan fill={C.cyan}>ΔJ = ±1</tspan>,
  () => <tspan fill={C.amber}>Δv = ±1</tspan>,
  (s) => (
    <>
      <tspan fill={C.ink}>cm</tspan>
      {sp(s, '−1', C.ink)}
    </>
  ),
  (s) => (
    <>
      <tspan fill={C.cyan}>E</tspan>
      {sb(s, 'J', C.cyan)}
    </>
  ),
  () => <tspan fill={C.gold}>kT</tspan>,
  () => <tspan fill={C.violet}>π → π*</tspan>,
  (s) => (
    <>
      <tspan fill={C.amber}>ω</tspan>
      {sb(s, 'e', C.amber)}
    </>
  ),
  () => <tspan fill={C.cyan}>B</tspan>,
  () => <tspan fill={C.ink}>λ</tspan>,
  (s) => (
    <>
      <tspan fill={C.mint}>e</tspan>
      {sp(s, '−ΔE/kT', C.mint)}
    </>
  ),
  () => <tspan fill={C.violet}>ΔE = hν</tspan>,
];

const CO2M = co2();
const CO2A = co2Mode('asym');
const H2OM = water();
const H2OB = waterMode('bend');
// garis serapan pada pelangi (posisi 0..1)
const LINES = [0.12, 0.2, 0.31, 0.47, 0.5, 0.62, 0.71, 0.83, 0.9];

export const Title: React.FC = () => {
  const {t} = useScene();
  const bg = ramp(t, 0.1, 2.0, EASE_IN_OUT);
  const sub = ramp(t, 2.6, 3.6);
  const line = ramp(t, 1.8, 3.2, EASE_IN_OUT);
  const flashP = ramp(t, 3.6, 5.2);
  // CO₂ kiri: berputar (rotasi) sambil meregang tak simetris (vibrasi)
  const camL: Cam = {cx: 165, cy: 610, s: 100, yaw: 0.3, pitch: -0.4};
  const leftItems = molItems3(camL, vibrate(place(CO2M, (v) => rotZ(v, t * 0.9)), CO2A, 0.12, t * 8), {labels: false});
  // H₂O kanan: menekuk dan berputar pelan
  const camR: Cam = {cx: 1755, cy: 610, s: 125, yaw: 0.6 + t * 0.35, pitch: -0.25};
  const rightItems = molItems3(camR, vibrate(H2OM, H2OB, 0.1, t * 7), {labels: false});
  const strip = ramp(t, 0.8, 3.4, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <Stage>
        <VbDefs />
        <VbADefs />
        <defs>
          <linearGradient id="tt-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe8a8" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffe8a8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Glow x={960} y={470} r={640} color="gold" opacity={0.12 * bg} />
        {/* sinar cahaya miring yang menyapu pelan */}
        {[0, 1, 2].map((k) => {
          const x0 = 300 + k * 560 + 60 * Math.sin(t * 0.4 + k * 2);
          return <path key={k} d={`M${x0 - 40},-20 L${x0 + 40},-20 L${x0 + 420},1100 L${x0 + 250},1100 Z`} fill="url(#tt-ray)" opacity={(0.32 + 0.12 * Math.sin(t * 0.9 + k)) * bg} />;
        })}
        {/* spektrum serapan samar */}
        <g opacity={0.55 * bg}>
          <AbsStrip
            x={360}
            y={720}
            w={1200}
            h={34}
            color={(u) => wlColor(400 + 300 * u)}
            gaps={LINES.map((u, k) => ({u, w: 0.005 + (k % 3) * 0.002, depth: 0.95 * ramp(t, 2.2 + k * 0.12, 2.8 + k * 0.12)}))}
            reveal={strip}
          />
        </g>
        <Render3D items={leftItems} opacity={0.42 * bg * (0.85 + 0.15 * Math.sin(t * 0.9))} />
        <Render3D items={rightItems} opacity={0.4 * bg} />
        <circle cx={960} cy={470} r={420 * flashP + 80} fill="url(#vbA-flash)" opacity={0.35 * Math.max(0, 1 - Math.abs(t - 4.0) / 1.2) * bg} />
        {FLOATS.map((f, i) => {
          const x = 140 + ((rand(i * 3.3) * 1640 + t * (14 + rand(i) * 18)) % 1640);
          const y = 150 + rand(i * 5.1 + 2) * 520;
          const edge = Math.min(1, (x - 140) / 120, (1780 - x) / 120);
          const s = 38 + rand(i * 7.7) * 22;
          return (
            <text key={i} x={x} y={y} fontFamily={FONT.serif} fontStyle="italic" fontSize={s} fill={C.ink} opacity={0.2 * bg * Math.max(0, edge)} textAnchor="middle">
              {f(s)}
            </text>
          );
        })}
      </Stage>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingBottom: 120}}>
        <Letters
          text="SATU MOLEKUL, TIGA TARIAN"
          t={t}
          start={0.6}
          step={0.05}
          style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 96, letterSpacing: 3, lineHeight: 1.08, color: C.gold, textShadow: '0 0 60px rgba(255,194,74,0.45)'}}
        />
        <div style={{width: 700 * line, height: 2, margin: '30px 0 24px', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div style={{fontFamily: FONT.sans, fontSize: 36, color: C.muted, letterSpacing: 1, opacity: sub, translate: `0px ${(1 - sub) * 16}px`}}>
          Kimia Kuantum · Spektroskopi Molekul
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
