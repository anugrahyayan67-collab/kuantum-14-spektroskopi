import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {Render3D, VbDefs, rotZ, type Cam} from '../components/vbC';
import {co2, co2Mode, molItems3, place, vibrate} from '../components/syD';
import {AbsStrip, HexTelescope, Starfield, Tag, falseColor, wavePath} from '../components/spA';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Pembuka: WASP-39b melintas di depan bintangnya; cahaya bintang menembus atmosfer planet
// menuju teleskop bercermin segi enam; spektrum inframerah (warna semu) dengan celah serapan
// H₂O dan CO₂ (≈ 4,3 µm). Lalu satu molekul CO₂ menari tiga cara: bergerak, berputar, bergetar.

const SX = 430;
const SY = 330;
const SR = 120;
const PR = 46;
const PY = 348;
const TX = 1500;
const TY = 330;

// strip spektrum 0,6–5,2 µm
const LX = 360;
const LW = 1200;
const LY = 650;
const LH = 70;
const L0 = 0.6;
const L1 = 5.2;
const uOf = (um: number) => (um - L0) / (L1 - L0);
const H2O_UM = [1.4, 1.9, 2.7];
const CO2_UM = 4.3;

const planetX = (t: number) => mix(250, 440, ramp(t, 0.6, 7.6, EASE_IN_OUT)) + 2.4 * Math.max(0, t - 7.6);
/** Fraksi cakram planet yang menutupi bintang (0..1). */
const cover = (t: number) => {
  const d = Math.abs(planetX(t) - SX);
  return Math.max(0, Math.min(1, (SR + PR - d) / (2 * PR)));
};

const sub = (v: string, s = 20) => (
  <tspan baselineShift="sub" fontSize={s}>
    {v}
  </tspan>
);

const CO2M = co2();
const CO2A = co2Mode('asym');

