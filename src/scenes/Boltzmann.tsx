import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, slot} from '../anim';
import {Formula, Frac, Glow, Label, Stage, Sub, Sup} from '../components/primitives';
import {CmInv} from '../components/syD';
import {Tag} from '../components/spA';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Populasi Boltzmann pada HCl: tingkat rotasi (rapat, B ≈ 10,6 cm⁻¹) vs vibrasi (renggang, ≈ 2886 cm⁻¹).
// Panel kiri = perbesaran 0–800 cm⁻¹ dari dasar panel kanan (kotak zoom). Bola emas = molekul,
// tersebar sesuai (2J+1)·e^(−E/kT); kT (298 K) ≈ 207 cm⁻¹.

const BOT = 820;
const B_HCL = 10.6;
const NU_HCL = 2886;
const K_CM = 0.695; // k dalam cm⁻¹/K
const S_ROT = 0.65; // px per cm⁻¹ (panel rotasi)
const S_VIB = 0.18; // px per cm⁻¹ (panel vibrasi)
const JMAX = 8;
const EJ = Array.from({length: JMAX + 1}, (_, J) => B_HCL * J * (J + 1));
const RX0 = 240;
const RX1 = 600;
const VX0 = 1140;
const VX1 = 1460;
const N_ROT = 48;
const N_VIB = 52;
const TH_X = 1700;

/** Batas kumulatif (quantile) tiap tingkat J pada suhu T. */
const cdf = (T: number) => {
  const kT = Math.max(1, K_CM * T);
  const w = EJ.map((E, J) => (2 * J + 1) * Math.exp(-E / kT));
  const Z = w.reduce((a, b) => a + b, 0);
  const c: number[] = [];
  let acc = 0;
  for (const x of w) {
    c.push(acc);
    acc += x / Z;
  }
  return c;
};
const smooth = (x: number) => {
  const u = Math.max(0, Math.min(1, x));
  return u * u * (3 - 2 * u);
};
/** Tinggi energi (cm⁻¹) bola dengan quantile q — meluncur halus antar-tingkat saat T berubah. */
const ballE = (q: number, c: number[]) => {
  let E = 0;
  const d = 0.01;
  for (let J = 1; J <= JMAX; J++) E += (EJ[J] - EJ[J - 1]) * smooth((q - c[J] + d) / (2 * d));
  return E;
};

