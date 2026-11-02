import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, slot} from '../anim';
import {Formula, Glow, Label, NuTilde, Stage, Sup} from '../components/primitives';
import {Render3D, VbDefs, rotZ, type Cam} from '../components/vbC';
import {molItems3, place} from '../components/syD';
import {Fingerprint, Leaf, Tag, coMol, wavePath} from '../components/spA';
import {Vial, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Spektrum elektromagnetik sebagai penggaris raksasa (skala dipadatkan):
// gelombang mikro (molekul berputar) → inframerah (ikatan bergetar, "sidik jari") →
// tampak/UV (elektron melompat: daun hijau, pewarna). Lalu ν̃ (cm⁻¹) ∝ E.

const X0 = 140;
const X1 = 1780;
const RY = 470;
const RH = 80;
const REG = [
  {a: 140, b: 620, name: 'gelombang mikro', col: '#4fb3d6'},
  {a: 620, b: 1180, name: 'inframerah', col: '#e0564a'},
  {a: 1180, b: 1480, name: 'tampak', col: C.ink},
  {a: 1480, b: 1780, name: 'ultraviolet', col: C.violet},
];
const LAM_TICKS: [number, string][] = [
  [140, '10 cm'],
  [380, '1 cm'],
  [620, '1 mm'],
  [900, '10 µm'],
  [1180, '750 nm'],
  [1480, '380 nm'],
  [1760, '100 nm'],
];
const NU_TICKS: [number, string][] = [
  [140, '0,1'],
  [380, '1'],
  [620, '10'],
  [900, '1000'],
  [1180, '13 000'],
  [1480, '26 000'],
  [1760, '100 000'],
];
/** Panjang gelombang tampilan (px) di sepanjang penggaris: panjang di kiri, pendek di kanan. */
const lamAt = (x: number) => 150 * Math.pow(10 / 150, (x - X0) / (X1 - X0));

export const Ruler: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const ruler = ramp(t, cue(0) - 0.6, cue(0) + 1.4, EASE_IN_OUT);
  const raksasa = ramp(t, wordOf(0, 'penggaris') - 0.3, wordOf(0, 'penggaris') + 1.0);
  const wave = ramp(t, cue(0) + 1.0, cue(0) + 3.0, EASE_IN_OUT);
  const reg = [ramp(t, cue(1) - 0.2, cue(1) + 0.6), ramp(t, cue(2) - 0.2, cue(2) + 0.6), ramp(t, cue(3) - 0.2, cue(3) + 0.6), ramp(t, wordOf(3, 'ultraviolet') - 0.2, wordOf(3, 'ultraviolet') + 0.5)];
  const focus = [reg[0] * (1 - reg[1]), reg[1] * (1 - reg[2]), reg[2] * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.6)), reg[3] * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.6))];
  const mRot = ramp(t, wordOf(1, 'berputar') - 0.3, wordOf(1, 'berputar') + 0.6, BACK);
  const mVib = ramp(t, wordOf(2, 'bergetar') - 0.3, wordOf(2, 'bergetar') + 0.6, BACK);
  const finger = ramp(t, wordOf(2, 'sidik') - 0.3, wordOf(2, 'sidik') + 1.2);
  const mEl = ramp(t, wordOf(3, 'elektron') - 0.3, wordOf(3, 'elektron') + 0.6, BACK);
  const dye = ramp(t, wordOf(3, 'pewarna') - 0.3, wordOf(3, 'pewarna') + 0.6, BACK);
  const leaf = ramp(t, wordOf(3, 'daun') - 0.3, wordOf(3, 'daun') + 0.6, BACK);
  const nu = ramp(t, wordOf(4, 'bilangan') - 0.4, wordOf(4, 'bilangan') + 0.6, EASE_IN_OUT);
  const energyArrow = ramp(t, cue(0) + 1.8, cue(0) + 2.8) * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.5, EASE_IN_OUT));
  const card = slot(t, wordOf(4, 'sebanding') - 0.4, 999);

  const camRot: Cam = {cx: 380, cy: 300, s: 70, yaw: 0, pitch: -0.4};
  const camVib: Cam = {cx: 860, cy: 300, s: 80, yaw: 0.25, pitch: -0.3};

  // elektron melompat (kolom tampak/UV)
  const ePh = (Math.max(0, t) / 2.6) % 1;
  const eUp = ramp(ePh, 0.15, 0.35, EASE_IN_OUT) * (1 - ramp(ePh, 0.7, 0.9, EASE_IN_OUT));
  const EX = 1640;

  return (
    <AbsoluteFill>
      <Stage>
        <VbDefs />
        <defs>
          <linearGradient id="ru-vis" x1="0" y1="0" x2="1" y2="0">
            {Array.from({length: 21}, (_, k) => (
              <stop key={k} offset={`${k * 5}%`} stopColor={wlColor(750 - k * 18.5)} />
            ))}
          </linearGradient>
          <linearGradient id="ru-ir" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3a0d10" />
            <stop offset="100%" stopColor="#8a1a1a" />
          </linearGradient>
          <linearGradient id="ru-uv" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6a4ad8" />
            <stop offset="100%" stopColor="#2a1a5a" />
          </linearGradient>
          <linearGradient id="ru-mw" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d2a3a" />
            <stop offset="100%" stopColor="#1d5a72" />
          </linearGradient>
          <clipPath id="ru-clip">
            <rect x={X0} y={RY} width={(X1 - X0) * ruler} height={RH} rx={14} />
          </clipPath>
        </defs>

        {/* penggaris */}
        <g opacity={ruler}>
          <rect x={X0 - 8} y={RY - 8} width={X1 - X0 + 16} height={RH + 16} rx={20} fill="rgba(8,12,28,0.9)" stroke={C.faint} strokeWidth={2} />
          <g clipPath="url(#ru-clip)">
            <rect x={140} y={RY} width={480} height={RH} fill="url(#ru-mw)" />
            <rect x={620} y={RY} width={560} height={RH} fill="url(#ru-ir)" />
            <rect x={1180} y={RY} width={300} height={RH} fill="url(#ru-vis)" />
            <rect x={1480} y={RY} width={300} height={RH} fill="url(#ru-uv)" />
            {Array.from({length: 83}, (_, k) => {
              const x = X0 + k * 20;
              const big = k % 5 === 0;
              return <line key={k} x1={x} y1={RY} x2={x} y2={RY + (big ? 26 : 14)} stroke="#fff" strokeWidth={big ? 2.2 : 1.4} opacity={0.5} />;
            })}
          </g>
          {/* sorot wilayah aktif */}
          {REG.map((r, i) => (
            <g key={i} opacity={focus[i]}>
              <rect x={r.a + 3} y={RY - 4} width={r.b - r.a - 6} height={RH + 8} rx={14} fill="none" stroke={C.gold} strokeWidth={3} />
              <Glow x={(r.a + r.b) / 2} y={RY + RH / 2} r={(r.b - r.a) * 0.6} color="gold" opacity={0.35} />
            </g>
          ))}
          <Label x={960} y={RY - 46} size={22} color={C.muted} font="mono" opacity={raksasa * (1 - wave)}>
            skala dipadatkan
          </Label>
        </g>

        {/* gelombang yang memendek ke kanan */}
        <path d={wavePath(X0, mix(X0, X1, wave), RY - 34, lamAt, 16, t * 5, 600)} fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.75 * wave} />

        {/* label λ ↔ ν̃ (silang-pudar) */}
        {LAM_TICKS.map(([x, s], k) => (
          <g key={k} opacity={ruler}>
            <line x1={x} y1={RY + RH + 8} x2={x} y2={RY + RH + 18} stroke={C.muted} strokeWidth={2} />
            <Label x={x} y={RY + RH + 38} size={20} color={C.muted} font="mono" opacity={1 - nu}>
              {s}
            </Label>
            <Label x={x} y={RY + RH + 38} size={20} color={C.gold} font="mono" opacity={nu}>
              {NU_TICKS[k][1]}
            </Label>
          </g>
        ))}
        <Label x={X1 + 10} y={RY + RH + 70} size={20} color={C.muted} font="mono" anchor="end" opacity={ruler * (1 - nu)}>
          λ
        </Label>
        <text x={X1 + 10} y={RY + RH + 76} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={C.gold} opacity={nu}>
          bilangan gelombang · cm
          <tspan baselineShift="super" fontSize={14}>
            −1
          </tspan>
        </text>
        {REG.map((r, i) => (
          <Label key={i} x={(r.a + r.b) / 2} y={RY + RH + 92} size={30} weight={700} color={r.col} opacity={ruler * (0.45 + 0.55 * Math.max(reg[i], 1 - ramp(t, cue(1) - 0.3, cue(1) + 0.3)))}>
            {r.name}
          </Label>
        ))}
        {/* panah energi */}
        <g opacity={energyArrow}>
          <line x1={420} y1={RY + RH + 150} x2={1500} y2={RY + RH + 150} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" />
          <Label x={960} y={RY + RH + 184} size={24} color={C.gold}>
            λ makin pendek · energi foton makin besar
          </Label>
        </g>

        {/* penanda: gelombang mikro */}
        <g opacity={mRot} transform={`translate(0 ${(1 - mRot) * 20})`}>
          <ellipse cx={380} cy={304} rx={110} ry={34} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="12 9" strokeDashoffset={-t * 50} opacity={0.6} />
          <Render3D items={molItems3(camRot, place(coMol(), (v) => rotZ(v, t * 2.4)), {labels: false})} />
          <Label x={380} y={190} size={28} weight={700} color={C.cyan}>
            molekul berputar
          </Label>
          <line x1={380} y1={360} x2={380} y2={RY - 56} stroke={C.cyan} strokeWidth={2} strokeDasharray="4 6" opacity={0.6} />
        </g>
        {/* penanda: inframerah */}
        <g opacity={mVib} transform={`translate(0 ${(1 - mVib) * 20})`}>
          <Render3D items={molItems3(camVib, coMol(0.2 * Math.sin(t * 11)), {labels: false})} />
          <Label x={860} y={190} size={28} weight={700} color={C.amber}>
            ikatan bergetar
          </Label>
          <line x1={860} y1={350} x2={860} y2={RY - 56} stroke={C.amber} strokeWidth={2} strokeDasharray="4 6" opacity={0.6} />
        </g>
        <g opacity={finger}>
          <Fingerprint x={1040} y={300} s={1.1} p={finger} />
          <Tag x={1040} y={378} text="sidik jari molekul" color={C.amber} size={22} w={220} />
        </g>
        {/* penanda: tampak / UV */}
        <g opacity={leaf}>
          <Leaf x={1240} y={360} s={0.9} t={t} />
        </g>
        <g opacity={dye}>
          <Vial x={1380} y={300} w={74} h={150} color="#e0399a" glow={0.8} t={t} />
        </g>
        <g opacity={mEl} transform={`translate(0 ${(1 - mEl) * 20})`}>
          <Label x={1500} y={190} size={28} weight={700} color={C.violet}>
            elektron melompat
          </Label>
          <line x1={EX - 50} y1={350} x2={EX + 50} y2={350} stroke={C.violet} strokeWidth={3} />
          <line x1={EX - 50} y1={256} x2={EX + 50} y2={256} stroke={C.violet} strokeWidth={3} strokeDasharray="8 6" />
          <path d={wavePath(EX - 130, EX - 60, 303, () => 12, 9, t * 8, 80)} fill="none" stroke={wlColor(430)} strokeWidth={3} opacity={0.4 + 0.6 * eUp} />
          <circle cx={EX} cy={mix(342, 248, eUp)} r={18} fill="url(#soft-violet)" />
          <circle cx={EX} cy={mix(342, 248, eUp)} r={8} fill="#e6ddff" />
          <line x1={EX} y1={RY - 56} x2={EX} y2={372} stroke={C.violet} strokeWidth={2} strokeDasharray="4 6" opacity={0.6} />
        </g>
      </Stage>
      <Formula
        x={960}
        y={RY + RH + 200}
        p={card}
        size={58}
        caption="bilangan gelombang sebanding langsung dengan energi foton"
      >
        <NuTilde /> (cm<Sup>−1</Sup>) ∝ <i>E</i>
      </Formula>
    </AbsoluteFill>
  );
};
