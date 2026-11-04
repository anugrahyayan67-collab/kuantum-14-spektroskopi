import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, slot} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {HCL2, Helix, IR, LineSpectrum, RichText, spinAngle, spinTf, stretch, type SLine} from '../components/spB';
import {SyDefs, molDraw} from '../components/syC';
import {Ring, Tick, Vec} from '../components/syD';
import {Render3D, VbDefs, type Cam} from '../components/vbC';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Bab 06: vibrasi-rotasi HCl. Pusat pita ≈ 2886 cm⁻¹; R(J) = ν₀ + (B₁+B₀)(J+1) + (B₁−B₀)(J+1)², P(J) = ν₀ − (B₁+B₀)J + (B₁−B₀)J².
// B₀ = 10,44, B₁ = 10,14 cm⁻¹ (H³⁵Cl). Intensitas ∝ (2J+1)e^(−B₀J(J+1)/kT), kT ≈ 207 cm⁻¹.
// H³⁷Cl: ν ∝ 1/√μ (vibrasi), B ∝ 1/μ (rotasi) → bergeser ≈ 2 cm⁻¹ ke bawah; kelimpahan ³⁵Cl : ³⁷Cl ≈ 3 : 1.
const NU0 = 2885.9;
const B0 = 10.44;
const B1 = 10.136;
const KT = 207.1;
const R = (J: number) => NU0 + (B1 + B0) * (J + 1) + (B1 - B0) * (J + 1) ** 2;
const P = (J: number) => NU0 - (B1 + B0) * J + (B1 - B0) * J * J;
const pop = (J: number) => (2 * J + 1) * Math.exp((-B0 * J * (J + 1)) / KT);
const PMAX = Math.max(...Array.from({length: 20}, (_, J) => pop(J)));
const MU35 = (1.00783 * 34.96885) / (1.00783 + 34.96885);
const MU37 = (1.00783 * 36.9659) / (1.00783 + 36.9659);
const RHO = Math.sqrt(MU35 / MU37);
const shift = (nu: number) => NU0 * (1 - RHO) + (nu - NU0) * (1 - RHO * RHO);
const RATIO37 = 24.2 / 75.8;

// tata letak
const SX = 160;
const SW = 1600;
const NA = 2620;
const NB = 3100;
const SY = 830;
const SH = 240;
const X = (nu: number) => SX + ((nu - NA) / (NB - NA)) * SW;
const y0 = (J: number) => 462 - 6 * J * (J + 1);
const y1 = (J: number) => 292 - 6 * J * (J + 1);
const LV0 = 230;
const LV1 = 1760;
const RCOL = C.mint;
const PCOL = C.pink;

