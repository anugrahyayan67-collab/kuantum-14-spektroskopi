import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {Render3D, VbDefs} from '../components/vbC';
import {PGBadge, molItems3} from '../components/syD';
import {wlColor} from '../components/viz';
import {BreathIcon, Dish, PlanetIcon, SpDefs, camAt, coMol, spinY, wavePath} from '../components/spD';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 13: tujuh poin rangkuman dengan ikon bergerak + kartu penutup seri kimia kuantum.
const COLX = [80, 980];
const CW = 860;
const ROWY = [252, 412, 572, 732];
const CH = 146;
const box = (i: number) => (i < 4 ? {x: COLX[0], y: ROWY[i], h: CH} : i < 6 ? {x: COLX[1], y: ROWY[i - 4], h: CH} : {x: COLX[1], y: (ROWY[2] + ROWY[3]) / 2, h: CH * 2 + 14});

const I: React.FC<{children: React.ReactNode}> = ({children}) => <i style={{fontFamily: FONT.serif}}>{children}</i>;

const ROWS: {title: React.ReactNode; detail: React.ReactNode; col: string}[] = [
  {title: 'Empat tangga energi', detail: 'translasi, rotasi, vibrasi, elektronik — makin renggang', col: C.cyan},
  {title: 'Wilayah spektrum', detail: 'gelombang mikro → rotasi · IR → vibrasi · tampak/UV → elektron', col: C.amber},
  {
    title: 'Faktor Boltzmann',
    detail: (
      <>
        <I>e</I>
        <sup style={{fontSize: '0.62em', verticalAlign: '0.55em', lineHeight: 0}}>
          −Δ<I>E</I>/<I>kT</I>
        </sup>{' '}
        menentukan tingkat mana yang terisi
      </>
    ),
    col: C.gold,
  },
  {
    title: 'Aturan seleksi',
    detail: (
      <>
        Δ<I>J</I> = ±1, Δ<I>v</I> = ±1 — lompatan mana yang diizinkan
      </>
    ),
    col: C.mint,
  },
  {title: 'Cabang P & R, isotop', detail: (
      <>
        HCl: dua cabang, garis kembar H<Sup2>35</Sup2>Cl / H<Sup2>37</Sup2>Cl
      </>
    ), col: C.cyan},
  {title: 'Raman & Franck–Condon', detail: 'hamburan bergeser warna · transisi tegak → progresi vibrasi', col: C.violet},
  {title: 'Membaca dunia nyata', detail: 'napas pengemudi, awan antarbintang, atmosfer planet lain', col: C.pink},
];

