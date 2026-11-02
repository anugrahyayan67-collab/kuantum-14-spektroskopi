import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {VbDefs} from '../components/vbC';
import {HexTelescope} from '../components/spA';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Peta video: tiga bagian (prinsip dasar → implementasi dalam kimia → penerapan).
const CARDS: {n: string; title: string; items: string[]; words: string[]; color: string; glow: 'cyan' | 'violet' | 'gold' | 'mint'; x: number}[] = [
  {
    n: '1',
    title: 'Prinsip dasar',
    items: ['tangga energi tiap gerak', 'populasi Boltzmann', 'aturan seleksi'],
    words: ['tangga', 'Boltzmann', 'seleksi'],
    color: C.gold,
    glow: 'gold',
    x: 420,
  },
  {
    n: '2',
    title: 'Implementasi dalam kimia',
    items: ['spektrum rotasi', 'vibrasi–rotasi (P / R)', 'spektrum Raman', 'spektrum elektronik'],
    words: ['rotasi', 'vibrasi', 'Raman', 'elektronik'],
    color: C.cyan,
    glow: 'cyan',
    x: 960,
  },
  {
    n: '3',
    title: 'Penerapan',
    items: ['alat uji napas', 'astronomi radio', 'atmosfer planet lain'],
    words: ['napas', 'radio', 'atmosfer'],
    color: C.mint,
    glow: 'mint',
    x: 1500,
  },
];
const Y = 570;
const CW = 480;
const CH = 420;

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  if (i === 0) {
    // tangga energi mini: foton memanjat satu anak tangga berulang
    const lv = [y + 44, y + 12, y - 14, y - 34, y - 48];
    const ph = (Math.max(0, t) / 2.2) % 1;
    const up = EASE_IN_OUT(Math.min(1, Math.max(0, (ph - 0.2) / 0.4)));
    const wave = Array.from({length: 22}, (_, k) => `${k ? 'L' : 'M'}${(x - 92 + k * 2.6).toFixed(1)},${(y + 4 + 5 * Math.sin(k * 0.9 - t * 9)).toFixed(1)}`).join(' ');
    return (
      <g>
        {lv.map((yy, k) => (
          <line key={k} x1={x - 36} y1={yy} x2={x + 46} y2={yy} stroke={k === 0 ? C.gold : C.muted} strokeWidth={k === 0 ? 3 : 2} opacity={0.85} />
        ))}
        <path d={wave} fill="none" stroke={C.red} strokeWidth={2.2} opacity={cyc(ph)} />
        <circle cx={x + 6} cy={lv[0] + (lv[1] - lv[0]) * up} r={8} fill={C.gold} />
      </g>
    );
  }
  if (i === 1) {
    // sisir garis spektrum rotasi yang berkedip
    return (
      <g>
        <line x1={x - 80} y1={y + 40} x2={x + 80} y2={y + 40} stroke={C.muted} strokeWidth={2} />
        {Array.from({length: 11}, (_, k) => {
          const xx = x - 75 + k * 15;
          const hgt = 70 * Math.exp(-(((k - 4) / 3.2) ** 2)) * (0.75 + 0.25 * Math.sin(t * 2.4 - k * 0.6));
          return <line key={k} x1={xx} y1={y + 40} x2={xx} y2={y + 40 - hgt} stroke={C.cyan} strokeWidth={3.5} strokeLinecap="round" />;
        })}
      </g>
    );
  }
  return <HexTelescope x={x} y={y - 4} s={0.34} t={t} lit={0.5 + 0.5 * Math.sin(t * 1.5)} />;
};

export const Roadmap: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const head = ramp(t, -0.2, 0.9);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', opacity: head, translate: `0px ${(1 - head) * 20}px`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.gold}}>PETA PERJALANAN · PERTEMUAN 14</div>
        <div style={{fontFamily: FONT.sans, fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 6}}>Spektroskopi Molekul</div>
      </div>
      <Stage>
        <VbDefs />
        {/* benang penghubung antarkartu */}
        {[0, 1].map((k) => {
          const p = ramp(t, cue(k + 2) - 0.5, cue(k + 2) + 0.4, EASE_IN_OUT);
          const x1 = CARDS[k].x + CW / 2 + 6;
          const x2 = CARDS[k + 1].x - CW / 2 - 6;
          return (
            <g key={k} opacity={ramp(t, cue(0) + 0.6, cue(0) + 1.4)}>
              <line x1={x1} y1={Y} x2={x2} y2={Y} stroke={C.faint} strokeWidth={3} strokeDasharray="5 6" strokeDashoffset={-t * 16} />
              <circle cx={x1 + (x2 - x1) * p} cy={Y} r={6} fill={C.gold} opacity={p * (1 - ramp(t, cue(k + 2) + 0.6, cue(k + 2) + 1.2))} />
            </g>
          );
        })}
        {CARDS.map((c, i) => {
          const p = ramp(t, cue(0) + 0.2 + i * 0.25, cue(0) + 1.0 + i * 0.25, BACK);
          const on = ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 0.5);
          const off = i < 2 ? ramp(t, cue(i + 2) - 0.1, cue(i + 2) + 0.5, EASE_IN_OUT) : 0;
          const lit = on * (1 - off);
          const dim = 0.55 + 0.45 * Math.max(lit, 1 - ramp(t, cue(1) - 0.2, cue(1) + 0.4));
          const top = Y - CH / 2;
          const left = c.x - CW / 2;
          const float = 4 * Math.sin(t * 0.9 + i * 1.3);
          return (
            <g key={i} opacity={p * dim} transform={`translate(0 ${(1 - p) * 40 - 10 * lit + float})`}>
              <Glow x={c.x} y={Y} r={280} color={c.glow} opacity={0.2 * lit} />
              <rect x={left} y={top} width={CW} height={CH} rx={28} fill="rgba(12,18,40,0.85)" stroke={c.color} strokeOpacity={0.3 + 0.6 * lit} strokeWidth={2.5} />
              <text x={left + 36} y={top + 66} fontFamily={FONT.mono} fontSize={64} fontWeight={600} fill={c.color} dominantBaseline="central">
                {c.n}
              </text>
              <Icon i={i} x={left + CW - 110} y={top + 80} t={t} />
              <text x={left + 36} y={top + 160} fontFamily={FONT.sans} fontSize={31} fontWeight={700} fill={C.ink}>
                {c.title}
              </text>
              <rect x={left + 36} y={top + 182} width={(CW - 72) * on} height={2} fill={c.color} opacity={0.6} />
              {c.items.map((it, k) => {
                const w = ramp(t, wordOf(i + 1, c.words[k]) - 0.25, wordOf(i + 1, c.words[k]) + 0.35);
                const yy = top + 226 + k * 46;
                return (
                  <g key={k} opacity={0.35 + 0.65 * w}>
                    <circle cx={left + 46} cy={yy} r={5 + 2 * w} fill={c.color} />
                    <text x={left + 66} y={yy} dominantBaseline="central" fontFamily={FONT.sans} fontSize={26} fill={C.ink}>
                      {it}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};
