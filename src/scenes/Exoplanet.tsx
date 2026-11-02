import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {Render3D, VbDefs} from '../components/vbC';
import {co2, co2Mode, molItems3, vibrate} from '../components/syD';
import {IR_COL, LabIcon, PlanetIcon, ScopeIcon, SpDefs, StarField, camAt, wavePath} from '../components/spD';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 12: kembali ke WASP-39b — transit (kurva cahaya turun sedikit), cahaya menembus atmosfer,
// spektrum transmisi dengan pita H₂O & CO₂ (≈ 4,3 µm), lencana JWST · 2022, lalu tangga lab → teleskop → planet.

const SX = 470;
const SY = 420;
const SR = 200;
const PR = 44;
const PY = 448;
const LC = {x: 170, y: 860, w: 600, h: 120}; // kurva cahaya
const SP = {x: 1040, y: 590, w: 760, h: 360}; // spektrum transmisi (y = garis dasar)
const L0 = 0.9;
const L1 = 5.1;
const lx = (lam: number) => SP.x + ((lam - L0) / (L1 - L0)) * SP.w;

const H2O_BANDS: [number, number, number][] = [
  [1.15, 0.06, 0.28],
  [1.4, 0.08, 0.45],
  [1.85, 0.1, 0.5],
  [2.7, 0.17, 0.62],
];
const CO2_BAND: [number, number, number] = [4.3, 0.13, 0.98];
const model = (lam: number, h2o: number, co2b: number) => {
  let a = 0.08 + 0.03 * Math.sin(lam * 3.1);
  for (const [c, w, h] of H2O_BANDS) a += h2o * h * Math.exp(-(((lam - c) / w) ** 2));
  a += co2b * CO2_BAND[2] * Math.exp(-(((lam - CO2_BAND[0]) / CO2_BAND[1]) ** 2));
  return a;
};
const sy = (a: number) => SP.y - 20 - a * (SP.h - 70);

/** Luas tumpang tindih dua lingkaran (jari-jari R, r, jarak d). */
const overlap = (R: number, r: number, d: number) => {
  if (d >= R + r) return 0;
  if (d <= R - r) return Math.PI * r * r;
  const a = r * r * Math.acos((d * d + r * r - R * R) / (2 * d * r));
  const b = R * R * Math.acos((d * d + R * R - r * r) / (2 * d * R));
  const c = 0.5 * Math.sqrt((-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R));
  return a + b - c;
};

