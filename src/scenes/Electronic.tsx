import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, mix, ramp, slot} from '../anim';
import {DrawPath, Formula, Glow, Label, Stage, Sub, V} from '../components/primitives';
import {type Cam, type V3, Render3D, VbDefs, proj} from '../components/vbC';
import {diatomic, molItems3, place, water} from '../components/syD';
import {Electron, wlColor} from '../components/viz';
import {Beam, Stopwatch, Wavelet, gauss, integ} from '../components/spC';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 08: spektrum elektronik. Dua kurva energi potensial (Morse, skala kualitatif dalam piksel);
// keadaan tereksitasi: minimum bergeser ke kanan (ikatan lebih panjang), lebih dangkal.
// Transisi Franck–Condon tegak dari v = 0; intensitas tiap v' ∝ tumpang-tindih (dimodelkan Gauss).
const RX = (R: number) => 860 + (R - 0.75) * 330;
const EY = (U: number) => 820 - U;
const G = {De: 210, a: 1.6, Re: 1.3, T: 0, w: 44};
const X = {De: 170, a: 1.4, Re: 1.65, T: 330, w: 26};
type Pot = typeof G;
const U = (P: Pot, R: number) => P.T + P.De * (1 - Math.exp(-P.a * (R - P.Re))) ** 2;
const Ev = (P: Pot, v: number) => P.w * (v + 0.5) - ((P.w * P.w) / (4 * P.De)) * (v + 0.5) ** 2;
const turn = (P: Pot, E: number): [number, number] => {
  const q = Math.sqrt(Math.min(0.999, E / P.De));
  return [P.Re - Math.log(1 + q) / P.a, P.Re - Math.log(1 - q) / P.a];
};
const curveD = (P: Pot, R0: number, R1: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const R = R0 + ((R1 - R0) * i) / 160;
    const u = U(P, R);
    if (EY(u) < 205) continue;
    pts.push(`${RX(R).toFixed(1)},${EY(u).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};
const E00 = Ev(G, 0);
const EVERT = U(X, G.Re) - X.T;
const NV = 6;
const FC = Array.from({length: NV}, (_, v) => gauss(Ev(X, v), EVERT, 28));

// spektrum progresi (kiri bawah)
const SB = 842;
const SXE = (E: number) => 170 + (E - 300) * 3.55;
const PEAKX = Array.from({length: NV}, (_, v) => SXE(X.T + Ev(X, v) - E00));

const BAND_NM = 520;
const SOL = '#d0407a';

export const Electronic: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);

  const tJump = wordOf(0, 'melompat');
  const tVib = wordOf(0, 'bergetar');
  const tRot = wordOf(0, 'berputar');
  const tFz0 = wordOf(1, 'Lompatan');
  const tFz = wordOf(1, 'membeku');
  const tLand = wordOf(3, 'mendarat');
  const tTegak = wordOf(2, 'tegak');
  const tDeret = wordOf(3, 'deretan');
  const tSol = wordOf(4, 'larutan');
  const tMelt = wordOf(4, 'melebur');
  const tUV = wordOf(4, 'UV');

  const frost = (x: number) => ramp(x, tFz0, tFz0 + 1.6) * (1 - ramp(x, tLand - 0.2, tLand + 0.8));
  const speed = (x: number) => 1 - frost(x);
  const spin = (x: number) => ramp(x, tRot - 0.4, tRot + 0.8) * speed(x);
  const vibPh = 2 * Math.PI * 0.9 * integ(speed, t);
  const rotPh = 0.55 * integ(spin, t);
  const fz = frost(t);
  const exc = ramp(t, tLand - 0.2, tLand + 1.2);
  const amp = 0.035 + 0.045 * ramp(t, tVib - 0.3, tVib + 0.8) + 0.05 * exc;
  const stretch = 1 + 0.22 * exc;

  // elektron melompat
  const phIn = ramp(t, tJump - 1.4, tJump - 0.1, EASE_IN_OUT);
  const jump = ramp(t, tJump - 0.15, tJump + 0.5);
  const leftIn = ramp(t, cue(0) - 0.6, cue(0) + 0.4);

  // diagram & spektrum
  const diagOut = 1 - ramp(t, tUV - 1.0, tUV - 0.2, EASE_IN_OUT);
  const diag = ramp(t, cue(1) - 0.4, cue(1) + 0.6) * diagOut;
  const drawG = ramp(t, cue(1) - 0.2, cue(1) + 1.6, EASE_IN_OUT);
  const drawX = ramp(t, cue(1) + 0.6, cue(1) + 2.4, EASE_IN_OUT);
  const guide = ramp(t, tFz - 0.3, tFz + 0.5);
  const arrowP = ramp(t, tTegak - 0.3, tTegak + 0.9, EASE_IN_OUT);
  const card2 = slot(t, wordOf(2, 'Franck') - 0.3, cue(3) - 0.1);
  const land = (v: number) => ramp(t, tLand + (v - 1) * 0.35, tLand + 0.5 + (v - 1) * 0.35);
  const specIn = ramp(t, tLand - 0.3, tLand + 0.5);
  const peakP = (v: number) => ramp(t, tDeret - 0.8 + v * 0.22, tDeret - 0.1 + v * 0.22);
  const melt = ramp(t, tMelt - 0.3, tMelt + 2.2, EASE_IN_OUT);
  const solv = ramp(t, tSol - 0.6, tSol + 0.8);
  const spec = ramp(t, tUV - 0.6, tUV + 0.6);
  const lab = ramp(t, wordOf(4, 'laboratorium') - 0.3, wordOf(4, 'laboratorium') + 0.6);

  const MX = 400;
  const MY = 360;
  const cam: Cam = {cx: MX, cy: MY, s: 150, yaw: 0.25 + rotPh, pitch: -0.2 - 0.25 * Math.sin(rotPh * 0.7), persp: 9};
  const base = diatomic('N');
  const mol = place(base, (p) => [p[0] * stretch * (1 + (amp / 0.55) * Math.sin(vibPh)), p[1], p[2]] as V3);
  const A = proj(mol.atoms[0].pos, cam);
  const B = proj(mol.atoms[1].pos, cam);
  const ang = (Math.atan2(B.Y - A.Y, B.X - A.X) * 180) / Math.PI;
  const half = Math.hypot(B.X - A.X, B.Y - A.Y) / 2;
  const cloudCol = interpolateColors(jump, [0, 1], [C.cyan, C.violet]);

  // spektrum: puncak sempit → pita lebar
  const sig = mix(5, 30, melt);
  const hK = 165 * Math.pow(5 / sig, 0.45);
  const specD = (() => {
    let d = '';
    const n = 180;
    for (let i = 0; i <= n; i++) {
      const x = 140 + (580 * i) / n;
      let y = 0;
      for (let v = 0; v < NV; v++) y += FC[v] * peakP(v) * gauss(x, PEAKX[v], sig);
      d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(SB - hK * y).toFixed(1)}`;
    }
    return d;
  })();

  // spektrofotometer
  const lam = 550 + 140 * Math.sin(t * 0.9);
  const absorb = gauss(lam, BAND_NM, 45);
  const xV = RX(G.Re);
  const yV0 = EY(E00);

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <VbDefs />
        <defs>
          <radialGradient id="el-cloud">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.3} />
            <stop offset="45%" stopColor="#fff" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <Glow x={MX} y={MY} r={420} color="violet" opacity={(0.08 + 0.04 * Math.sin(t)) * leftIn} />

        {/* ---------------- kiri: molekul, elektron, jam ---------------- */}
        <g opacity={leftIn}>
          {/* pelarut */}
          {Array.from({length: 8}, (_, k) => {
            const a0 = (k / 8) * Math.PI * 2 + 0.2;
            const jit = 10 * Math.sin(t * (1.3 + 0.2 * k) + k);
            const r = 215 + jit;
            const wx = MX + Math.cos(a0) * r;
            const wy = MY + Math.sin(a0) * r * 0.78;
            const op = solv * ramp(t, tSol - 0.6 + k * 0.08, tSol + 0.4 + k * 0.08);
            if (op <= 0.01) return null;
            const wc: Cam = {cx: wx, cy: wy, s: 44, yaw: t * (0.5 + 0.1 * k) + k, pitch: -0.3 + 0.3 * Math.sin(k), persp: 9};
            return <Render3D key={k} items={molItems3(wc, water(), {labels: false})} opacity={op * 0.9} />;
          })}
          <g transform={`rotate(${ang.toFixed(2)} ${((A.X + B.X) / 2).toFixed(1)} ${((A.Y + B.Y) / 2).toFixed(1)})`}>
            <ellipse cx={(A.X + B.X) / 2} cy={(A.Y + B.Y) / 2} rx={half + 95 + 18 * jump} ry={88 + 16 * jump} fill="url(#el-cloud)" opacity={0.6} />
            <ellipse
              cx={(A.X + B.X) / 2}
              cy={(A.Y + B.Y) / 2}
              rx={half + 95 + 18 * jump}
              ry={88 + 16 * jump}
              fill={cloudCol}
              fillOpacity={0.1}
              stroke={cloudCol}
              strokeOpacity={0.45}
              strokeWidth={2}
              strokeDasharray="6 8"
            />
          </g>
          <Render3D items={molItems3(cam, mol)} />
          {/* bingkai "jepretan" saat inti membeku */}
          <g opacity={fz}>
            <rect x={MX - 230} y={MY - 160} width={460} height={320} rx={18} fill={C.cyan} fillOpacity={0.05} stroke={C.cyan} strokeWidth={3} strokeDasharray="14 10" />
            <Label x={MX} y={MY + 190} size={28} color={C.cyan} weight={700}>
              inti membeku
            </Label>
          </g>
          <Label x={MX} y={MY + 190} size={24} color={C.muted} font="mono" opacity={(1 - fz) * ramp(t, tVib, tVib + 0.6) * (1 - solv)}>
            gerak lambat
          </Label>

          {/* foton UV datang */}
          <Wavelet x={mix(110, MX - 150, phIn)} y={MY - 10} angle={0} color={wlColor(300)} len={110} amp={14} wl={16} opacity={phIn > 0 && phIn < 1 ? Math.min(1, phIn * 5) * (1 - phIn) * 2 : 0} phase={-t * 20} />
          {/* tingkat orbital */}
          <g opacity={1 - solv * 0.6}>
            <line x1={600} y1={292} x2={700} y2={292} stroke={C.mint} strokeWidth={4} strokeLinecap="round" />
            <line x1={600} y1={420} x2={700} y2={420} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
            <Label x={712} y={292} size={22} color={C.mint} anchor="start">
              LUMO
            </Label>
            <Label x={712} y={420} size={22} color={C.gold} anchor="start">
              HOMO
            </Label>
            <Electron x={650 + 18 * Math.sin(Math.PI * jump)} y={mix(406, 278, jump)} r={10} />
            <path d="M650,400 Q620,356 650,306" fill="none" stroke={C.violet} strokeWidth={3} strokeDasharray="5 6" opacity={0.8 * ramp(t, tJump, tJump + 0.4) * (1 - ramp(t, tJump + 1.5, tJump + 2.4))} />
          </g>
          <Stopwatch x={648} y={566} r={44} ang={2 * Math.PI * 0.35 * integ(speed, t)} frost={fz} opacity={ramp(t, tFz0 - 0.6, tFz0) * (1 - specIn)} />
        </g>

        {/* spektrum progresi vibrasi → pita lebar */}
        <g opacity={specIn}>
          <line x1={140} y1={SB} x2={730} y2={SB} stroke={C.muted} strokeWidth={2} />
          <path d={`${specD} L720,${SB} L140,${SB} Z`} fill={C.violet} fillOpacity={0.16 + 0.1 * melt} />
          <path d={specD} fill="none" stroke={C.violet} strokeWidth={3.5} />
          {Array.from({length: NV}, (_, v) => (
            <text key={v} x={PEAKX[v]} y={SB - 165 * FC[v] - 18} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={20} fill={C.ink} opacity={peakP(v) * (1 - melt) * (FC[v] > 0.2 ? 1 : 0.6)}>
              v′={v}
            </text>
          ))}
          <Label x={730} y={SB + 26} size={20} color={C.muted} anchor="end" font="mono">
            energi foton →
          </Label>
          <Label x={140} y={SB + 26} size={20} color={C.violet} anchor="start" opacity={1 - melt}>
            deret puncak vibrasi (gas)
          </Label>
          <Label x={140} y={SB + 26} size={20} color={C.violet} anchor="start" opacity={melt}>
            pita lebar (larutan)
          </Label>
        </g>

        {/* ---------------- kanan: diagram energi potensial ---------------- */}
        <g opacity={diag}>
          <line x1={850} y1={850} x2={1760} y2={850} stroke={C.muted} strokeWidth={2} />
          <line x1={850} y1={850} x2={850} y2={210} stroke={C.muted} strokeWidth={2} />
          <path d="M850,204 l-8,14 l16,0 Z" fill={C.muted} />
          <path d="M1766,850 l-14,-8 l0,16 Z" fill={C.muted} />
          <text x={830} y={230} textAnchor="end" fontFamily={FONT.serif} fontStyle="italic" fontSize={30} fill={C.muted}>
            E
          </text>
          <Label x={1755} y={878} size={22} color={C.muted} anchor="end">
            jarak inti R
          </Label>
          <DrawPath d={curveD(G, 0.95, 3.4)} p={drawG} stroke={C.blue} width={4} />
          <DrawPath d={curveD(X, 1.15, 3.4)} p={drawX} stroke={C.violet} width={4} />
          <Label x={1745} y={EY(G.De) - 26} size={24} color={C.blue} anchor="end" opacity={drawG}>
            keadaan dasar
          </Label>
          <Label x={1745} y={EY(X.T + X.De) + 58} size={24} color={C.violet} anchor="end" opacity={drawX}>
            keadaan tereksitasi
          </Label>
          {/* tingkat vibrasi */}
          {Array.from({length: 5}, (_, v) => {
            const E = Ev(G, v);
            const [r0, r1] = turn(G, E);
            return <line key={`g${v}`} x1={RX(r0)} y1={EY(E)} x2={RX(r1)} y2={EY(E)} stroke={C.blue} strokeWidth={v === 0 ? 3 : 2} opacity={(v === 0 ? 0.95 : 0.5) * ramp(t, cue(1) + 1 + v * 0.12, cue(1) + 1.5 + v * 0.12)} />;
          })}
          {Array.from({length: 8}, (_, v) => {
            const E = Ev(X, v);
            const [r0, r1] = turn(X, E);
            const L = v < NV && v > 0 ? land(v) : 0;
            return (
              <line
                key={`x${v}`}
                x1={RX(r0)}
                y1={EY(X.T + E)}
                x2={RX(r1)}
                y2={EY(X.T + E)}
                stroke={C.violet}
                strokeWidth={2 + 2 * L * (v < NV ? FC[v] : 0)}
                opacity={(0.45 + 0.5 * L * (v < NV ? FC[v] : 0)) * ramp(t, cue(1) + 1.8 + v * 0.1, cue(1) + 2.3 + v * 0.1)}
              />
            );
          })}
          <Label x={RX(turn(G, E00)[1]) + 16} y={EY(E00)} size={20} color={C.blue} anchor="start" font="mono" opacity={ramp(t, cue(1) + 1.2, cue(1) + 1.8)}>
            v = 0
          </Label>
          {/* garis R tetap */}
          <g opacity={guide}>
            <line x1={xV} y1={846} x2={xV} y2={235} stroke={C.cyan} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} />
            <Label x={xV} y={222} size={22} color={C.cyan}>
              R tetap
            </Label>
          </g>
          {/* panah tegak Franck–Condon */}
          {arrowP > 0
            ? (() => {
                const yTop = EY(X.T + Ev(X, NV - 1));
                const yy = mix(yV0, yTop, arrowP);
                return (
                  <g>
                    <line x1={xV} y1={yV0} x2={xV} y2={yy} stroke={C.violet} strokeWidth={14} strokeOpacity={0.18} strokeLinecap="round" />
                    <line x1={xV} y1={yV0} x2={xV} y2={yy} stroke="#d8ccff" strokeWidth={4} strokeLinecap="round" />
                    <path d={`M${xV},${yy - 4} l-11,18 l22,0 Z`} fill="#d8ccff" />
                    <circle cx={xV} cy={yV0} r={8} fill={C.blue} />
                  </g>
                );
              })()
            : null}
          {Array.from({length: NV - 1}, (_, k) => {
            const v = k + 1;
            const L = land(v);
            if (L <= 0) return null;
            const y = EY(X.T + Ev(X, v));
            const pulse = 0.75 + 0.25 * Math.sin(t * 4 + v);
            return (
              <g key={v} opacity={L}>
                <circle cx={xV} cy={y} r={8 + 12 * FC[v]} fill={C.violet} opacity={0.3 * pulse} />
                <circle cx={xV} cy={y} r={4 + 4 * FC[v]} fill="#efe8ff" opacity={0.4 + 0.6 * FC[v]} />
                <text x={xV - 24} y={y + 6} textAnchor="end" fontFamily={FONT.serif} fontStyle="italic" fontSize={20} fill={C.violet} opacity={0.5 + 0.5 * FC[v]}>
                  v′={v}
                </text>
              </g>
            );
          })}
        </g>

        {/* ---------------- kanan (akhir): spektrofotometer UV–Vis ---------------- */}
        <g opacity={spec}>
          <Label x={1320} y={236} size={30} color={C.ink} weight={600}>
            spektrofotometer UV–Vis
          </Label>
          {/* lampu */}
          <circle cx={920} cy={400} r={70} fill="#fff6d8" opacity={0.08 + 0.03 * Math.sin(t * 3)} />
          <circle cx={920} cy={400} r={30} fill="#fff6d8" opacity={0.9} />
          <circle cx={920} cy={400} r={36} fill="none" stroke={C.muted} strokeWidth={3} />
          <Beam x1={956} y1={400} x2={1060} y2={400} color="#fff6d8" width={7} />
          {/* prisma + kipas warna */}
          <path d="M1060,350 L1110,440 L1010,440 Z" fill="rgba(200,215,255,0.12)" stroke="#c8d6ff" strokeWidth={3} transform="translate(30 -20)" />
          {Array.from({length: 9}, (_, k) => {
            const nm = 400 + k * 37.5;
            const yEnd = 340 + k * 15;
            return <line key={k} x1={1112} y1={402} x2={1190} y2={yEnd} stroke={wlColor(nm)} strokeWidth={3} opacity={0.65} />;
          })}
          <rect x={1192} y={330} width={10} height={60} fill="#2a3352" />
          <rect x={1192} y={410} width={10} height={70} fill="#2a3352" />
          <Beam x1={1202} y1={400} x2={1290} y2={400} color={wlColor(lam)} width={7} />
          <Beam x1={1370} y1={400} x2={1490} y2={400} color={wlColor(lam)} width={7} opacity={1 - 0.85 * absorb} />
          {/* kuvet */}
          <rect x={1292} y={300} width={76} height={180} rx={6} fill="rgba(200,215,255,0.06)" stroke="#c8d6ff" strokeOpacity={0.7} strokeWidth={3} />
          <rect x={1298} y={340} width={64} height={134} rx={4} fill={SOL} opacity={0.55 + 0.05 * Math.sin(t * 2)} />
          <ellipse cx={1330} cy={341} rx={30} ry={5} fill="#fff" opacity={0.2} />
          {/* detektor */}
          <rect x={1492} y={360} width={40} height={80} rx={6} fill="#1a2240" stroke={C.muted} strokeWidth={3} />
          <circle cx={1512} cy={400} r={9} fill={wlColor(lam)} opacity={0.3 + 0.7 * (1 - 0.85 * absorb)} />
          {/* layar */}
          <rect x={1560} y={300} width={220} height={180} rx={12} fill="#0b1124" stroke={C.muted} strokeWidth={2.5} />
          <path
            d={(() => {
              let d = '';
              for (let i = 0; i <= 60; i++) {
                const nm = 400 + (300 * i) / 60;
                d += `${i ? 'L' : 'M'}${(1575 + (190 * i) / 60).toFixed(1)},${(462 - 130 * gauss(nm, BAND_NM, 45)).toFixed(1)}`;
              }
              return d;
            })()}
            fill="none"
            stroke={C.violet}
            strokeWidth={3}
          />
          <line x1={1575 + ((lam - 400) / 300) * 190} y1={318} x2={1575 + ((lam - 400) / 300) * 190} y2={466} stroke={wlColor(lam)} strokeWidth={2} opacity={0.8} />
          <Label x={1670} y={500} size={18} color={C.muted} font="mono">
            A vs λ
          </Label>
          {[
            [920, 'lampu'],
            [1110, 'monokromator'],
            [1330, 'kuvet'],
            [1512, 'detektor'],
          ].map(([x, s]) => (
            <Label key={s as string} x={x as number} y={530} size={22} color={C.muted}>
              {s as string}
            </Label>
          ))}
          <g opacity={lab}>
            <rect x={1000} y={600} width={680} height={64} rx={32} fill="rgba(160,131,255,0.1)" stroke={C.violet} strokeWidth={2} />
            <Label x={1340} y={632} size={28} color={C.violet}>
              pita lebar = puncak vibrasi yang melebur
            </Label>
          </g>
        </g>
      </Stage>

      <Formula x={1440} y={262} p={card2 * diagOut} accent={C.violet} caption="lompatan elektron ≫ gerak inti">
        transisi tegak: <V>R</V>
        <Sub>sebelum</Sub> = <V>R</V>
        <Sub>sesudah</Sub>
      </Formula>
    </AbsoluteFill>
  );
};

