import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, slot} from '../anim';
import {Card, Formula, Glow, Label, Stage, Sub, V} from '../components/primitives';
import {Stamp} from '../components/grupD';
import {type Cam, type V3, Render3D, SvgChem, VbDefs, proj} from '../components/vbC';
import {type Mol, Tick, co2, co2Mode, diatomic, molItems3, vibrate} from '../components/syD';
import {wlColor} from '../components/viz';
import {Beam, Medal, Wavelet, gauss} from '../components/spC';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 07: hamburan Raman. Laser 532 nm; Rayleigh (warna sama), Stokes (energi lebih rendah → lebih merah),
// anti-Stokes (energi lebih tinggi → lebih biru, lebih jarang). Selisih = energi vibrasi.
const GREEN = wlColor(532);
const STOKES = wlColor(607);
const ANTI = wlColor(474);

const SX = 640; // pusat sampel
const SY = 470;

// spektrum hamburan (sumbu: energi foton terhambur →)
const PX0 = 1070;
const PX1 = 1770;
const PB = 600;
const XR = 1420;
const DX = 225;

const peakD = (cx: number, h: number, w: number) => {
  let d = '';
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const x = cx - 4 * w + (8 * w * i) / n;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(PB - h * gauss(x, cx, w)).toFixed(1)}`;
  }
  return d;
};

const Cloud: React.FC<{a: {X: number; Y: number}; b: {X: number; Y: number}; pad: number; thick: number; opacity?: number}> = ({a, b, pad, thick, opacity = 1}) => {
  const cx = (a.X + b.X) / 2;
  const cy = (a.Y + b.Y) / 2;
  const half = Math.hypot(b.X - a.X, b.Y - a.Y) / 2;
  const ang = (Math.atan2(b.Y - a.Y, b.X - a.X) * 180) / Math.PI;
  return (
    <g opacity={opacity} transform={`rotate(${ang.toFixed(2)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}>
      <ellipse cx={cx} cy={cy} rx={half + pad} ry={thick} fill="url(#sp-cloud)" />
      <ellipse cx={cx} cy={cy} rx={half + pad} ry={thick} fill="none" stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="5 7" />
    </g>
  );
};

const ROWS: {name: string; mol: 'N2' | 'sym' | 'asym' | 'bend'; ir: boolean; ra: boolean}[] = [
  {name: 'regangan', mol: 'N2', ir: false, ra: true},
  {name: 'regangan simetris', mol: 'sym', ir: false, ra: true},
  {name: 'regangan asimetris', mol: 'asym', ir: true, ra: false},
  {name: 'tekukan', mol: 'bend', ir: true, ra: false},
];
const N2MODE: V3[] = [
  [-1, 0, 0],
  [1, 0, 0],
];
const RY = [330, 450, 570, 690];
const IRX = 1190;
const RAX = 1440;

