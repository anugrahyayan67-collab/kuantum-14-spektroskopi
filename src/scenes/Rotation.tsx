import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, slot} from '../anim';
import {Formula, Frac, Glow, Label, NuTilde, Stage, Sub, Sup, V} from '../components/primitives';
import {CO, LineSpectrum, MW, RichText, spinAngle, spinTf, type SLine} from '../components/spB';
import {SyDefs, molDraw} from '../components/syC';
import {Ring, Vec} from '../components/syD';
import {Render3D, VbDefs, proj, type Cam} from '../components/vbC';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Bab 05: spektrum rotasi CO. E_J = B J(J+1), garis J→J+1 di 2B(J+1), B ≈ 1,93 cm⁻¹, 2B ≈ 3,86 cm⁻¹, r ≈ 113 pm.
// Tinggi garis ∝ (2J+1) exp(−B J(J+1)/kT), kT(298 K) ≈ 207 cm⁻¹ → puncak J ≈ 7.
const B = 1.93;
const KT = 207.1;
const NL = 15; // garis J = 0..14
const pop = (J: number) => (2 * J + 1) * Math.exp((-B * J * (J + 1)) / KT);
const PMAX = Math.max(...Array.from({length: 40}, (_, J) => pop(J)));
const H = Array.from({length: NL}, (_, J) => pop(J) / PMAX);

// tata letak
const LX0 = 690;
const LX1 = 950;
const lyJ = (J: number) => 800 - 14 * J * (J + 1);
const SX = 1150;
const SW = 640;
const NU1 = 62;
const SY = 800;
const SH = 360;
const sx = (nu: number) => SX + (nu / NU1) * SW;