export const Boltzmann: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const show = ramp(t, -0.4, 1.0);
  const T = mix(40, 298, ramp(t, cue(0) + 1.0, wordOf(0, 'atas') + 1.0, EASE_IN_OUT));
  const c = cdf(T);
  const heat = ramp(t, wordOf(0, 'Panas') - 0.3, wordOf(0, 'Panas') + 0.5);
  const fCard = slot(t, wordOf(1, 'faktor') - 0.3, cue(2));
  const kCard = slot(t, cue(2), cue(3) + 0.2);
  const kLine = ramp(t, wordOf(2, 'k') - 0.2, wordOf(2, 'k') + 0.8, EASE_IN_OUT);
  const rotHi = ramp(t, cue(3) - 0.2, cue(3) + 0.6) * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.6));
  const vibHi = ramp(t, cue(4) - 0.2, cue(4) + 0.6);
  const rotTag = ramp(t, wordOf(3, 'banyak') - 0.3, wordOf(3, 'banyak') + 0.5);
  const vibTag = ramp(t, wordOf(4, 'dasar') - 0.6, wordOf(4, 'dasar') + 0.3);
  const zoom = ramp(t, cue(0) + 0.6, cue(0) + 2.0, EASE_IN_OUT);

  const yRot = (E: number) => BOT - E * S_ROT;
  const yVib = (E: number) => BOT - E * S_VIB;

  return (
    <AbsoluteFill>
      <Stage>
        <Glow x={(RX0 + RX1) / 2} y={560} r={330} color="cyan" opacity={0.25 * rotHi * show} />
        <Glow x={(VX0 + VX1) / 2} y={720} r={300} color="gold" opacity={0.25 * vibHi * show} />

        {/* ---------- panel rotasi (diperbesar) ---------- */}
        <g opacity={show}>
          <rect x={RX0 - 30} y={yRot(800) - 10} width={RX1 - RX0 + 60} height={800 * S_ROT + 20} rx={16} fill="rgba(10,16,36,0.55)" stroke={C.cyan} strokeOpacity={0.25 + 0.5 * rotHi} strokeWidth={2} />
          {EJ.map((E, J) => (
            <g key={J}>
              <line x1={RX0} y1={yRot(E)} x2={RX1} y2={yRot(E)} stroke={C.cyan} strokeWidth={2.5} opacity={0.85} />
              <Label x={RX0 - 40} y={yRot(E)} size={J < 2 ? 15 : 19} color={C.cyan} font="mono" anchor="end" opacity={J === 1 ? 0 : 0.85}>
                {`J = ${J}`}
              </Label>
            </g>
          ))}
          {Array.from({length: N_ROT}, (_, k) => {
            const q = (k + 0.5) / N_ROT;
            const y = yRot(ballE(q, c)) - 9 + 1.2 * Math.sin(t * 4 + k * 1.7);
            const x = RX0 + 12 + (k % 17) * 20.5 + 1.5 * Math.sin(t * 3 + k);
            return <circle key={k} cx={x} cy={y} r={7.5} fill={C.gold} stroke="#fff3c4" strokeWidth={1} opacity={0.95} />;
          })}
          <Label x={(RX0 + RX1) / 2} y={866} size={26} weight={700} color={C.cyan}>
            rotasi HCl · diperbesar
          </Label>
        </g>

        {/* ---------- panel vibrasi ---------- */}
        <g opacity={show}>
          {[0, 1].map((v) => (
            <g key={v}>
              <line x1={VX0} y1={yVib(v * NU_HCL)} x2={VX1} y2={yVib(v * NU_HCL)} stroke={C.amber} strokeWidth={3.5} />
              <Label x={VX0 - 18} y={yVib(v * NU_HCL)} size={22} color={C.amber} font="mono" anchor="end">
                {`v = ${v}`}
              </Label>
            </g>
          ))}
          {/* sub-tingkat rotasi di atas v = 0 dan v = 1 */}
          {[0, 1].map((v) =>
            EJ.slice(1).map((E, j) => <line key={`${v}-${j}`} x1={VX0 + 30} y1={yVib(v * NU_HCL + E)} x2={VX1 - 30} y2={yVib(v * NU_HCL + E)} stroke={C.cyan} strokeWidth={1.2} opacity={0.45} />),
          )}
          {Array.from({length: N_VIB}, (_, k) => {
            const q = (k + 0.5) / N_VIB;
            const y = yVib(ballE(q, c)) - 5 + 0.8 * Math.sin(t * 4 + k * 1.3);
            const x = VX0 + 10 + (k % 26) * 11.8 + Math.sin(t * 3 + k);
            return <circle key={k} cx={x} cy={y} r={4.6} fill={C.gold} opacity={0.95} />;
          })}
          {/* ΔE vibrasi */}
          <line x1={VX1 + 26} y1={yVib(0) - 4} x2={VX1 + 26} y2={yVib(NU_HCL) + 4} stroke={C.amber} strokeWidth={2.5} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" opacity={0.8} />
          <text x={VX1 + 44} y={yVib(NU_HCL / 2)} dominantBaseline="central" fontFamily="'JetBrains Mono', monospace" fontSize={20} fill={C.amber}>
            ≈ 2886 <CmInv size={20} />
          </text>
          {/* kotak zoom + penghubung ke panel rotasi */}
          <g opacity={zoom}>
            <rect x={VX0 - 8} y={yVib(800)} width={VX1 - VX0 + 16} height={800 * S_VIB} rx={8} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray="6 6" opacity={0.75} />
            <line x1={VX0 - 8} y1={yVib(800)} x2={RX1 + 30} y2={yRot(800) - 10} stroke={C.cyan} strokeWidth={1.5} strokeDasharray="5 8" strokeDashoffset={t * 12} opacity={0.4} />
            <line x1={VX0 - 8} y1={BOT} x2={RX1 + 30} y2={BOT + 10} stroke={C.cyan} strokeWidth={1.5} strokeDasharray="5 8" strokeDashoffset={t * 12} opacity={0.4} />
          </g>
          <Label x={(VX0 + VX1) / 2} y={866} size={26} weight={700} color={C.amber}>
            vibrasi HCl
          </Label>
        </g>

        {/* ---------- garis kT ---------- */}
        <g opacity={kLine}>
          <line x1={RX0 - 10} y1={yRot(K_CM * 298)} x2={mix(RX0 - 10, RX1 + 20, kLine)} y2={yRot(K_CM * 298)} stroke={C.gold} strokeWidth={3} strokeDasharray="12 8" />
          <Label x={RX1 + 26} y={yRot(K_CM * 298) - 22} size={24} color={C.gold} font="serif" italic anchor="end">
            kT
          </Label>
          <line x1={VX0 - 10} y1={yVib(K_CM * 298)} x2={mix(VX0 - 10, VX1 + 10, kLine)} y2={yVib(K_CM * 298)} stroke={C.gold} strokeWidth={3} strokeDasharray="12 8" />
          <Label x={VX1 + 50} y={yVib(K_CM * 298)} size={24} color={C.gold} font="serif" italic anchor="start">
            kT
          </Label>
        </g>

        {/* ---------- label sorotan ---------- */}
        <Tag x={(RX0 + RX1) / 2} y={yRot(800) - 52} text="banyak tingkat J terisi" color={C.cyan} size={24} w={300} opacity={rotTag} />
        <g opacity={vibTag}>
          <Tag x={(VX0 + VX1) / 2} y={560} text="≈ semua di v = 0" color={C.amber} size={26} w={280} />
          <Label x={(VX0 + VX1) / 2} y={yVib(NU_HCL) + 30} size={21} color={C.muted}>
            v = 1: ≈ 1 dari sejuta molekul
          </Label>
        </g>

        {/* ---------- termometer ---------- */}
        <g opacity={show}>
          <rect x={TH_X - 14} y={330} width={28} height={450} rx={14} fill="rgba(10,16,36,0.8)" stroke={C.muted} strokeWidth={2} />
          <rect x={TH_X - 7} y={mix(770, 380, T / 330)} width={14} height={770 - mix(770, 380, T / 330) + 20} rx={7} fill={C.red} />
          <circle cx={TH_X} cy={800} r={30} fill={C.red} stroke={C.muted} strokeWidth={2} />
          <Glow x={TH_X} y={800} r={90} color="red" opacity={0.35 + 0.35 * heat} />
          {[0, 100, 200, 300].map((k) => (
            <line key={k} x1={TH_X + 16} y1={mix(770, 380, k / 330)} x2={TH_X + 28} y2={mix(770, 380, k / 330)} stroke={C.muted} strokeWidth={2} />
          ))}
          <Label x={TH_X} y={286} size={28} weight={700} color={C.ink} font="mono">
            {`${Math.round(T)} K`}
          </Label>
          <Label x={TH_X} y={866} size={22} color={C.muted}>
            suhu kamar ≈ 25 °C
          </Label>
        </g>
      </Stage>
      <Formula x={960} y={200} p={fCard} size={58} caption="perbandingan populasi dua tingkat">
        <Frac
          n={
            <>
              <i>N</i>
              <Sub>atas</Sub>
            </>
          }
          d={
            <>
              <i>N</i>
              <Sub>bawah</Sub>
            </>
          }
        />{' '}
        = e
        <Sup>
          −<Frac n={<>Δ<i>E</i></>} d={<i>kT</i>} size={0.9} />
        </Sup>
      </Formula>
      <Formula x={960} y={200} p={kCard} size={58} caption="pada suhu kamar (298 K)">
        <i>kT</i> ≈ 200 cm<Sup>−1</Sup>
      </Formula>
    </AbsoluteFill>
  );
};