function Sup2({children}: {children: React.ReactNode}) {
  return <sup style={{fontSize: '0.62em', verticalAlign: '0.55em', lineHeight: 0}}>{children}</sup>;
}

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  if (i === 0) {
    // empat tangga: rapat → renggang, titik melompat
    const cols = [C.muted, C.cyan, C.amber, C.violet];
    const gaps = [3.5, 7, 14, 26];
    return (
      <g>
        {cols.map((col, k) => {
          const cx = x - 39 + k * 26;
          const n = Math.floor(70 / gaps[k]);
          return (
            <g key={k}>
              {Array.from({length: n + 1}, (_, j) => (
                <line key={j} x1={cx - 9} x2={cx + 9} y1={y + 36 - j * gaps[k]} y2={y + 36 - j * gaps[k]} stroke={col} strokeWidth={k === 0 ? 1.5 : 2.5} opacity={0.85} />
              ))}
              <circle cx={cx} cy={y + 36 - gaps[k] * (0.5 + 0.5 * Math.sin(t * (1.5 + k * 0.4) + k)) * Math.min(n, 2)} r={4.5} fill={C.gold} />
            </g>
          );
        })}
      </g>
    );
  }
  if (i === 1) {
    // pita spektrum: gelombang yang makin pendek dari kiri ke kanan
    const seg = [
      {c: C.cyan, a: -56, b: -20},
      {c: C.amber, a: -20, b: 16},
      {c: C.violet, a: 16, b: 56},
    ];
    const hot = (((t * 0.5) % 3) + 3) % 3;
    return (
      <g>
        {seg.map((s, k) => (
          <rect key={k} x={x + s.a} y={y + 22} width={s.b - s.a - 2} height={12} rx={4} fill={s.c} opacity={0.35 + 0.6 * Math.max(0, 1 - Math.abs(hot - k - 0.5) * 1.3)} />
        ))}
        <path
          d={Array.from({length: 90}, (_, j) => {
            const u = j / 89;
            const xx = x - 56 + u * 112;
            const k = 2 * Math.PI * (0.6 + 6.5 * u * u);
            return `${j ? 'L' : 'M'}${xx.toFixed(1)},${(y - 14 + 14 * Math.sin(k * u * 2 - t * 5)).toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke={C.ink}
          strokeWidth={2.5}
        />
      </g>
    );
  }
  if (i === 2) {
    // populasi Boltzmann: batang emas menurun eksponensial di tiap tingkat
    return (
      <g>
        {[0, 1, 2, 3, 4].map((j) => {
          const yy = y + 36 - j * 18;
          const w = 80 * Math.exp(-j * (0.55 + 0.1 * Math.sin(t * 1.2)));
          return (
            <g key={j}>
              <line x1={x - 50} x2={x - 22} y1={yy} y2={yy} stroke={C.muted} strokeWidth={2} />
              <rect x={x - 16} y={yy - 5} width={w} height={10} rx={4} fill={C.gold} opacity={0.85} />
            </g>
          );
        })}
      </g>
    );
  }
  if (i === 3) {
    // tingkat J: panah ±1 diizinkan, +2 terlarang
    const lv = [36, 22, 0, -30];
    const up = ((t * 0.6) % 1 + 1) % 1;
    return (
      <g>
        {lv.map((yy, j) => (
          <line key={j} x1={x - 50} x2={x + 50} y1={y + yy} y2={y + yy} stroke={C.cyan} strokeWidth={2.5} opacity={0.8} />
        ))}
        <line x1={x - 20} y1={y + 34} x2={x - 20} y2={y + 34 - 34 * Math.min(1, up * 1.6)} stroke={C.mint} strokeWidth={4} strokeLinecap="round" />
        <line x1={x + 22} y1={y + 34} x2={x + 22} y2={y + 2} stroke={C.red} strokeWidth={3.5} strokeDasharray="5 5" opacity={0.85} />
        <path d={`M${x + 12},${y + 8} L${x + 32},${y + 26} M${x + 32},${y + 8} L${x + 12},${y + 26}`} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }
  if (i === 4) {
    // cabang P & R dengan celah di tengah, garis kembar isotop
    return (
      <g>
        <line x1={x - 58} x2={x + 58} y1={y + 34} y2={y + 34} stroke={C.faint} strokeWidth={2} />
        {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((m) => {
          const j = Math.abs(m);
          const xx = x + m * 10.5 + (m > 0 ? -0.6 * j : -0.4 * j);
          const h = 60 * j * Math.exp(-(j * j) / 7) * 0.75;
          const pulse = 0.6 + 0.4 * Math.max(0, Math.sin(t * 2 - j * 0.7));
          return (
            <g key={m} opacity={pulse}>
              <rect x={xx - 1.8} y={y + 34 - h} width={3.6} height={h} fill={m > 0 ? C.amber : C.cyan} />
              <rect x={xx + 2.4} y={y + 34 - h * 0.33} width={2.6} height={h * 0.33} fill={m > 0 ? C.amber : C.cyan} opacity={0.7} />
            </g>
          );
        })}
        <text x={x - 34} y={y - 30} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={18} fill={C.cyan}>
          P
        </text>
        <text x={x + 34} y={y - 30} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={18} fill={C.amber}>
          R
        </text>
      </g>
    );
  }
  if (i === 5) {
    // Franck–Condon: dua kurva potensial + panah tegak, foton Raman bergeser warna
    const curve = (cx: number, cy: number, k: number) =>
      Array.from({length: 30}, (_, j) => {
        const u = -1 + (2 * j) / 29;
        return `${j ? 'L' : 'M'}${(cx + u * 34).toFixed(1)},${(cy - k * u * u).toFixed(1)}`;
      }).join(' ');
    const ph = ((t * 0.6) % 1 + 1) % 1;
    return (
      <g>
        <path d={curve(x - 8, y + 40, 40)} fill="none" stroke={C.muted} strokeWidth={2.5} />
        <path d={curve(x + 6, y - 6, 34)} fill="none" stroke={C.violet} strokeWidth={2.5} />
        <line x1={x - 8} y1={y + 38} x2={x - 8} y2={y + 38 - 50 * Math.min(1, ph * 1.8)} stroke={C.gold} strokeWidth={3.5} strokeLinecap="round" opacity={cyc(ph) * 1.2} />
        <path d={wavePath(x - 62, y - 40, x - 28, y - 40, 8, t * 9, () => 4)} fill="none" stroke={wlColor(460)} strokeWidth={2.5} />
        <path d={wavePath(x + 26, y - 40, x + 62, y - 40, 11, t * 9, () => 4)} fill="none" stroke={wlColor(560)} strokeWidth={2.5} />
      </g>
    );
  }
  // i === 6: tiga penerapan
  return (
    <g>
      <BreathIcon x={x - 6} y={y - 120} s={0.9} t={t} />
      <Dish x={x} y={y - 10} s={0.42} tilt={-30 + 6 * Math.sin(t * 0.6)} t={t} live={0.6} />
      <PlanetIcon x={x} y={y + 112} r={32} t={t} />
    </g>
  );
};

/** Ikon video seri (kartu penutup). */
const SeriesIcon: React.FC<{k: number; x: number; y: number; t: number}> = ({k, x, y, t}) => {
  if (k === 0) {
    return (
      <g>
        <text x={x - 6} y={y - 6} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={46} fill={C.gold}>
          <tspan baselineShift="super" fontSize={26} fontStyle="normal">
            2
          </tspan>
          P
          <tspan baselineShift="sub" fontSize={24}>
            3/2
          </tspan>
        </text>
        {[589.0, 589.6].map((nm, j) => (
          <rect key={j} x={x - 16 + j * 22} y={y + 26} width={6} height={20} fill={wlColor(nm)} opacity={0.6 + 0.4 * Math.sin(t * 3 + j)} />
        ))}
      </g>
    );
  }
  if (k === 1) {
    const d = 18 + 4 * Math.sin(t * 1.5);
    return (
      <g>
        <circle cx={x - d} cy={y} r={26} fill={C.cyan} opacity={0.35} />
        <circle cx={x + d} cy={y} r={26} fill={C.cyan} opacity={0.35} />
        <circle cx={x - d} cy={y} r={7} fill="#f2f5ff" />
        <circle cx={x + d} cy={y} r={7} fill="#f2f5ff" />
        <line x1={x - 6} y1={y + 40} x2={x - 6} y2={y + 22} stroke={C.cyan} strokeWidth={3} markerEnd="url(#arrow-cyan)" />
        <line x1={x + 6} y1={y + 22} x2={x + 6} y2={y + 40} stroke={C.pink} strokeWidth={3} />
      </g>
    );
  }
  if (k === 2) {
    const blink = 0.6 + 0.4 * Math.sin(t * 2);
    return (
      <g>
        <line x1={x - 50} x2={x - 30} y1={y} y2={y} stroke={C.muted} strokeWidth={3} />
        <line x1={x + 30} x2={x + 50} y1={y} y2={y} stroke={C.muted} strokeWidth={3} />
        <line x1={x - 12} x2={x + 12} y1={y + 24} y2={y + 24} stroke={C.cyan} strokeWidth={3.5} />
        <line x1={x - 12} x2={x + 12} y1={y - 24} y2={y - 24} stroke={C.red} strokeWidth={3.5} />
        <path d={`M${x - 30},${y} L${x - 12},${y + 24} M${x + 30},${y} L${x + 12},${y + 24} M${x - 30},${y} L${x - 12},${y - 24} M${x + 30},${y} L${x + 12},${y - 24}`} stroke={C.faint} strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={x - 4} y1={y + 32} x2={x - 4} y2={y + 14} stroke={C.cyan} strokeWidth={2.5} opacity={blink} />
        <line x1={x + 4} y1={y + 14} x2={x + 4} y2={y + 32} stroke={C.pink} strokeWidth={2.5} opacity={blink} />
      </g>
    );
  }
  if (k === 3) {
    const pts = Array.from({length: 6}, (_, j) => {
      const a = (j * Math.PI) / 3 + Math.PI / 6 + t * 0.3;
      return `${(x + 34 * Math.cos(a)).toFixed(1)},${(y + 34 * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return (
      <g>
        <polygon points={pts} fill="none" stroke={C.ink} strokeWidth={3} />
        <circle cx={x} cy={y} r={20} fill="none" stroke={C.amber} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 2.5)} />
      </g>
    );
  }
  if (k === 4) return <PGBadge x={x} y={y} main="C" sub="2v" r={38} color={C.mint} rot={8 * Math.sin(t)} />;
  const cam = camAt(x, y - 8, 30, 0.2, -0.15, 12);
  return (
    <g>
      <Render3D items={molItems3(cam, spinY(coMol(), t * 1.4), {labels: false})} />
      {[0, 1, 2, 3, 4].map((j) => (
        <rect key={j} x={x - 30 + j * 13} y={y + 30} width={4} height={18} fill={C.cyan} opacity={0.4 + 0.6 * Math.max(0, Math.sin(t * 2 - j))} />
      ))}
    </g>
  );
};

const SERIES = ['Simbol term', 'Ikatan valensi', 'Orbital molekul', 'Poliatomik', 'Simetri', 'Spektroskopi'];

export const Recap: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const intro = ramp(t, cue(0) - 0.4, cue(0) + 0.6);
  const at = [cue(1), cue(2), cue(3), wordOf(3, 'aturan'), cue(4), wordOf(4, 'Raman'), cue(5)];
  const next = [...at.slice(1), cue(6)];
  const lit = at.map((a) => ramp(t, a - 0.3, a + 0.5, BACK));
  const cur = (i: number) => Math.min(1, ramp(t, at[i] - 0.3, at[i] + 0.4)) * (1 - 0.35 * ramp(t, next[i] - 0.3, next[i] + 0.4));
  const fin = ramp(t, cue(6) - 0.4, cue(6) + 0.6);
  const thanks = ramp(t, wordOf(6, 'Terima') - 0.3, wordOf(6, 'Terima') + 0.5);
  const strip = (k: number) => ramp(t, cue(6) + 0.3 + k * 0.22, cue(6) + 0.9 + k * 0.22, BACK);
  const grid = 1 - 0.8 * fin;
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <VbDefs />
        <SpDefs />
        <Glow x={960} y={540} r={760} color="mint" opacity={0.05 + 0.03 * Math.sin(t)} />
        <g opacity={grid}>
          {ROWS.map((r, i) => {
            const b = box(i);
            const hot = cur(i);
            const big = i === 6;
            const ix = b.x + (big ? 130 : 100);
            return (
              <g key={i} opacity={intro * (0.12 + 0.88 * lit[i])}>
                <rect x={b.x} y={b.y - b.h / 2} width={CW} height={b.h} rx={22} fill="rgba(12,18,40,0.72)" stroke={r.col} strokeWidth={2.5} strokeOpacity={0.25 + 0.6 * hot} />
                <rect x={b.x} y={b.y - b.h / 2 + 22} width={6} height={b.h - 44} rx={3} fill={r.col} opacity={0.4 + 0.6 * hot} />
                {!big ? <circle cx={ix} cy={b.y} r={62} fill="rgba(6,10,24,0.8)" stroke={r.col} strokeOpacity={0.3 + 0.4 * hot} strokeWidth={2} /> : null}
                <g opacity={lit[i]}>
                  <Icon i={i} x={ix} y={b.y} t={t} />
                </g>
              </g>
            );
          })}
        </g>

        {/* kartu penutup */}
        <g opacity={fin}>
          <rect x={160} y={222} width={1600} height={600} rx={34} fill="rgba(10,16,36,0.94)" stroke={C.gold} strokeWidth={3} strokeOpacity={0.5 + 0.3 * Math.sin(t * 2)} />
          <Glow x={960} y={420} r={600} color="gold" opacity={0.1} />
          {SERIES.map((s, k) => {
            const x = 960 + (k - 2.5) * 244;
            const p = strip(k);
            return (
              <g key={k} opacity={p}>
                <circle cx={x} cy={600} r={74} fill="rgba(6,10,24,0.9)" stroke={k === 5 ? C.gold : C.faint} strokeWidth={k === 5 ? 3.5 : 2} />
                {k === 5 ? <circle cx={x} cy={600} r={100} fill="url(#soft-gold)" opacity={0.3 + 0.15 * Math.sin(t * 3)} /> : null}
                <g transform={`translate(${x} ${600}) scale(${0.8 + 0.2 * p}) translate(${-x} ${-600})`}>
                  <SeriesIcon k={k} x={x} y={600} t={t} />
                </g>
                <text x={x} y={712} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={28} fill={k === 5 ? C.gold : C.ink}>
                  {s}
                </text>
              </g>
            );
          })}
          {[0, 1, 2, 3, 4].map((k) => {
            const x = 960 + (k - 2.5) * 244 + 80;
            return <line key={k} x1={x} y1={600} x2={x + 84} y2={600} stroke={C.faint} strokeWidth={2} strokeDasharray="4 6" opacity={strip(k + 1)} />;
          })}
        </g>
      </Stage>
      {ROWS.map((r, i) => {
        const b = box(i);
        const big = i === 6;
        const left = b.x + (big ? 270 : 186);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top: b.y,
              width: CW - (left - b.x) - 26,
              transform: `translate(${(1 - lit[i]) * -24}px, -50%)`,
              opacity: lit[i] * intro * (0.6 + 0.4 * cur(i)) * grid,
            }}
          >
            <div style={{fontFamily: FONT.sans, fontSize: big ? 40 : 34, fontWeight: 700, color: r.col, lineHeight: 1.15}}>{r.title}</div>
            <div style={{fontFamily: FONT.sans, fontSize: big ? 32 : 28, color: C.ink, lineHeight: 1.28, marginTop: 6}}>{r.detail}</div>
          </div>
        );
      })}
      {fin > 0.001 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT.sans, opacity: fin}}>
          <div style={{fontSize: 24, letterSpacing: 8, color: C.muted, fontWeight: 600}}>KIMIA KUANTUM · SETELAH UTS</div>
          <div style={{fontSize: 60, fontWeight: 800, color: C.gold, lineHeight: 1.15, marginTop: 8, textShadow: '0 0 40px rgba(255,194,74,0.35)'}}>Akhir perjalanan kimia kuantum semester ini</div>
          <div style={{fontSize: 34, color: C.ink, marginTop: 14, opacity: thanks}}>
            Terima kasih sudah ikut menari bersama molekul
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