export const Raman: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);

  // ---- bagian A: laser, hamburan, spektrum (baris 0–2)
  const tLaser = wordOf(0, 'laser');
  const tScat = wordOf(0, 'terhambur');
  const aOut = 1 - ramp(t, cue(3) - 0.5, cue(3) + 0.2, EASE_IN_OUT);
  const setup = ramp(t, cue(0) - 0.6, cue(0) + 0.4) * aOut;
  const beamP = ramp(t, tLaser - 0.2, tLaser + 0.5);
  const tOn = tLaser + 0.4;
  const color = ramp(t, wordOf(1, 'Sebagian') - 0.2, wordOf(1, 'berbeda') + 0.4);
  const specIn = ramp(t, tScat - 0.3, tScat + 0.5) * aOut;
  const rayH = 300 * ramp(t, tScat, tScat + 1.0);
  const stH = 82 * ramp(t, wordOf(1, 'berbeda') - 0.3, wordOf(1, 'berbeda') + 0.7);
  const asH = 34 * ramp(t, wordOf(1, 'berbeda') + 0.1, wordOf(1, 'berbeda') + 1.0);
  const brk = ramp(t, wordOf(1, 'Selisihnya') - 0.2, wordOf(1, 'Selisihnya') + 0.6);
  const vibHL = ramp(t, wordOf(1, 'vibrasi') - 0.2, wordOf(1, 'vibrasi') + 0.5);
  const card1 = slot(t, wordOf(1, 'Selisihnya') - 0.3, cue(2));
  const badge = slot(t, wordOf(2, 'Raman') - 0.5, cue(3) - 0.3, 0.6, 0.45);
  const yr1928 = ramp(t, wordOf(2, 'delapan') - 0.4, wordOf(2, 'delapan') + 0.3);
  const nobel = ramp(t, wordOf(2, 'Nobel') - 0.3, wordOf(2, 'Nobel') + 0.4);

  // foton terhambur
  const DT = 0.075;
  const LIFE = 1.5;
  const photons: React.ReactNode[] = [];
  if (setup > 0.01 && t > tOn) {
    const kMax = Math.floor((t - tOn) / DT);
    const kMin = Math.max(0, Math.ceil((t - tOn - LIFE) / DT));
    for (let k = kMin; k <= kMax; k++) {
      const age = t - tOn - k * DT;
      if (age < 0 || age > LIFE) continue;
      const r0 = rand(k * 3.71 + 0.3);
      const kind = r0 < 0.1 ? 1 : r0 < 0.135 ? 2 : 0; // 1 Stokes, 2 anti-Stokes (dilebihkan)
      const ang = rand(k * 1.37 + 5.1) * Math.PI * 2;
      const u = age / LIFE;
      const rr = 105 + u * 245;
      const x = SX + Math.cos(ang) * rr;
      const y = SY + Math.sin(ang) * rr * 0.78;
      const col = kind === 1 ? STOKES : kind === 2 ? ANTI : GREEN;
      const wl = kind === 1 ? 17 : kind === 2 ? 11 : 13.5;
      const op = Math.min(1, u * 8) * (1 - u) * (kind ? color : 0.75) * setup;
      photons.push(<Wavelet key={k} x={x} y={y} angle={ang} color={col} wl={wl} len={kind ? 70 : 56} amp={kind ? 9 : 7} opacity={op} phase={-t * 18} />);
    }
  }

  // ---- bagian B: polarisabilitas (baris 3)
  const bIn = ramp(t, cue(3) - 0.1, cue(3) + 0.7) * (1 - ramp(t, cue(4) - 0.5, cue(4) + 0.1, EASE_IN_OUT));
  const polW = ramp(t, wordOf(3, 'polarisabilitas') - 0.4, wordOf(3, 'polarisabilitas') + 0.5);
  const tN2 = wordOf(3, 'dua', 0);
  const tCO2 = wordOf(3, 'simetris');
  const card3 = slot(t, wordOf(3, 'bukan') - 0.2, cue(4) - 0.1);

  // ---- bagian C: tabel IR | Raman (baris 4)
  const cIn = ramp(t, cue(4) - 0.3, cue(4) + 0.5);
  const tIR = wordOf(4, 'Inframerah');
  const tRa = wordOf(4, 'Raman');
  const comp = ramp(t, wordOf(4, 'melengkapi') - 0.3, wordOf(4, 'melengkapi') + 0.5);
  const stamp = ramp(t, wordOf(4, 'meniadakan') - 0.3, wordOf(4, 'meniadakan') + 0.3, BACK);

  const n2 = diatomic('N');
  const vibPh = t * 2 * Math.PI * 0.7;

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <VbDefs />
        <defs>
          <radialGradient id="sp-cloud">
            <stop offset="0%" stopColor={C.cyan} stopOpacity={0.32} />
            <stop offset="70%" stopColor={C.cyan} stopOpacity={0.14} />
            <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
          </radialGradient>
        </defs>
        <Glow x={SX} y={SY} r={520} color="mint" opacity={(0.05 + 0.02 * Math.sin(t * 0.8)) * setup} />

        {/* ---------------- A: laser → sampel ---------------- */}
        <g opacity={setup}>
          {/* laser */}
          <rect x={110} y={438} width={210} height={64} rx={12} fill="#141c36" stroke={C.muted} strokeWidth={3} />
          <rect x={300} y={452} width={26} height={36} rx={4} fill="#2a3352" stroke={C.muted} strokeWidth={2} />
          <circle cx={150} cy={470} r={8} fill={GREEN} opacity={0.4 + 0.6 * beamP * (0.75 + 0.25 * Math.sin(t * 6))} />
          <Label x={215} y={538} size={26} color={C.muted} font="mono">
            laser 532 nm
          </Label>
          {/* berkas masuk & berkas lolos */}
          <Beam x1={326} y1={SY} x2={mix(326, SX - 100, beamP)} y2={SY} color={GREEN} width={9} />
          <Beam x1={SX + 100} y1={SY} x2={mix(SX + 100, 900, ramp(t, tLaser + 0.3, tLaser + 0.8))} y2={SY} color={GREEN} width={7} opacity={0.8} />
          <rect x={900} y={446} width={26} height={48} rx={5} fill="#1a1f33" stroke={C.faint} strokeWidth={2} opacity={beamP} />
          {/* sampel */}
          <circle cx={SX} cy={SY} r={100} fill="rgba(120,160,255,0.06)" stroke="#c8d6ff" strokeOpacity={0.55} strokeWidth={3} />
          <circle cx={SX} cy={SY} r={100} fill={GREEN} opacity={0.08 * beamP * (0.8 + 0.2 * Math.sin(t * 5))} />
          {[0, 1, 2].map((k) => {
            const cam: Cam = {cx: SX + [-38, 34, 4][k], cy: SY + [-34, -10, 44][k], s: 34, yaw: t * (0.6 + 0.2 * k) + k * 2, pitch: -0.4 + 0.2 * k, persp: 9};
            return <Render3D key={k} items={molItems3(cam, vibrate(n2, N2MODE, 0.08, vibPh * 1.6 + k), {labels: false})} />;
          })}
          <Label x={SX} y={SY + 128} size={24} color={C.muted}>
            sampel
          </Label>
          {photons}
          <Label x={SX} y={250} size={26} color={C.muted} opacity={color * 0.9}>
            warna terhambur dilebihkan
          </Label>
        </g>

        {/* spektrum hamburan */}
        <g opacity={specIn}>
          <rect x={1030} y={220} width={780} height={430} rx={22} fill="rgba(10,15,34,0.6)" stroke={C.faint} strokeWidth={2} />
          <line x1={PX0} y1={PB} x2={PX1} y2={PB} stroke={C.muted} strokeWidth={2.5} />
          <path d={peakD(XR, rayH, 13)} fill={GREEN} fillOpacity={0.14} stroke={GREEN} strokeWidth={4} />
          <path d={peakD(XR - DX, stH, 12)} fill={STOKES} fillOpacity={0.16} stroke={STOKES} strokeWidth={4} />
          <path d={peakD(XR + DX, asH, 12)} fill={ANTI} fillOpacity={0.16} stroke={ANTI} strokeWidth={4} />
          <Label x={XR + 90} y={PB - rayH + 26} size={26} color={GREEN} weight={700} anchor="start" opacity={ramp(t, tScat + 0.3, tScat + 1)}>
            Rayleigh
          </Label>
          <Label x={XR + 90} y={PB - rayH + 58} size={20} color={C.muted} anchor="start" opacity={ramp(t, tScat + 0.3, tScat + 1)}>
            warna sama, paling banyak
          </Label>
          <Label x={XR - DX} y={PB - stH - 30} size={26} color={STOKES} weight={700} opacity={stH / 82}>
            Stokes
          </Label>
          <Label x={XR + DX} y={PB - asH - 30} size={26} color={ANTI} weight={700} opacity={asH / 34}>
            anti-Stokes
          </Label>
          <Label x={XR - DX} y={PB + 30} size={20} color={C.muted} opacity={stH / 82}>
            lebih merah
          </Label>
          <Label x={XR + DX} y={PB + 30} size={20} color={C.muted} opacity={asH / 34}>
            lebih biru
          </Label>
          <Label x={1060} y={250} size={22} color={C.muted} anchor="start" font="mono">
            energi foton terhambur →
          </Label>
          {/* selisih = energi vibrasi */}
          <g opacity={brk}>
            {[-1, 1].map((s) => {
              const xa = XR + s * 8;
              const xb = XR + s * (DX - 8);
              const y = PB - 130;
              return (
                <g key={s}>
                  <line x1={xa} y1={y} x2={xb} y2={y} stroke={C.amber} strokeWidth={3} />
                  <path d={`M${xb},${y} l${-s * 12},-8 l0,16 Z`} fill={C.amber} />
                  <path d={`M${xa},${y} l${s * 12},-8 l0,16 Z`} fill={C.amber} />
                  <line x1={XR + s * DX} y1={y - 14} x2={XR + s * DX} y2={PB - 10} stroke={C.amber} strokeWidth={2} strokeDasharray="5 6" opacity={0.7} />
                  <text x={XR + s * DX * 0.5} y={y - 22} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={28} fill={C.amber} opacity={0.75 + 0.25 * vibHL}>
                    ΔE
                    <tspan baselineShift="sub" fontSize={18} fontStyle="normal">
                      vib
                    </tspan>
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* ---------------- B: polarisabilitas ---------------- */}
        <g opacity={bIn}>
          <Glow x={960} y={430} r={600} color="cyan" opacity={0.06} />
          {(() => {
            const items: React.ReactNode[] = [];
            const panels: {cx: number; mol: Mol; mode: V3[]; amp: number; tOk: number; title: React.ReactNode; s: number}[] = [
              {cx: 560, mol: n2, mode: N2MODE, amp: 0.16, tOk: tN2, s: 190, title: <SvgChem x={560} y={600} parts={[['N'], ['2', 'sub']]} size={42} />},
              {
                cx: 1340,
                mol: co2(),
                mode: co2Mode('sym'),
                amp: 0.16,
                tOk: tCO2,
                s: 150,
                title: <SvgChem x={1340} y={600} parts={[['CO'], ['2', 'sub'], [' · regangan simetris']]} size={38} />,
              },
            ];
            panels.forEach((P, i) => {
              const ph = t * 2 * Math.PI * 0.55 + i;
              const st = Math.sin(ph);
              const cam: Cam = {cx: P.cx, cy: 420, s: P.s, yaw: 0.25 * Math.sin(t * 0.3 + i), pitch: -0.18, persp: 9};
              const m = vibrate(P.mol, P.mode, P.amp, ph);
              const ends = i === 0 ? [m.atoms[0].pos, m.atoms[1].pos] : [m.atoms[1].pos, m.atoms[2].pos];
              const A = proj(ends[0], cam);
              const B = proj(ends[1], cam);
              const op = ramp(t, cue(3) + i * 0.4, cue(3) + 0.8 + i * 0.4);
              const ok = ramp(t, P.tOk - 0.2, P.tOk + 0.6);
              // α naik saat ikatan meregang (awan elektron lebih mudah "ditarik")
              const alpha = 0.5 + 0.38 * st;
              items.push(
                <g key={i} opacity={op}>
                  <rect x={P.cx - 330} y={210} width={660} height={430} rx={22} fill="rgba(10,15,34,0.55)" stroke={C.cyan} strokeOpacity={0.25 + 0.4 * ok} strokeWidth={2.5} />
                  <Cloud a={A} b={B} pad={P.s * 0.62 * (1 + 0.12 * st)} thick={P.s * (0.62 - 0.07 * st) * (i ? 0.8 : 1)} opacity={0.4 + 0.6 * polW} />
                  <Render3D items={molItems3(cam, m)} />
                  {P.title}
                  {/* meter α */}
                  <g opacity={polW}>
                    <rect x={P.cx + 250} y={290} width={26} height={200} rx={8} fill="#0b1124" stroke={C.cyan} strokeOpacity={0.6} strokeWidth={2} />
                    <rect x={P.cx + 254} y={486 - 192 * alpha} width={18} height={192 * alpha} rx={6} fill={C.cyan} opacity={0.85} />
                    <text x={P.cx + 263} y={270} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={32} fill={C.cyan}>
                      α
                    </text>
                  </g>
                  <Label x={P.cx - 300} y={240} size={22} anchor="start" color={C.muted} font="mono">
                    gerak lambat
                  </Label>
                  <Label x={P.cx - 300} y={610} size={22} anchor="start" color={C.amber} opacity={polW}>
                    μ tetap 0
                  </Label>
                  <g opacity={ok}>
                    <Tick x={P.cx + 230} y={600} ok p={ok} />
                    <Label x={P.cx + 180} y={600} size={24} anchor="end" color={C.mint} weight={700}>
                      aktif Raman
                    </Label>
                  </g>
                </g>,
              );
            });
            return items;
          })()}
        </g>

        {/* ---------------- C: tabel IR | Raman ---------------- */}
        <g opacity={cIn}>
          <Glow x={960} y={480} r={620} color="gold" opacity={0.04 + 0.02 * Math.sin(t)} />
          <rect x={IRX - 100} y={250} width={200} height={500} rx={20} fill={C.amber} opacity={0.06 + 0.05 * comp * (0.5 + 0.5 * Math.sin(t * 3))} />
          <rect x={RAX - 100} y={250} width={200} height={500} rx={20} fill={GREEN} opacity={0.06 + 0.05 * comp * (0.5 + 0.5 * Math.sin(t * 3 + Math.PI))} />
          <Label x={IRX} y={222} size={38} weight={700} color={C.amber}>
            IR
          </Label>
          <Label x={RAX} y={222} size={38} weight={700} color={GREEN}>
            Raman
          </Label>
          {ROWS.map((R, i) => {
            const rIn = ramp(t, cue(4) + i * 0.25, cue(4) + 0.6 + i * 0.25);
            const cam: Cam = {cx: 420, cy: RY[i], s: 62, yaw: 0.2 * Math.sin(t * 0.4 + i), pitch: -0.25, persp: 9};
            const ph = t * 2 * Math.PI * 0.6 + i;
            const mol =
              R.mol === 'N2' ? vibrate(n2, N2MODE, 0.14, ph) : vibrate(co2(), co2Mode(R.mol === 'sym' ? 'sym' : R.mol === 'asym' ? 'asym' : 'bendZ'), 0.16, ph);
            const pI = ramp(t, tIR + 0.2 + i * 0.22, tIR + 0.7 + i * 0.22);
            const pR = ramp(t, tRa + 0.2 + i * 0.22, tRa + 0.7 + i * 0.22);
            return (
              <g key={i} opacity={rIn}>
                <line x1={300} y1={RY[i] + 60} x2={1560} y2={RY[i] + 60} stroke={C.faint} strokeWidth={1.5} opacity={i < 3 ? 0.8 : 0} />
                <Render3D items={molItems3(cam, mol, {labels: false})} />
                <SvgChem x={540} y={RY[i]} anchor="start" parts={R.mol === 'N2' ? [['N'], ['2', 'sub'], [` · ${R.name}`]] : [['CO'], ['2', 'sub'], [` · ${R.name}`]]} size={32} weight={500} />
                <Tick x={IRX} y={RY[i]} ok={R.ir} p={pI} s={30} />
                <Tick x={RAX} y={RY[i]} ok={R.ra} p={pR} s={30} />
              </g>
            );
          })}
          <g opacity={stamp}>
            <rect x={300} y={772} width={1000} height={58} rx={29} fill="rgba(255,122,217,0.1)" stroke={C.pink} strokeWidth={2} />
            <Label x={800} y={801} size={28} color={C.pink}>
              berpusat inversi: aktif IR ⇔ tidak aktif Raman
            </Label>
          </g>
        </g>
      </Stage>

      {/* kartu HTML (di luar Stage) */}
      <Formula x={1420} y={765} p={card1 * aOut} accent={C.amber} caption="Stokes: −   ·   anti-Stokes: +">
        <V>hν</V>
        <Sub>hambur</Sub> = <V>hν</V>
        <Sub>0</Sub> ∓ Δ<V color={C.amber}>E</V>
        <Sub color={C.amber}>vib</Sub>
      </Formula>
      {badge > 0.001 ? (
        <Card x={1420} y={765} opacity={Math.min(1, badge * 1.4)} scale={0.9 + 0.1 * badge} accent={C.gold} style={{padding: '18px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
            <Medal t={t} size={74} />
            <div>
              <div style={{fontSize: 46, fontWeight: 700, color: C.gold, letterSpacing: 1}}>C. V. Raman</div>
              <div style={{fontSize: 30, color: C.ink, fontFamily: FONT.mono, marginTop: 4}}>
                <span style={{opacity: yr1928}}>1928</span>
                <span style={{opacity: nobel}}> · Nobel Fisika 1930</span>
              </div>
            </div>
          </div>
        </Card>
      ) : null}
      <Formula x={960} y={775} p={card3 * bIn} accent={C.cyan} caption="inframerah: Δμ ≠ 0">
        Raman: Δ<V color={C.cyan}>α</V> ≠ 0
      </Formula>
      <Stamp x={1590} y={801} p={comp} text="SALING MELENGKAPI" color={C.gold} size={28} />
    </AbsoluteFill>
  );
};