export const Hook: React.FC = () => {
  const {t, cue, cueEnd, wordOf} = useScene();

  // ---------- bagian langit (baris 0–3) ----------
  const sky = ramp(t, -0.4, 1.4) * (1 - ramp(t, cue(4) - 0.7, cue(4) + 0.3, EASE_IN_OUT));
  const px = planetX(t);
  const planetIn = ramp(t, 0.4, 1.6);
  const dist = ramp(t, wordOf(0, 'tujuh') - 0.2, wordOf(0, 'tujuh') + 0.8);
  const distOut = 1 - ramp(t, cue(2) - 0.4, cue(2) + 0.4, EASE_IN_OUT);
  const curve = ramp(t, wordOf(0, 'melintas') - 0.3, wordOf(0, 'melintas') + 0.6) * (1 - ramp(t, cue(2) + 0.2, cue(2) + 1.0, EASE_IN_OUT));
  const beam = ramp(t, wordOf(1, 'menembus') - 0.3, wordOf(1, 'menembus') + 1.2, EASE_IN_OUT);
  const lost = ramp(t, wordOf(1, 'hilang') - 0.2, wordOf(1, 'hilang') + 0.8);
  const scope = ramp(t, cue(1) - 0.2, cue(1) + 0.8);
  const scopeLit = ramp(t, wordOf(2, 'Webb') - 0.3, wordOf(2, 'Webb') + 0.6);
  const strip = ramp(t, wordOf(1, 'warnanya') - 0.2, Math.max(cue(1) + 3.6, wordOf(1, 'warnanya') + 1.6), EASE_IN_OUT);
  const gapD = ramp(t, wordOf(1, 'hilang') - 0.1, wordOf(1, 'hilang') + 1.2);
  const gapPulse = ramp(t, wordOf(2, 'celah') - 0.2, wordOf(2, 'celah') + 0.4) * (1 - ramp(t, wordOf(2, 'celah') + 0.8, wordOf(2, 'celah') + 1.6));
  const co2Tag = ramp(t, wordOf(2, 'karbon') - 0.2, wordOf(2, 'karbon') + 0.5, BACK);
  const h2oTag = ramp(t, wordOf(2, 'uap') - 0.2, wordOf(2, 'uap') + 0.5, BACK);
  const scan = ramp(t, wordOf(3, 'membaca') - 0.6, cueEnd(3) + 0.2, EASE_IN_OUT);
  const scanOn = ramp(t, wordOf(3, 'membaca') - 0.8, wordOf(3, 'membaca') - 0.2) * (1 - ramp(t, cue(4) - 1.0, cue(4) - 0.4));
  const noGo = ramp(t, cue(3) - 0.1, cue(3) + 0.6) * (1 - ramp(t, wordOf(3, 'Hanya') - 0.2, wordOf(3, 'Hanya') + 0.4, EASE_IN_OUT));

  const gaps = [
    ...H2O_UM.map((um, k) => ({u: uOf(um), w: k === 2 ? 0.022 : 0.016, depth: (0.55 + 0.25 * gapPulse) * gapD})),
    {u: uOf(CO2_UM), w: 0.02, depth: (0.8 + 0.2 * gapPulse) * gapD},
  ];

  // untaian cahaya melewati cincin atmosfer
  const NS = 7;
  const strands = Array.from({length: NS}, (_, k) => {
    const a = mix(-1.15, 1.15, k / (NS - 1));
    const sx = px + (PR + 7) * Math.cos(a);
    const sy = PY + (PR + 7) * Math.sin(a);
    const ex = TX - 70;
    const ey = TY - 40 + (k / (NS - 1)) * 80;
    const col = falseColor(0.08 + (0.86 * k) / (NS - 1));
    const dim = k === 2 || k === 5 ? 1 - 0.85 * lost : 1;
    return {sx, sy, ex, ey, col, dim};
  });

  // kurva cahaya (transit)
  const lcX0 = 220;
  const lcX1 = 640;
  const lcY = 560;
  const tA = 0;
  const tB = cue(2);
  const nNow = Math.max(0, Math.min(120, Math.round(((t - tA) / (tB - tA)) * 120)));
  const lc = Array.from({length: nNow + 1}, (_, k) => {
    const tt = tA + ((tB - tA) * k) / 120;
    return `${k ? 'L' : 'M'}${(lcX0 + ((lcX1 - lcX0) * k) / 120).toFixed(1)},${(lcY + 26 * cover(tt)).toFixed(1)}`;
  }).join(' ');

  // ---------- tiga tarian (baris 4) ----------
  const dance = ramp(t, cue(4) - 0.2, cue(4) + 0.9);
  const dW = [wordOf(4, 'bergerak'), wordOf(4, 'berputar'), wordOf(4, 'bergetar')];
  const lit = dW.map((w) => ramp(t, w - 0.25, w + 0.4));
  const waves = ramp(t, wordOf(4, 'warnanya') - 0.4, wordOf(4, 'warnanya') + 0.6);
  const tiga = ramp(t, wordOf(4, 'tiga') - 0.3, wordOf(4, 'tiga') + 0.5);
  const DX = [480, 960, 1440];
  const DY = 410;
  const moveX = 95 * Math.sin(t * 1.1);
  const moveY = 30 * Math.sin(t * 0.7 + 1);
  const camOf = (i: number): Cam => ({cx: DX[i] + (i === 0 ? moveX : 0), cy: DY + (i === 0 ? moveY : 0), s: 78, yaw: 0.25, pitch: -0.32});
  const mols = [
    place(CO2M, (v) => rotZ(v, 0.35)),
    place(CO2M, (v) => rotZ(v, t * 2.4)),
    vibrate(CO2M, CO2A, 0.2 * lit[2] + 0.06, t * 10),
  ];
  const DCOL = [C.muted, C.cyan, C.amber];
  const DNAME = ['bergerak', 'berputar', 'bergetar'];
  const WAVE: {lam: number; col: string; label: string}[] = [
    {lam: 0, col: C.muted, label: 'pelebaran Doppler'},
    {lam: 120, col: '#3f9fc4', label: 'gelombang mikro'},
    {lam: 44, col: '#c0392b', label: 'inframerah'},
  ];

  return (
    <AbsoluteFill>
      <Stage>
        <VbDefs />
        <defs>
          <radialGradient id="hk-star">
            <stop offset="0%" stopColor="#fffbe8" />
            <stop offset="45%" stopColor="#ffe08a" />
            <stop offset="85%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="#ff8f3a" />
          </radialGradient>
          <linearGradient id="hk-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffe8a8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffe8a8" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <Starfield t={t} opacity={ramp(t, -0.6, 1.2) * (1 - 0.6 * dance)} />

        <g opacity={sky}>
          {/* jarak */}
          <g opacity={dist * distOut}>
            <line x1={SX + SR + 40} y1={160} x2={TX - 120} y2={160} stroke={C.gold} strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-t * 20} opacity={0.7} />
            <path d={`M${SX + SR + 52},150 L${SX + SR + 36},160 L${SX + SR + 52},170`} fill="none" stroke={C.gold} strokeWidth={2.5} />
            <path d={`M${TX - 132},150 L${TX - 116},160 L${TX - 132},170`} fill="none" stroke={C.gold} strokeWidth={2.5} />
            <Label x={(SX + TX) / 2} y={124} size={38} color={C.gold} weight={700}>
              ≈ 700 tahun cahaya
            </Label>
          </g>

          {/* cahaya bintang lebar */}
          <path d={`M${SX},${SY - SR * 0.9} L${TX - 70},${TY - 60} L${TX - 70},${TY + 60} L${SX},${SY + SR * 0.9} Z`} fill="url(#hk-beam)" opacity={0.6 * beam} />

          {/* bintang */}
          <Glow x={SX} y={SY} r={SR * 2.6} color="gold" opacity={0.7 + 0.08 * Math.sin(t * 2)} />
          <circle cx={SX} cy={SY} r={SR} fill="url(#hk-star)" />
          {Array.from({length: 9}, (_, k) => {
            const a = k * 0.7 + t * 0.15;
            return <circle key={k} cx={SX + SR * 0.55 * Math.cos(a)} cy={SY + SR * 0.5 * Math.sin(a * 1.3)} r={14 + 6 * Math.sin(t + k)} fill="#fff6cf" opacity={0.18} />;
          })}

          {/* untaian cahaya menembus atmosfer */}
          {strands.map((s, k) => {
            return (
              <g key={k} opacity={beam * s.dim}>
                <line x1={s.sx} y1={s.sy} x2={mix(s.sx, s.ex, beam)} y2={mix(s.sy, s.ey, beam)} stroke={s.col} strokeWidth={3} strokeLinecap="round" opacity={0.75} />
                {[0, 1, 2].map((j) => {
                  const ph = (t * 0.45 + j / 3 + k * 0.13) % 1;
                  return <circle key={j} cx={mix(s.sx, s.ex, ph * beam)} cy={mix(s.sy, s.ey, ph * beam)} r={4.5} fill={s.col} opacity={cyc(ph)} />;
                })}
              </g>
            );
          })}

          {/* planet transit */}
          <g opacity={planetIn}>
            <circle cx={px} cy={PY} r={PR + 9} fill="none" stroke="#7fd8ff" strokeWidth={7} opacity={0.25 + 0.4 * beam} />
            <circle cx={px} cy={PY} r={PR + 4} fill="none" stroke="#bfeaff" strokeWidth={2} opacity={0.5} />
            <circle cx={px} cy={PY} r={PR} fill="#0a0d18" />
            <path d={`M${px - PR * 0.8},${PY - 12} Q${px},${PY - 18} ${px + PR * 0.8},${PY - 12}`} stroke="#1c2340" strokeWidth={5} fill="none" />
            <path d={`M${px - PR * 0.9},${PY + 10} Q${px},${PY + 4} ${px + PR * 0.9},${PY + 10}`} stroke="#1c2340" strokeWidth={4} fill="none" />
          </g>
          <Label x={SX} y={492} size={24} color={C.muted} opacity={planetIn * distOut}>
            planet WASP-39b
          </Label>

          {/* kurva cahaya */}
          <g opacity={curve}>
            <line x1={lcX0} y1={lcY} x2={lcX1} y2={lcY} stroke={C.faint} strokeWidth={1.5} strokeDasharray="4 6" />
            <path d={lc} fill="none" stroke={C.gold} strokeWidth={3} strokeLinejoin="round" />
            <Label x={lcX0} y={lcY - 22} size={20} color={C.muted} anchor="start" font="mono">
              kecerahan bintang
            </Label>
          </g>

          {/* teleskop */}
          <HexTelescope x={TX} y={TY} t={t} opacity={scope} lit={scopeLit} />
          <Label x={TX} y={TY + 190} size={24} color={C.muted} opacity={scope}>
            teleskop James Webb
          </Label>

          {/* spektrum */}
          <AbsStrip x={LX} y={LY} w={LW} h={LH} color={falseColor} gaps={gaps} reveal={strip} opacity={strip > 0 ? 1 : 0} />
          <g opacity={ramp(t, cue(1) + 1.6, cue(1) + 3.0)}>
            {[1, 2, 3, 4, 5].map((um) => (
              <g key={um}>
                <line x1={LX + uOf(um) * LW} y1={LY + LH + 6} x2={LX + uOf(um) * LW} y2={LY + LH + 16} stroke={C.muted} strokeWidth={2} />
                <text x={LX + uOf(um) * LW} y={LY + LH + 40} textAnchor="middle" fontFamily={FONT.mono} fontSize={20} fill={C.muted}>
                  {um} µm
                </text>
              </g>
            ))}
            <text x={LX + LW} y={LY + LH + 76} textAnchor="end" fontFamily={FONT.sans} fontSize={20} fill={C.muted} opacity={0.8}>
              panjang gelombang · inframerah (warna semu)
            </text>
          </g>
          {/* pemindai "membaca" */}
          <g opacity={scanOn}>
            <rect x={LX + scan * LW - 3} y={LY - 14} width={6} height={LH + 28} rx={3} fill={C.gold} />
            <Glow x={LX + scan * LW} y={LY + LH / 2} r={70} color="gold" opacity={0.6} />
          </g>
          {/* label serapan */}
          <g opacity={co2Tag} transform={`translate(0 ${(1 - co2Tag) * 14})`}>
            <line x1={LX + uOf(CO2_UM) * LW} y1={LY - 8} x2={LX + uOf(CO2_UM) * LW} y2={LY - 40} stroke={C.ink} strokeWidth={2} />
            <Tag x={LX + uOf(CO2_UM) * LW} y={LY - 66} color={C.ink} w={110} text={<>CO{sub('2')}</>} size={28} />
            <text x={LX + uOf(CO2_UM) * LW + 70} y={LY - 66} dominantBaseline="central" fontFamily={FONT.mono} fontSize={20} fill={C.muted}>
              ≈ 4,3 µm
            </text>
          </g>
          <g opacity={h2oTag} transform={`translate(0 ${(1 - h2oTag) * 14})`}>
            {H2O_UM.map((um) => (
              <line key={um} x1={LX + uOf(um) * LW} y1={LY - 8} x2={LX + uOf(1.9) * LW} y2={LY - 40} stroke={C.cyan} strokeWidth={2} />
            ))}
            <Tag x={LX + uOf(1.9) * LW} y={LY - 66} color={C.cyan} w={110} text={<>H{sub('2')}O</>} size={28} />
          </g>
          {/* "tanpa pernah ke sana" */}
          <g opacity={noGo}>
            <path d={`M${TX - 40},${TY - 150} Q${(SX + TX) / 2},40 ${px + 40},${PY - 90}`} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="10 12" />
            <g transform={`translate(${(SX + TX) / 2 + 30} 110)`}>
              <circle r={30} fill="rgba(30,6,14,0.8)" stroke={C.red} strokeWidth={3} />
              <path d="M-12,-12 L12,12 M12,-12 L-12,12" stroke={C.red} strokeWidth={5} strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* ---------- tiga tarian ---------- */}
        <g opacity={dance}>
          <text x={960} y={170} textAnchor="middle" fontFamily={FONT.mono} fontSize={26} letterSpacing={8} fill={C.gold} opacity={tiga}>
            SATU MOLEKUL · TIGA CARA
          </text>
          {[0, 1, 2].map((i) => {
            const on = lit[i];
            const cam = camOf(i);
            return (
              <g key={i}>
                <rect x={DX[i] - 190} y={DY - 170} width={380} height={340} rx={26} fill="rgba(12,18,40,0.55)" stroke={DCOL[i]} strokeOpacity={0.2 + 0.6 * on} strokeWidth={2} />
                <Glow x={DX[i]} y={DY} r={200} color={i === 1 ? 'cyan' : i === 2 ? 'gold' : 'white'} opacity={0.12 + 0.2 * on} />
                {i === 0
                  ? [3, 2, 1].map((g) => {
                      const tt = t - g * 0.12;
                      const c2: Cam = {...cam, cx: DX[0] + 95 * Math.sin(tt * 1.1), cy: DY + 30 * Math.sin(tt * 0.7 + 1)};
                      return <Render3D key={g} items={molItems3(c2, mols[0], {labels: false})} opacity={0.1 * on} />;
                    })
                  : null}
                {i === 1 ? (
                  <ellipse cx={DX[1]} cy={DY + 4} rx={128} ry={40} fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="14 10" strokeDashoffset={-t * 60} opacity={0.3 + 0.5 * on} />
                ) : null}
                <Render3D items={molItems3(cam, mols[i], {labels: false})} />
                <Label x={DX[i]} y={DY + 220} size={46} weight={700} color={DCOL[i]} opacity={0.25 + 0.75 * on}>
                  {DNAME[i]}
                </Label>
                <g opacity={waves}>
                  {WAVE[i].lam > 0 ? (
                    <path d={wavePath(DX[i] - 160, DX[i] + 160, DY + 300, () => WAVE[i].lam, 16, t * 6)} fill="none" stroke={WAVE[i].col} strokeWidth={3.5} />
                  ) : (
                    [-1, 0, 1].map((k) => (
                      <line key={k} x1={DX[0] + k * 22 + 6 * Math.sin(t * 2 + k)} y1={DY + 284} x2={DX[0] + k * 22 + 6 * Math.sin(t * 2 + k)} y2={DY + 316} stroke={C.muted} strokeWidth={k === 0 ? 5 : 3} opacity={k === 0 ? 0.9 : 0.4} />
                    ))
                  )}
                  <Label x={DX[i]} y={DY + 346} size={22} color={C.muted} font="mono">
                    {WAVE[i].label}
                  </Label>
                </g>
              </g>
            );
          })}
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