export const Exoplanet: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const main = ramp(t, -0.6, 0.8) * (1 - ramp(t, cue(3) - 0.7, cue(3) + 0.1, EASE_IN_OUT));
  const through = ramp(t, wordOf(0, 'menembus') - 0.3, wordOf(0, 'menembus') + 0.7);
  const specIn = ramp(t, cue(1) - 0.6, cue(1) + 0.3);
  const specDraw = ramp(t, cue(1) - 0.3, wordOf(1, 'karbon') + 0.4, EASE_IN_OUT);
  const co2Hi = ramp(t, wordOf(1, 'karbon') - 0.3, wordOf(1, 'karbon') + 0.6);
  const h2oHi = ramp(t, wordOf(1, 'uap') - 0.3, wordOf(1, 'uap') + 0.6);
  const badge = ramp(t, wordOf(2, 'James') - 0.4, wordOf(2, 'James') + 0.4, BACK);
  const detect = ramp(t, wordOf(2, 'mendeteksi') - 0.3, wordOf(2, 'mendeteksi') + 0.5);
  const fin = ramp(t, cue(3) - 0.2, cue(3) + 0.7);
  const part = (w: string) => ramp(t, wordOf(3, w) - 0.3, wordOf(3, w) + 0.5, BACK);
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);

  // transit: planet bergerak lurus melintasi bintang selama tiga baris pertama
  const t0 = -0.5;
  const t1 = cue(3) + 0.5;
  const px = (tt: number) => mix(SX - SR - PR - 40, SX + SR + PR + 40, (tt - t0) / (t1 - t0));
  const flux = (tt: number) => 1 - overlap(SR, PR, Math.hypot(px(tt) - SX, PY - SY)) / (Math.PI * SR * SR);
  const fy = (f: number) => LC.y - 20 - ((f - 0.94) / 0.06) * (LC.h - 30);
  const lcPts: string[] = [];
  const N = 120;
  const tNow = Math.max(t0, Math.min(t1, t));
  for (let i = 0; i <= N; i++) {
    const tt = t0 + ((tNow - t0) * i) / N;
    lcPts.push(`${i ? 'L' : 'M'}${(LC.x + ((tt - t0) / (t1 - t0)) * LC.w).toFixed(1)},${fy(flux(tt)).toFixed(1)}`);
  }
  const P = px(tNow);
  const fNow = flux(tNow);

  // data spektrum (titik + galat)
  const dataN = 46;
  const camC = camAt(1500, 330, 54, 0.35 + 0.25 * Math.sin(t * 0.5), -0.25, 9);

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <VbDefs />
        <SpDefs />
        <StarField t={t} n={160} seed={9} opacity={0.7} box={[0, 160, 1920, 740]} />

        <g opacity={main}>
          {/* bintang + planet */}
          <circle cx={SX} cy={SY} r={SR * 1.9} fill="url(#sp-corona)" opacity={0.75 + 0.1 * Math.sin(t * 1.3)} />
          <circle cx={SX} cy={SY} r={SR} fill="url(#sp-star)" />
          {Array.from({length: 14}, (_, k) => {
            const a = rand(k * 3.3) * Math.PI * 2 + t * 0.03;
            const rr = rand(k * 5.1) * SR * 0.8;
            return <circle key={k} cx={SX + rr * Math.cos(a)} cy={SY + rr * Math.sin(a)} r={10 + 14 * rand(k)} fill="#fff6d8" opacity={0.12 + 0.08 * Math.sin(t * 2 + k)} />;
          })}
          {/* cincin atmosfer yang ditembus cahaya */}
          <circle cx={P} cy={PY} r={PR + 14} fill="none" stroke={C.cyan} strokeWidth={12} opacity={0.15 + 0.35 * through * (0.7 + 0.3 * Math.sin(t * 3))} />
          <circle cx={P} cy={PY} r={PR} fill="#05070e" />
          <circle cx={P} cy={PY} r={PR + 7} fill="none" stroke={C.cyan} strokeWidth={2.5} opacity={0.5 + 0.5 * through} />
          <g opacity={through}>
            {[-1, 1].map((s) => (
              <path key={s} d={wavePath(P + 18, PY + s * (PR + 8), 1010, 470 + s * 40, 26, t * 9, (u) => 6 * Math.min(1, u * 8))} fill="none" stroke={s < 0 ? IR_COL : C.amber} strokeWidth={2.5} opacity={0.75} />
            ))}
            <line x1={P} y1={PY - PR - 14} x2={P + 70} y2={PY - PR - 80} stroke={C.cyan} strokeWidth={2} opacity={0.8} />
            <Label x={P + 78} y={PY - PR - 96} size={26} anchor="start" color={C.cyan}>
              atmosfer (skematis)
            </Label>
          </g>
          <Label x={SX} y={SY + SR + 32} size={26} color={C.muted}>
            bintang induk · planet melintas
          </Label>

          {/* kurva cahaya */}
          <rect x={LC.x - 30} y={LC.y - LC.h - 26} width={LC.w + 60} height={LC.h + 46} rx={16} fill="rgba(10,14,32,0.8)" stroke={C.faint} strokeWidth={1.5} />
          <line x1={LC.x} y1={LC.y} x2={LC.x + LC.w} y2={LC.y} stroke={C.muted} strokeWidth={2} />
          <text x={LC.x} y={LC.y - LC.h + 2} fontFamily={FONT.sans} fontSize={22} fill={C.muted}>
            kecerahan bintang
          </text>
          <text x={LC.x + LC.w} y={LC.y - 10} textAnchor="end" fontFamily={FONT.sans} fontSize={20} fill={C.muted}>
            waktu →
          </text>
          <path d={lcPts.join(' ')} fill="none" stroke={C.gold} strokeWidth={3.5} strokeLinejoin="round" />
          <circle cx={LC.x + ((tNow - t0) / (t1 - t0)) * LC.w} cy={fy(fNow)} r={7} fill={C.gold} />

          {/* spektrum transmisi */}
          <g opacity={specIn}>
            <rect x={SP.x - 70} y={SP.y - SP.h - 20} width={SP.w + 110} height={SP.h + 92} rx={18} fill="rgba(10,14,32,0.82)" stroke={C.faint} strokeWidth={1.5} />
            <line x1={SP.x} y1={SP.y} x2={SP.x + SP.w} y2={SP.y} stroke={C.muted} strokeWidth={2.5} />
            <line x1={SP.x} y1={SP.y} x2={SP.x} y2={SP.y - SP.h + 10} stroke={C.muted} strokeWidth={2.5} />
            {[1, 2, 3, 4, 5].map((l) => (
              <g key={l}>
                <line x1={lx(l)} y1={SP.y} x2={lx(l)} y2={SP.y + 8} stroke={C.muted} strokeWidth={2} />
                <text x={lx(l)} y={SP.y + 30} textAnchor="middle" fontFamily={FONT.mono} fontSize={20} fill={C.muted}>
                  {l}
                </text>
              </g>
            ))}
            <text x={SP.x + SP.w} y={SP.y + 58} textAnchor="end" fontFamily={FONT.sans} fontSize={22} fill={C.muted}>
              panjang gelombang (µm)
            </text>
            <text x={SP.x - 40} y={SP.y - SP.h / 2} textAnchor="middle" fontFamily={FONT.sans} fontSize={22} fill={C.muted} transform={`rotate(-90 ${SP.x - 40} ${SP.y - SP.h / 2})`}>
              serapan →
            </text>
            {/* sorotan pita */}
            {H2O_BANDS.map(([c, w], k) => (
              <rect key={k} x={lx(c - w * 1.6)} y={SP.y - SP.h + 20} width={lx(c + w * 1.6) - lx(c - w * 1.6)} height={SP.h - 20} fill={C.blue} opacity={0.16 * h2oHi} />
            ))}
            <rect x={lx(4.3 - 0.22)} y={SP.y - SP.h + 20} width={lx(4.52) - lx(4.08)} height={SP.h - 20} fill={C.amber} opacity={(0.16 + 0.12 * detect * (0.5 + 0.5 * Math.sin(t * 4))) * co2Hi} />
            {/* model */}
            {specDraw > 0 ? (
              <path
                d={Array.from({length: 241}, (_, i) => {
                  const lam = L0 + 0.1 + (((L1 - L0 - 0.2) * i) / 240) * specDraw;
                  return `${i ? 'L' : 'M'}${lx(lam).toFixed(1)},${sy(model(lam, 1, 1)).toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke={C.ink}
                strokeWidth={3}
                opacity={0.85}
              />
            ) : null}
            {Array.from({length: dataN}, (_, i) => {
              const lam = L0 + 0.15 + ((L1 - L0 - 0.3) * i) / (dataN - 1);
              const vis = Math.max(0, Math.min(1, (specDraw * (L1 - L0) + L0 - lam) * 4));
              const a = model(lam, 1, 1) + 0.05 * (rand(i * 7.7) - 0.5);
              const e = 10 + 6 * rand(i * 3.1);
              const x = lx(lam);
              const y = sy(a) + 2 * Math.sin(t * 2 + i);
              return vis > 0.01 ? (
                <g key={i} opacity={vis}>
                  <line x1={x} y1={y - e} x2={x} y2={y + e} stroke={C.muted} strokeWidth={2} />
                  <circle cx={x} cy={y} r={5} fill={C.gold} />
                </g>
              ) : null;
            })}
            {/* label pita */}
            <g opacity={h2oHi}>
              {H2O_BANDS.map(([c, , h], k) => (
                <text key={k} x={lx(c)} y={sy(h + 0.1) - 30} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={26} fill={C.blue} style={{paintOrder: 'stroke', stroke: 'rgba(4,6,12,0.85)', strokeWidth: 3}}>
                  H<tspan baselineShift="sub" fontSize={17}>2</tspan>O
                </text>
              ))}
            </g>
            <g opacity={co2Hi}>
              <text x={lx(4.3)} y={sy(1.08) - 34} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={32} fill={C.amber} style={{paintOrder: 'stroke', stroke: 'rgba(4,6,12,0.85)', strokeWidth: 4}}>
                CO<tspan baselineShift="sub" fontSize={20}>2</tspan>
                <tspan dx={8}>≈ 4,3 µm</tspan>
              </text>
              <Render3D items={molItems3(camC, vibrate(co2(), co2Mode('asym'), 0.14, t * 7), {labels: false})} />
              <Label x={1500} y={392} size={20} color={C.amber}>
                regangan asimetris
              </Label>
            </g>
          </g>

          {/* lencana JWST */}
          <g opacity={badge} transform={`translate(${1420} ${762}) scale(${0.85 + 0.15 * badge})`}>
            <rect x={-330} y={-44} width={660} height={88} rx={44} fill="rgba(30,22,6,0.92)" stroke={C.gold} strokeWidth={3} />
            <ScopeIcon x={-268} y={4} s={0.42} t={t} />
            <text x={30} y={2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={800} fontSize={36} fill={C.gold} letterSpacing={1}>
              JWST · 2022 · WASP-39b
            </text>
          </g>
        </g>

        {/* penutup: lab → teleskop → planet */}
        <g opacity={fin}>
          <Glow x={960} y={540} r={700} color="gold" opacity={0.07} />
          {[
            {x: 480, w: 'laboratorium', cap: 'laboratorium kampus', col: C.violet},
            {x: 960, w: 'sampai', cap: 'teleskop', col: C.gold},
            {x: 1440, w: 'planet', cap: 'planet di bintang lain', col: C.cyan},
          ].map((it, k) => {
            const p = part(it.w);
            return (
              <g key={k} opacity={p}>
                <circle cx={it.x} cy={540} r={118} fill="rgba(10,14,32,0.85)" stroke={it.col} strokeWidth={3} strokeOpacity={0.4 + 0.3 * Math.sin(t * 2 + k)} />
                <circle cx={it.x} cy={540} r={150} fill={`url(#soft-${k === 0 ? 'violet' : k === 1 ? 'gold' : 'cyan'})`} opacity={0.25} />
                {k === 0 ? <LabIcon x={it.x} y={540} s={1.25 * p} t={t} /> : k === 1 ? <ScopeIcon x={it.x} y={530} s={1.1 * p} t={t} /> : <PlanetIcon x={it.x} y={540} r={60 * p + 0.01} t={t} />}
                <Label x={it.x} y={700} size={32} weight={600} color={it.col}>
                  {it.cap}
                </Label>
              </g>
            );
          })}
          {[0, 1].map((k) => {
            const p = part(k === 0 ? 'sampai' : 'planet');
            const x1 = [600, 1080][k];
            const x2 = [840, 1320][k];
            return (
              <g key={k} opacity={p}>
                <path d={wavePath(x1, 540, x2, 540, 30, t * 8, (u) => 8 * Math.sin(Math.PI * u))} fill="none" stroke={IR_COL} strokeWidth={3} />
                {[0, 1, 2].map((j) => {
                  const ph = ((t * 0.6 + j / 3) % 1 + 1) % 1;
                  return <circle key={j} cx={mix(x1, x2, ph)} cy={540} r={5} fill={C.gold} opacity={cyc(ph)} />;
                })}
              </g>
            );
          })}
        </g>
      </Stage>
      {fin > 0.001 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT.sans, fontSize: 46, fontWeight: 700, color: C.ink, opacity: fin}}>
          {[
            ['tangga energi', 'Tangga', C.amber],
            ['aturan seleksi', 'aturan', C.mint],
            ['simetri yang sama', 'simetri', C.gold],
          ].map(([txt, w, col], k) => {
            const p = part(w);
            return (
              <span key={k} style={{opacity: p, display: 'inline-block', transform: `translateY(${(1 - p) * 18}px)`}}>
                {k ? <span style={{color: C.muted, margin: '0 22px'}}>·</span> : null}
                <span style={{color: col}}>{txt}</span>
              </span>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