export const Rotation: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---- waktu ----
  const tE = wordOf(0, 'Energinya');
  const tA0 = wordOf(1, 'delta') + 0.2; // panah transisi pertama
  const tArrow = (k: number) => tA0 + 0.75 * k;
  const tLine = (k: number) => (k < 6 ? tArrow(k) + 0.7 : tArrow(5) + 0.7 + 0.18 * (k - 5));
  const tB = wordOf(4, 'naik');

  // J molekul: naik bersama panah transisi, lalu turun kembali (memancarkan) ke J = 3
  const Jof = (tau: number) => {
    let J = 1;
    for (let k = 1; k <= 5; k++) J += ramp(tau, tArrow(k), tArrow(k) + 0.45);
    J -= 3 * ramp(tau, cue(2) + 0.4, cue(2) + 3.2, EASE_IN_OUT);
    return J;
  };
  const Jc = Jof(t);
  const ang = spinAngle(t, (tau) => 0.95 * Math.sqrt(Math.max(0, Jof(tau) * (Jof(tau) + 1))));
  const tf = spinTf(ang);

  const pMol = ramp(t, -0.2, 0.8);
  const pLad = ramp(t, tE - 0.3, tE + 1.0);
  const pGap = ramp(t, wordOf(0, 'tambah'), wordOf(0, 'tambah') + 0.8);
  const pSpec = ramp(t, cue(1) - 0.2, cue(1) + 0.7);
  const pBr = ramp(t, wordOf(1, 'berjarak'), wordOf(1, 'berjarak') + 0.6) * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.4, EASE_IN_OUT));
  const pVal = ramp(t, wordOf(2, 'tiga', 1), wordOf(2, 'tiga', 1) + 0.6);
  const pTicks = ramp(t, cue(2), cue(2) + 0.8);
  const pR = ramp(t, wordOf(3, 'panjang'), wordOf(3, 'panjang') + 0.7);
  const pI = ramp(t, wordOf(3, 'inersia', 0), wordOf(3, 'inersia', 0) + 0.6);
  const pBoltz = ramp(t, tB, tB + 2.2, EASE_IN_OUT);
  const pEnv = ramp(t, tB + 0.6, tB + 2.6);
  const pPeak = ramp(t, wordOf(4, 'turun'), wordOf(4, 'turun') + 0.6, BACK);

  // ---- molekul ----
  const cam: Cam = {cx: 390, cy: 520, s: 165, yaw: 0, pitch: -0.42};
  const items = molDraw(cam, CO, {tf, opacity: pMol, rs: 1.25});
  const pc = proj(tf(CO.atoms[0].pos), cam);
  const po = proj(tf(CO.atoms[1].pos), cam);
  const pm = proj([0, 0, 0], cam);
  const bl = Math.hypot(po.X - pc.X, po.Y - pc.Y) || 1;
  let nx = -(po.Y - pc.Y) / bl;
  let ny = (po.X - pc.X) / bl;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const off = 62;

  // ---- garis spektrum ----
  const lines: SLine[] = H.map((h, k) => {
    const p = ramp(t, tLine(k), tLine(k) + 0.45);
    return {nu: 2 * B * (k + 1), h: p * mix(0.12, h, pBoltz), color: MW, op: Math.min(1, p * 2), w: 4};
  });

  // ---- kartu rumus (satu per momen) ----
  const k0 = slot(t, tE - 0.2, cue(1));
  const k1 = slot(t, cue(1), cue(2));
  const k2 = slot(t, cue(2), cue(3));
  const k3 = slot(t, cue(3), cue(4));
  const k4 = ramp(t, cue(4), cue(4) + 0.6);
  const CX = 1470;
  const CY = 240;

  // amplop Boltzmann (J kontinu)
  const env = Array.from({length: 121}, (_, i) => {
    const nu = 2 * B + ((NU1 - 2 * B) * i) / 120;
    const J = nu / (2 * B) - 1;
    return `${i ? 'L' : 'M'}${sx(nu).toFixed(1)},${(SY - (pop(J) / PMAX) * SH).toFixed(1)}`;
  }).join(' ');

  return (
    <AbsoluteFill>
      <Stage>
        <SyDefs />
        <VbDefs />

        {/* ===== molekul CO berputar ===== */}
        <Glow x={390} y={520} r={230} color="cyan" opacity={pMol * (0.12 + 0.03 * Jc)} />
        {/* lintasan putar (elips) */}
        <ellipse cx={390} cy={520} rx={0.645 * 165 * 1.25} ry={0.645 * 165 * 1.25 * Math.sin(0.42)} fill="none" stroke={C.cyan} strokeWidth={1.5} strokeDasharray="5 9" opacity={0.35 * pMol} />
        <Render3D items={items} />
        <g opacity={pR}>
          <line x1={pc.X + nx * off} y1={pc.Y + ny * off} x2={po.X + nx * off} y2={po.Y + ny * off} stroke={C.gold} strokeWidth={3} />
          <line x1={pc.X + nx * (off - 12)} y1={pc.Y + ny * (off - 12)} x2={pc.X + nx * (off + 12)} y2={pc.Y + ny * (off + 12)} stroke={C.gold} strokeWidth={3} />
          <line x1={po.X + nx * (off - 12)} y1={po.Y + ny * (off - 12)} x2={po.X + nx * (off + 12)} y2={po.Y + ny * (off + 12)} stroke={C.gold} strokeWidth={3} />
          <Label x={(pc.X + po.X) / 2 + nx * (off + 34)} y={(pc.Y + po.Y) / 2 + ny * (off + 34)} size={28} color={C.gold} weight={700}>
            r ≈ 113 pm
          </Label>
        </g>
        <g opacity={pI}>
          <circle cx={pm.X} cy={pm.Y} r={7} fill={C.gold} />
          <circle cx={pm.X} cy={pm.Y} r={16 + 3 * Math.sin(t * 4)} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.6} />
          <Label x={390} y={770} size={22} color={C.muted}>
            berputar di sekitar pusat massa
          </Label>
        </g>
        {/* label J molekul */}
        {[1, 2, 3, 4, 5, 6].map((J) => {
          const o = Math.max(0, 1 - Math.abs(Jc - J) * 1.6) * pMol;
          return <RichText key={J} x={390} y={290} segs={[['J', 'i'], ` = ${J}`]} size={44} color={C.cyan} opacity={o} weight={700} />;
        })}
        <RichText x={390} y={710} segs={['laju putar ∝ √', ['J', 'i'], '(', ['J', 'i'], ' + 1)']} size={26} color={C.muted} opacity={pMol * (1 - pI)} weight={500} />

        {/* ===== tangga E_J ===== */}
        <g opacity={pLad}>
          <RichText x={820} y={150} segs={[['E', 'i'], ['J', 'sub'], ' = ', ['B', 'i'], ' ', ['J', 'i'], '(', ['J', 'i'], ' + 1)']} size={30} color={C.cyan} opacity={pLad * (1 - k0) * 0.9} weight={600} />
          {[0, 1, 2, 3, 4, 5, 6].map((J) => {
            const p = ramp(t, tE - 0.3 + 0.12 * J, tE + 0.3 + 0.12 * J);
            const y = lyJ(J);
            const hl = Math.max(0, 1 - Math.abs(Jc - J));
            return (
              <g key={J} opacity={p}>
                <line x1={LX0} y1={y} x2={mix(LX0, LX1, p)} y2={y} stroke={C.cyan} strokeWidth={3 + 3 * hl} opacity={0.6 + 0.4 * hl} strokeLinecap="round" />
                <RichText x={LX0 - 16} y={y} segs={[['J', 'i'], ` = ${J}`]} size={20} anchor="end" color={C.cyan} font="mono" weight={500} opacity={0.75 + 0.25 * hl} />
              </g>
            );
          })}
          {/* jarak antartingkat 2B, 4B, 6B … */}
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <g key={k} opacity={pGap * ramp(t, wordOf(0, 'tambah') + 0.15 * k, wordOf(0, 'tambah') + 0.15 * k + 0.4)}>
              <line x1={LX1 + 14} y1={lyJ(k) - 3} x2={LX1 + 14} y2={lyJ(k + 1) + 3} stroke={C.muted} strokeWidth={1.5} />
              <RichText x={LX1 + 26} y={(lyJ(k) + lyJ(k + 1)) / 2} segs={[`${2 * (k + 1)}`, ['B', 'i']]} size={19} anchor="start" color={C.muted} font="mono" weight={500} />
            </g>
          ))}
          {/* panah transisi J → J+1 dan butir yang jatuh ke garis spektrum */}
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = tArrow(k);
            const p = ramp(t, a, a + 0.4);
            const x = 712 + 38 * k;
            const y0 = lyJ(k) - 3;
            const y1 = lyJ(k + 1) + 3;
            const q = ramp(t, a + 0.25, a + 0.75, EASE_IN_OUT);
            const fx = sx(2 * B * (k + 1));
            const qx = mix(x, fx, q);
            const qy = mix((y0 + y1) / 2, SY, q) - Math.sin(Math.PI * q) * 140;
            const dotOp = q > 0 && q < 1 ? Math.min(1, q * 8, (1 - q) * 8) : 0;
            return (
              <g key={k}>
                <Vec x1={x} y1={y0} x2={x} y2={mix(y0, y1, p)} color={MW} width={4} head={12} halo={false} opacity={p > 0 ? 0.95 : 0} />
                <circle cx={qx} cy={qy} r={7} fill={MW} opacity={dotOp} />
                <circle cx={qx} cy={qy} r={14} fill={MW} opacity={dotOp * 0.25} />
              </g>
            );
          })}
        </g>

        {/* ===== spektrum ===== */}
        <LineSpectrum x={SX} y={SY} w={SW} h={SH} nu0={0} nu1={NU1} lines={lines} ticks={[0, 10, 20, 30, 40, 50, 60]} tickOp={pTicks} t={t} opacity={pSpec} />
        <g opacity={pSpec}>
          <RichText x={SX - 4} y={SY - SH - 14} segs={['gelombang mikro · bilangan gelombang / cm', ['−1', 'sup']]} size={21} anchor="start" color={C.muted} weight={500} font="sans" />
        </g>
        {/* jarak sama 2B */}
        {(() => {
          const xa = sx(2 * B * 3);
          const xb = sx(2 * B * 4);
          const y = SY - 82;
          return (
            <g opacity={pBr}>
              <line x1={xa} y1={y} x2={xb} y2={y} stroke={C.gold} strokeWidth={3} />
              <path d={`M${xa + 9},${y - 6} L${xa},${y} L${xa + 9},${y + 6}`} fill="none" stroke={C.gold} strokeWidth={3} />
              <path d={`M${xb - 9},${y - 6} L${xb},${y} L${xb - 9},${y + 6}`} fill="none" stroke={C.gold} strokeWidth={3} />
              <RichText x={(xa + xb) / 2} y={y - 26} segs={['2', ['B', 'i']]} size={28} color={C.gold} weight={700} />
              <RichText x={(xa + xb) / 2} y={y - 60} segs={['≈ 3,86 cm', ['−1', 'sup']]} size={24} color={C.gold} weight={600} opacity={pVal} />
              {[1, 2, 4, 5, 6, 7].map((k) => {
                const x0 = sx(2 * B * k);
                const x1 = sx(2 * B * (k + 1));
                return <line key={k} x1={x0 + 4} y1={y + 30} x2={x1 - 4} y2={y + 30} stroke={C.gold} strokeWidth={2} opacity={0.45 * ramp(t, wordOf(1, 'berjarak') + 0.4 + 0.1 * k, wordOf(1, 'berjarak') + 0.8 + 0.1 * k)} />;
              })}
            </g>
          );
        })()}
        {/* amplop Boltzmann */}
        <path d={env} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="10 8" opacity={0.85 * pEnv} pathLength={1000} strokeDashoffset={0} />
        <g opacity={pPeak}>
          <Label x={sx(2 * B * 8) + 24} y={SY - SH + 10} size={26} color={C.gold} weight={700} anchor="start">
            puncak J ≈ 7
          </Label>
          <Ring x={sx(2 * B * 8)} y={SY - SH} p={ramp(t, wordOf(4, 'turun'), wordOf(4, 'turun') + 1.2)} r={60} color={C.gold} />
        </g>
        <g opacity={pEnv}>
          <RichText x={SX + 10} y={SY - 200} segs={['naik: 2', ['J', 'i'], ' + 1']} size={21} color={C.muted} anchor="start" weight={500} />
          <Label x={SX + SW - 4} y={SY - 200} size={21} color={C.muted} anchor="end">
            turun: Boltzmann
          </Label>
        </g>
      </Stage>

      {/* kartu rumus — satu per momen */}
      <Formula x={CX} y={CY} p={k0} accent={C.cyan} size={58}>
        <V>E</V>
        <Sub>J</Sub> = <V>B</V> <V>J</V>(<V>J</V> + 1)
      </Formula>
      <Formula x={CX} y={CY} p={k1} accent={C.cyan} size={58} caption="transisi J → J + 1">
        <NuTilde /> = 2<V>B</V>(<V>J</V> + 1)
      </Formula>
      <Formula x={CX} y={CY + 10} p={k2} accent={C.gold} size={56}>
        <div>
          <V>B</V> ≈ 1,93 cm<Sup>−1</Sup>
        </div>
        <div style={{opacity: pVal}}>
          2<V>B</V> ≈ 3,86 cm<Sup>−1</Sup>
        </div>
      </Formula>
      <Formula x={CX} y={CY + 10} p={k3} accent={C.gold} size={56}>
        <div>
          <V>B</V> → <V>I</V> = <V>μr</V>
          <Sup>2</Sup>
        </div>
        <div style={{opacity: pR}}>
          <V>r</V> ≈ 113 pm
        </div>
      </Formula>
      <Formula x={CX} y={CY} p={k4} accent={C.gold} size={56}>
        <V>N</V>
        <Sub>J</Sub> ∝ (2<V>J</V> + 1) exp(−
        <Frac
          n={
            <>
              <V>E</V>
              <Sub>J</Sub>
            </>
          }
          d={<V>kT</V>}
        />
        )
      </Formula>
    </AbsoluteFill>
  );
};