export const Rovib: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---- L0: molekul menyerap foton IR ----
  const tAbs = wordOf(0, 'inframerah') + 0.4;
  const pMol = slot(t, -0.3, cue(2), 0.8, 0.6);
  const hin = ramp(t, wordOf(0, 'foton') - 1.4, tAbs, EASE_IN_OUT);
  const hOp = ramp(t, wordOf(0, 'foton') - 1.4, wordOf(0, 'foton') - 1.0) * (1 - ramp(t, tAbs - 0.15, tAbs + 0.25));
  const up = ramp(t, tAbs - 0.1, tAbs + 0.6);
  const pPillV = ramp(t, tAbs, tAbs + 0.5, BACK) * pMol;
  const pPillJ = ramp(t, wordOf(0, 'berganti'), wordOf(0, 'berganti') + 0.5, BACK) * pMol;
  const omega = (tau: number) => 1.2 * Math.sqrt(2) + 1.2 * (Math.sqrt(6) - Math.sqrt(2)) * ramp(tau, tAbs - 0.1, tAbs + 0.6);
  const ang = spinAngle(t, omega);
  const vib = 1 + (0.05 + 0.07 * up) * Math.sin(2 * Math.PI * 1.3 * t);
  const camM: Cam = {cx: 960, cy: 290, s: 170, yaw: 0, pitch: -0.42};
  const molIt = molDraw(camM, stretch(HCL2, vib), {tf: spinTf(ang), opacity: pMol, rs: 1.2});

  // ---- L1: spektrum ----
  const pSpec = ramp(t, cue(1) - 0.2, cue(1) + 0.6);
  const tOne = wordOf(1, 'satu');
  const tWing = wordOf(1, 'sayap');
  const pOne = ramp(t, tOne - 0.2, tOne + 0.4) * (1 - ramp(t, tWing - 0.2, tWing + 0.6, EASE_IN_OUT));
  const pCenter = ramp(t, wordOf(1, 'ribu'), wordOf(1, 'ribu') + 0.6);
  const lineP = (d: number) => ramp(t, tWing - 0.3 + 0.16 * d, tWing + 0.2 + 0.16 * d);

  // ---- L2/L3: diagram tingkat ----
  const pDia = slot(t, cue(2) - 0.2, cue(4) + 0.2, 0.8, 0.6);
  const tR = wordOf(2, 'Cabang', 0);
  const tP = wordOf(2, 'Cabang', 1);
  const pRt = ramp(t, tR, tR + 0.8);
  const pPt = ramp(t, tP, tP + 0.8);
  const tGap = wordOf(3, 'celah');
  const pGap = ramp(t, tGap, tGap + 0.6);
  const pQ = ramp(t, wordOf(3, 'nol'), wordOf(3, 'nol') + 0.6);

  // ---- L4: zoom → kembar isotop ----
  const tZ = wordOf(4, 'Perbesar');
  const pMag = ramp(t, tZ, tZ + 0.7, BACK);
  const tK = wordOf(4, 'kembar');
  const pTwin = ramp(t, tK, tK + 0.9);
  const pInset = ramp(t, tK - 0.3, tK + 0.6);
  const pIso = ramp(t, wordOf(4, 'Klorin'), wordOf(4, 'Klorin') + 0.7);
  const pMass = ramp(t, wordOf(4, 'massa'), wordOf(4, 'massa') + 0.6);
  const pShift = ramp(t, wordOf(4, 'bergeser'), wordOf(4, 'bergeser') + 0.7);

  // garis spektrum
  const base: SLine[] = [];
  const tint: SLine[] = [];
  for (let J = 0; J <= 9; J++) {
    const p = lineP(J + 0.5);
    const h = (pop(J) / PMAX) * p;
    base.push({nu: R(J), h, color: IR, op: Math.min(1, p * 2), w: 4});
    tint.push({nu: R(J), h, color: RCOL, op: Math.min(1, p * 2) * pRt, w: 4});
    base.push({nu: R(J) - shift(R(J)), h: h * RATIO37, color: IR, op: pTwin, w: 3});
  }
  for (let J = 1; J <= 10; J++) {
    const p = lineP(J);
    const h = (pop(J) / PMAX) * p;
    base.push({nu: P(J), h, color: IR, op: Math.min(1, p * 2), w: 4});
    tint.push({nu: P(J), h, color: PCOL, op: Math.min(1, p * 2) * pPt, w: 4});
    base.push({nu: P(J) - shift(P(J)), h: h * RATIO37, color: IR, op: pTwin, w: 3});
  }

  // inset kembar (sekitar R(1))
  const nuZ = R(1);
  const IX = 1010;
  const IW = 740;
  const IY = 440; // garis dasar inset
  const IH = 250;
  const iX = (nu: number) => IX + ((nu - (nuZ - 6)) / 10) * IW;
  const peak = (c: number, a: number, w: number) => (nu: number) => a * Math.exp(-(((nu - c) / w) ** 2));
  const f35 = peak(nuZ, 1, 0.32);
  const f37 = peak(nuZ - shift(nuZ), RATIO37, 0.32);
  const prof = (f: (nu: number) => number, grow: number) => {
    const pts = Array.from({length: 201}, (_, i) => {
      const nu = nuZ - 6 + (10 * i) / 200;
      return `${iX(nu).toFixed(1)},${(IY - f(nu) * IH * grow).toFixed(1)}`;
    });
    return `M${iX(nuZ - 6)},${IY} L${pts.join(' L')} L${iX(nuZ + 4)},${IY} Z`;
  };
  const magX = X(nuZ) - 4;
  const magY = SY - (pop(1) / PMAX) * SH * 0.5;

  // molekul isotop
  const iso = [
    {cy: 215, m: 35, ab: '76 %', ph: 0},
    {cy: 400, m: 37, ab: '24 %', ph: 0.6},
  ];
  const isoItems = iso.flatMap((s) => {
    const cam: Cam = {cx: 400, cy: s.cy, s: 125, yaw: 0, pitch: -0.3};
    const sv = 1 + 0.08 * Math.sin(2 * Math.PI * 1.1 * t * (s.m === 37 ? 0.985 : 1) + s.ph);
    return molDraw(cam, stretch(HCL2, sv), {opacity: pIso, rs: s.m === 37 ? 1.12 : 1.05, labels: true});
  });

  return (
    <AbsoluteFill>
      <Stage>
        <SyDefs />
        <VbDefs />

        {/* ===== L0: molekul ===== */}
        <Glow x={960} y={290} r={240} color="red" opacity={pMol * (0.08 + 0.12 * up)} />
        <Render3D items={molIt} />
        <Ring x={960} y={290} p={ramp(t, tAbs - 0.1, tAbs + 1.1)} r={200} color={C.amber} />
        <Helix x={mix(140, 800, hin)} y={290} len={300} amp={28} wl={58} phase={t * 9} color={IR} opacity={hOp * pMol} />
        <Label x={mix(140, 800, hin)} y={220} size={24} color={IR} opacity={hOp * pMol} weight={600}>
          foton inframerah
        </Label>
        <g opacity={pPillV} transform={`translate(1390 230) scale(${0.85 + 0.15 * pPillV})`}>
          <rect x={-160} y={-32} width={320} height={64} rx={32} fill="rgba(255,143,58,0.12)" stroke={C.amber} strokeWidth={2} />
          <RichText x={0} y={0} segs={['vibrasi: ', ['v', 'i'], ' 0 → 1']} size={28} color={C.amber} />
        </g>
        <g opacity={pPillJ} transform={`translate(1390 320) scale(${0.85 + 0.15 * pPillJ})`}>
          <rect x={-160} y={-32} width={320} height={64} rx={32} fill="rgba(79,214,255,0.12)" stroke={C.cyan} strokeWidth={2} />
          <RichText x={0} y={0} segs={['rotasi: ', ['J', 'i'], ' berganti']} size={28} color={C.cyan} />
        </g>
        <Label x={960} y={470} size={20} color={C.muted} opacity={pMol * 0.9}>
          gerak lambat
        </Label>

        {/* ===== diagram tingkat v = 0 dan v = 1 ===== */}
        <g opacity={pDia}>
          <RichText x={100} y={y1(2)} segs={[['v', 'i'], ' = 1']} size={30} anchor="start" color={C.amber} weight={700} />
          <RichText x={100} y={y0(2)} segs={[['v', 'i'], ' = 0']} size={30} anchor="start" color={C.amber} weight={700} />
          {[0, 1, 2, 3, 4, 5].map((J) => (
            <g key={`u${J}`}>
              <line x1={LV0} y1={y1(J)} x2={LV1} y2={y1(J)} stroke={C.amber} strokeWidth={2} opacity={0.75} />
              <RichText x={LV1 + 12} y={y1(J) + (J === 0 ? 6 : J === 1 ? -6 : 0)} segs={[['J', 'i'], ` ${J}`]} size={16} anchor="start" color={C.cyan} font="mono" weight={500} />
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((J) => (
            <g key={`l${J}`}>
              <line x1={LV0} y1={y0(J)} x2={LV1} y2={y0(J)} stroke={C.amber} strokeWidth={2} opacity={0.75} />
              <RichText x={LV1 + 12} y={y0(J) + (J === 0 ? 6 : J === 1 ? -6 : 0)} segs={[['J', 'i'], ` ${J}`]} size={16} anchor="start" color={C.cyan} font="mono" weight={500} />
            </g>
          ))}
          {/* cabang R: ΔJ = +1 */}
          {[0, 1, 2, 3, 4].map((J) => {
            const p = ramp(t, tR + 0.18 * J, tR + 0.18 * J + 0.5);
            const x = X(R(J));
            return (
              <g key={`R${J}`}>
                <line x1={x} y1={y0(J) + 4} x2={x} y2={SY - (pop(J) / PMAX) * SH - 8} stroke={RCOL} strokeWidth={1.5} strokeDasharray="3 6" opacity={0.5 * p} />
                <Vec x1={x} y1={y0(J) - 2} x2={x} y2={mix(y0(J) - 2, y1(J + 1) + 2, p)} color={RCOL} width={4} head={13} halo={false} opacity={Math.min(1, p * 5)} />
              </g>
            );
          })}
          {/* cabang P: ΔJ = −1 */}
          {[1, 2, 3, 4].map((J) => {
            const p = ramp(t, tP + 0.18 * J, tP + 0.18 * J + 0.5);
            const x = X(P(J));
            return (
              <g key={`P${J}`}>
                <line x1={x} y1={y0(J) + 4} x2={x} y2={SY - (pop(J) / PMAX) * SH - 8} stroke={PCOL} strokeWidth={1.5} strokeDasharray="3 6" opacity={0.5 * p} />
                <Vec x1={x} y1={y0(J) - 2} x2={x} y2={mix(y0(J) - 2, y1(J - 1) + 2, p)} color={PCOL} width={4} head={13} halo={false} opacity={Math.min(1, p * 5)} />
              </g>
            );
          })}
          {/* ΔJ = 0 terlarang */}
          <g opacity={pQ}>
            <line x1={X(NU0)} y1={y0(2) - 2} x2={X(NU0)} y2={y1(2) + 14} stroke={C.red} strokeWidth={4} strokeDasharray="8 8" />
            <path d={`M${X(NU0) - 10},${y1(2) + 18} L${X(NU0)},${y1(2) + 4} L${X(NU0) + 10},${y1(2) + 18}`} fill="none" stroke={C.red} strokeWidth={4} />
            <Tick x={X(NU0)} y={(y0(2) + y1(2)) / 2} ok={false} s={24} p={ramp(t, wordOf(3, 'nol') + 0.2, wordOf(3, 'nol') + 0.8)} />
            <RichText x={X(NU0) + 36} y={(y0(2) + y1(2)) / 2} segs={['Δ', ['J', 'i'], ' = 0']} size={26} anchor="start" color={C.red} weight={700} />
          </g>
        </g>

        {/* label cabang */}
        <g opacity={pRt * (1 - pIso)}>
          <RichText x={X(2995)} y={516} segs={['cabang R · Δ', ['J', 'i'], ' = +1 · energi tinggi']} size={26} color={RCOL} weight={700} />
        </g>
        <g opacity={pPt * (1 - pIso)}>
          <RichText x={X(2765)} y={516} segs={['cabang P · Δ', ['J', 'i'], ' = −1 · energi rendah']} size={26} color={PCOL} weight={700} />
        </g>

        {/* ===== spektrum ===== */}
        <LineSpectrum x={SX} y={SY} w={SW} h={SH} nu0={NA} nu1={NB} lines={base} ticks={[2650, 2750, 2850, 2950, 3050]} t={t} opacity={pSpec} />
        <LineSpectrum x={SX} y={SY} w={SW} h={SH} nu0={NA} nu1={NB} lines={tint} t={t} opacity={pSpec * Math.max(pRt, pPt)} bare />
        <g opacity={pSpec}>
          <RichText x={SX + SW} y={SY - SH - 14} segs={['HCl gas · cm', ['−1', 'sup']]} size={21} anchor="end" color={C.muted} weight={500} />
          {/* satu garis (yang tidak terjadi) */}
          <rect x={X(NU0) - 3} y={SY - SH * 0.9} width={6} height={SH * 0.9} fill={IR} opacity={0.6 * pOne} />
          <Label x={X(NU0)} y={SY - SH * 0.9 - 24} size={22} color={IR} opacity={pOne}>
            satu garis?
          </Label>
          <g opacity={pCenter}>
            <line x1={X(NU0)} y1={SY - 110} x2={X(NU0)} y2={SY} stroke={C.gold} strokeWidth={2} strokeDasharray="6 7" opacity={0.7} />
            <RichText x={X(NU0)} y={SY - SH + 6} segs={['≈ 2886 cm', ['−1', 'sup']]} size={26} color={C.gold} weight={700} />
          </g>
          {/* celah kosong */}
          <g opacity={pGap}>
            <rect x={X(P(1)) + 8} y={SY - 150} width={X(R(0)) - X(P(1)) - 16} height={150} fill={C.red} opacity={0.08 + 0.05 * Math.sin(t * 3)} rx={6} />
            <Label x={X(NU0)} y={SY - 170} size={22} color={C.red} weight={600}>
              tanpa cabang Q
            </Label>
          </g>
          {/* kaca pembesar */}
          <g opacity={pMag}>
            <circle cx={magX} cy={magY} r={46} fill="rgba(255,194,74,0.05)" stroke={C.gold} strokeWidth={3} />
            <line x1={magX + 33} y1={magY + 33} x2={magX + 56} y2={magY + 56} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
          </g>
        </g>

        {/* ===== inset kembar ===== */}
        <g opacity={pInset}>
          <line x1={magX} y1={magY - 46} x2={IX - 20} y2={IY + 40} stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
          <line x1={magX + 40} y1={magY - 24} x2={IX + IW + 20} y2={IY + 40} stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
          <rect x={IX - 20} y={IY - IH - 60} width={IW + 40} height={IH + 100} rx={16} fill="rgba(8,12,28,0.88)" stroke={C.gold} strokeWidth={2} />
          <line x1={IX} y1={IY} x2={IX + IW} y2={IY} stroke={C.muted} strokeWidth={2} />
          <path d={prof(f37, pTwin)} fill={C.violet} opacity={0.35} />
          <path d={prof(f37, pTwin)} fill="none" stroke={C.violet} strokeWidth={3} />
          <path d={prof(f35, ramp(t, tK - 0.3, tK + 0.5))} fill={IR} opacity={0.35} />
          <path d={prof(f35, ramp(t, tK - 0.3, tK + 0.5))} fill="none" stroke={IR} strokeWidth={3} />
          <RichText x={iX(nuZ) + 16} y={IY - IH - 24} segs={['H', ['35', 'sup'], 'Cl']} size={30} anchor="start" color={IR} weight={700} opacity={pTwin} />
          <RichText x={iX(nuZ - shift(nuZ)) - 16} y={IY - IH * RATIO37 - 30} segs={['H', ['37', 'sup'], 'Cl']} size={30} anchor="end" color={C.violet} weight={700} opacity={pTwin} />
          <Label x={IX + IW - 10} y={IY - IH + 10} size={26} color={C.gold} weight={700} anchor="end" opacity={pTwin}>
            tinggi ≈ 3 : 1
          </Label>
          <g opacity={pShift}>
            <line x1={iX(nuZ - shift(nuZ))} y1={IY + 20} x2={iX(nuZ)} y2={IY + 20} stroke={C.gold} strokeWidth={2.5} />
            <path d={`M${iX(nuZ - shift(nuZ)) + 8},${IY + 14} L${iX(nuZ - shift(nuZ))},${IY + 20} L${iX(nuZ - shift(nuZ)) + 8},${IY + 26}`} fill="none" stroke={C.gold} strokeWidth={2.5} />
            <RichText x={iX(nuZ) + 14} y={IY + 20} segs={['≈ 2 cm', ['−1', 'sup'], ' lebih rendah']} size={22} anchor="start" color={C.gold} weight={600} />
          </g>
        </g>

        {/* molekul isotop */}
        <Render3D items={isoItems} />
        {iso.map((s) => (
          <g key={s.m} opacity={pIso}>
            <RichText x={560} y={s.cy - 20} segs={['H', [String(s.m), 'sup'], 'Cl']} size={36} anchor="start" color={s.m === 35 ? IR : C.violet} weight={700} />
            <RichText x={560} y={s.cy + 22} segs={[`Cl = ${s.m} u · ${s.ab}`]} size={22} anchor="start" color={C.muted} weight={500} opacity={pMass} />
          </g>
        ))}
        <Label x={400} y={490} size={21} color={C.muted} opacity={pShift} weight={500}>
          lebih berat → bergetar sedikit lebih lambat
        </Label>
      </Stage>
    </AbsoluteFill>
  );
};
