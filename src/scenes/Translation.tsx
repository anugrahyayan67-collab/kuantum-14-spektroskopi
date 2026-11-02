import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, mix, rand, ramp, slot} from '../anim';
import {Formula, Frac, Glow, Label, Sqrt, Stage, Sub, Sup, V} from '../components/primitives';
import {Electron, ncol, psi, wlColor} from '../components/viz';
import {Beam, gauss, integ} from '../components/spC';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 09: translasi. Wadah besar → tingkat sangat rapat (hampir kontinu). Doppler: menuju detektor
// (searah cahaya dari lampu ke detektor) → menyerap frekuensi lebih tinggi; menjauh → lebih rendah.
// Lebar Doppler ∝ √T. Kurungan sempit (titik kuantum) → tingkat terpisah, Eₙ ∝ n²/L².
const NM = 34;
const BX0 = 290;
const BX1 = 1050;
const BY0 = 240;
const BY1 = 740;
const BEAM_Y = 490;

// spektrum serapan (kanan)
const SP0 = 1290;
const SP1 = 1760;
const SPC = (SP0 + SP1) / 2;
const SPB = 560;
const KV = 40; // px per satuan kecepatan

// tangga tingkat translasi
const LAD0 = 1250;
const LAD1 = 1720;
const LADB = 700;
const LADT = 252;

const gr = (s: number) => {
  // bilangan acak normal deterministik (Box–Muller)
  const u = Math.max(1e-4, rand(s));
  const v = rand(s + 17.3);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const MOL = Array.from({length: NM}, (_, i) => ({
  x0: rand(i * 2.13 + 0.7),
  y0: rand(i * 3.71 + 1.9),
  vx: Math.max(-2.6, Math.min(2.6, gr(i * 1.17 + 3))),
  vy: gr(i * 5.31 + 8) * 0.9,
  ph: rand(i * 9.1) * 6.28,
  w: 1 + rand(i * 4.4) * 2,
}));
// lipatan pantul dinding: posisi & arah
const tri = (u: number) => {
  const m = ((u % 2) + 2) % 2;
  return m < 1 ? {p: m, d: 1} : {p: 2 - m, d: -1};
};

export const Translation: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);

  const tDop = wordOf(1, 'Doppler');
  const tTo = wordOf(2, 'menuju');
  const tAway = wordOf(2, 'menjauh');
  const tSpd = wordOf(3, 'kecepatan');
  const tWide = wordOf(3, 'melebar');
  const tHot = wordOf(3, 'panas');
  const tLock = wordOf(4, 'dikurung');
  const tDot = wordOf(4, 'titik');
  const tSep = wordOf(4, 'terpisah');
  const tBox = wordOf(4, 'kotak');

  const Tk = (x: number) => 300 + 900 * ramp(x, tHot - 0.2, tHot + 2.6, EASE_IN_OUT);
  const T = Tk(t);
  const sf = Math.sqrt(T / 300);
  const tau = 0.085 * integ((x) => Math.sqrt(Tk(x) / 300), t, -1.5);

  // fase
  const shrink = ramp(t, tLock - 0.2, tDot + 0.6, EASE_IN_OUT);
  const midOut = 1 - ramp(t, tLock - 0.6, tLock + 0.3, EASE_IN_OUT);
  const ladIn = ramp(t, cue(0) - 0.4, cue(0) + 0.8) * (1 - ramp(t, tDop - 0.8, tDop - 0.1, EASE_IN_OUT)) + ramp(t, tDot - 0.4, tDot + 0.6);
  const dense = ramp(t, wordOf(0, 'rapat') - 0.4, wordOf(0, 'rapat') + 0.5) * (1 - shrink);
  const dopIn = ramp(t, tDop - 0.3, tDop + 0.6) * midOut;
  const hero = ramp(t, tTo - 0.6, tTo + 0.2) * (1 - ramp(t, tSpd - 0.4, tSpd + 0.4, EASE_IN_OUT));
  const heroB = ramp(t, tAway - 0.6, tAway + 0.2) * (1 - ramp(t, tSpd - 0.4, tSpd + 0.4, EASE_IN_OUT));
  const tint = ramp(t, cue(2) - 0.4, cue(2) + 0.6) * midOut;
  const sticks = ramp(t, tSpd - 0.3, tSpd + 0.8) * midOut;
  const env = ramp(t, tWide - 0.3, tWide + 0.8) * midOut;
  const slider = ramp(t, tHot - 1.0, tHot - 0.2) * midOut;
  const card3 = slot(t, wordOf(3, 'lebar', 1) - 0.3, tLock - 0.2);
  const cardE = slot(t, tSep - 0.2, dur + 1);
  const waves = ramp(t, tBox - 0.6, tBox + 0.6);
  const pibTag = ramp(t, tBox - 0.3, tBox + 0.5);

  // kotak (mengecil menjadi titik kuantum)
  const bx0 = mix(BX0, 530, shrink);
  const bx1 = mix(BX1, 650, shrink);
  const by0 = mix(BY0, 420, shrink);
  const by1 = mix(BY1, 540, shrink);
  const molOp = 1 - ramp(t, tLock, tDot, EASE_IN_OUT);
  const hot = ramp(t, tHot - 0.2, tHot + 2.6);

  // tangga: E₁ naik saat kotak mengecil (skala log, tidak sebenarnya)
  const E1 = Math.exp(mix(Math.log((LADB - LADT) / 150 ** 2), Math.log(25), ramp(t, tLock, tSep + 0.4, EASE_IN_OUT)));

  // molekul
  const mols = MOL.map((m, i) => {
    const X = tri(m.x0 + m.vx * tau * 0.9);
    const Y = tri(m.y0 + m.vy * tau * 0.9);
    const wall = Math.min(1, Math.min(X.p, 1 - X.p) / 0.05);
    const vEff = m.vx * X.d * wall; // kecepatan arah detektor (+ = menuju detektor), mulus di dinding
    return {i, x: mix(bx0 + 18, bx1 - 18, X.p), y: mix(by0 + 18, by1 - 18, Y.p), vEff, rot: m.ph + t * m.w * sf};
  });

  // pahlawan: menuju detektor (atas berkas) & menjauh (bawah berkas)
  const hA = mix(380, 960, ramp(t, tTo - 0.6, tSpd + 0.4, (x) => x));
  const hB = mix(960, 380, ramp(t, tAway - 0.6, tSpd + 0.6, (x) => x));
  const VH = 1.6;

  const vCol = (v: number, op = 1) => interpolateColors(Math.max(-1, Math.min(1, (v / 1.6) * op)), [-1, 0, 1], [wlColor(650), '#b9c3e6', wlColor(455)]);

  const envD = (() => {
    const s = KV * sf;
    const h = 210 / sf;
    let d = '';
    for (let i = 0; i <= 120; i++) {
      const x = SP0 + ((SP1 - SP0) * i) / 120;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(SPB - h * gauss(x, SPC, s)).toFixed(1)}`;
    }
    return d;
  })();

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Glow x={670} y={490} r={560} color="red" opacity={0.07 * hot * (1 - shrink)} />
        <Glow x={670} y={490} r={560} color="cyan" opacity={0.05 * (1 - hot) * (1 - shrink)} />
        <Glow x={590} y={480} r={260} color="violet" opacity={0.25 * shrink} />

        {/* kotak / titik kuantum */}
        <rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} rx={mix(18, 10, shrink)} fill="rgba(140,150,187,0.05)" stroke={interpolateColors(shrink, [0, 1], [C.muted, C.violet])} strokeWidth={mix(3, 5, shrink)} />
        <rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} rx={18} fill={C.red} opacity={0.06 * hot * (1 - shrink)} />
        <Label x={(bx0 + bx1) / 2} y={by0 - 26} size={24} color={C.muted} opacity={(1 - shrink) * ramp(t, wordOf(0, 'wadah') - 0.3, wordOf(0, 'wadah') + 0.4)}>
          wadah biasa · gas
        </Label>

        {/* berkas cahaya lampu → detektor */}
        <g opacity={dopIn}>
          <circle cx={175} cy={BEAM_Y} r={28} fill="#fff6d8" opacity={0.9} />
          <circle cx={175} cy={BEAM_Y} r={60} fill="#fff6d8" opacity={0.07 + 0.03 * Math.sin(t * 3)} />
          <Label x={175} y={BEAM_Y + 64} size={22} color={C.muted}>
            lampu
          </Label>
          <Beam x1={205} y1={BEAM_Y} x2={1105} y2={BEAM_Y} color="#cfe3ff" width={6} opacity={0.55} />
          <rect x={1105} y={BEAM_Y - 46} width={46} height={92} rx={8} fill="#1a2240" stroke={C.muted} strokeWidth={3} />
          <circle cx={1128} cy={BEAM_Y} r={10} fill="#cfe3ff" opacity={0.5 + 0.3 * Math.sin(t * 4)} />
          <Label x={1128} y={BEAM_Y + 74} size={22} color={C.muted}>
            detektor
          </Label>
          <path d={`M1162,${BEAM_Y} L1232,${BEAM_Y}`} stroke={C.faint} strokeWidth={2} strokeDasharray="4 6" />
        </g>

        {/* molekul gas */}
        <g opacity={molOp}>
          {mols.map((m) => {
            const col = interpolateColors(tint, [0, 1], [C.muted, vCol(m.vEff)]);
            const dx = 10 * Math.cos(m.rot);
            const dy = 10 * Math.sin(m.rot) * 0.6;
            return (
              <g key={m.i}>
                <line x1={m.x - dx} y1={m.y - dy} x2={m.x + dx} y2={m.y + dy} stroke={col} strokeWidth={4} opacity={0.6} />
                <circle cx={m.x - dx} cy={m.y - dy} r={8} fill={col} />
                <circle cx={m.x + dx} cy={m.y + dy} r={8} fill={col} />
              </g>
            );
          })}
        </g>

        {/* dua molekul contoh */}
        {[
          {x: hA, y: BEAM_Y - 70, v: VH, op: hero, txt: 'menuju detektor'},
          {x: hB, y: BEAM_Y + 70, v: -VH, op: heroB, txt: 'menjauh'},
        ].map((h, k) =>
          h.op > 0.01 ? (
            <g key={k} opacity={h.op}>
              <circle cx={h.x} cy={h.y} r={34 + 3 * Math.sin(t * 5)} fill="none" stroke={vCol(h.v)} strokeWidth={3} />
              <circle cx={h.x - 12} cy={h.y} r={13} fill={vCol(h.v)} />
              <circle cx={h.x + 12} cy={h.y} r={13} fill={vCol(h.v)} />
              <path d={`M${h.x + Math.sign(h.v) * 44},${h.y} l${Math.sign(h.v) * 50},0`} stroke={vCol(h.v)} strokeWidth={5} strokeLinecap="round" />
              <path d={`M${h.x + Math.sign(h.v) * 104},${h.y} l${-Math.sign(h.v) * 16},-10 l0,20 Z`} fill={vCol(h.v)} />
              <Label x={h.x} y={h.y + (k ? 56 : -56)} size={24} weight={700} color={vCol(h.v)}>
                {h.txt}
              </Label>
            </g>
          ) : null,
        )}

        {/* spektrum serapan */}
        <g opacity={dopIn}>
          <rect x={1250} y={240} width={540} height={380} rx={22} fill="rgba(10,15,34,0.6)" stroke={C.faint} strokeWidth={2} />
          <line x1={SP0} y1={SPB} x2={SP1} y2={SPB} stroke={C.muted} strokeWidth={2.5} />
          <line x1={SPC} y1={SPB} x2={SPC} y2={SPB + 10} stroke={C.muted} strokeWidth={2} />
          <text x={SPC} y={SPB + 34} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={26} fill={C.ink}>
            ν<tspan baselineShift="sub" fontSize={17}>0</tspan>
          </text>
          <Label x={SP0} y={SPB + 34} size={20} color={wlColor(650)} anchor="start">
            ← lebih rendah
          </Label>
          <Label x={SP1} y={SPB + 34} size={20} color={wlColor(455)} anchor="end">
            lebih tinggi →
          </Label>
          <Label x={1270} y={270} size={22} color={C.muted} anchor="start" font="mono">
            serapan vs frekuensi
          </Label>
          {/* garis diam (tanpa Doppler) */}
          <line x1={SPC} y1={SPB} x2={SPC} y2={SPB - 230} stroke="#b9c3e6" strokeWidth={3} opacity={0.6 * (1 - sticks) * (1 - env)} />
          {/* garis pahlawan */}
          <line x1={SPC + KV * VH} y1={SPB} x2={SPC + KV * VH} y2={SPB - 200} stroke={vCol(VH)} strokeWidth={5} opacity={hero} />
          <line x1={SPC - KV * VH} y1={SPB} x2={SPC - KV * VH} y2={SPB - 200} stroke={vCol(-VH)} strokeWidth={5} opacity={heroB} />
          {/* garis tiap molekul */}
          {mols.map((m) => (
            <line key={m.i} x1={SPC + KV * m.vEff * sf} y1={SPB} x2={SPC + KV * m.vEff * sf} y2={SPB - 46} stroke={vCol(m.vEff)} strokeWidth={2.5} opacity={sticks * (1 - 0.6 * env)} />
          ))}
          <path d={`${envD} L${SP1},${SPB} L${SP0},${SPB} Z`} fill={C.gold} fillOpacity={0.14 * env} />
          <path d={envD} fill="none" stroke={C.gold} strokeWidth={4} opacity={env} />
          <Label x={SPC} y={SPB - 210 / sf - 26} size={22} color={C.gold} opacity={env}>
            profil Gauss
          </Label>
        </g>

        {/* penggeser suhu */}
        <g opacity={slider}>
          <line x1={1310} y1={680} x2={1740} y2={680} stroke={C.faint} strokeWidth={8} strokeLinecap="round" />
          <line x1={1310} y1={680} x2={mix(1310, 1740, (T - 300) / 900)} y2={680} stroke={interpolateColors(hot, [0, 1], [C.cyan, C.red])} strokeWidth={8} strokeLinecap="round" />
          <circle cx={mix(1310, 1740, (T - 300) / 900)} cy={680} r={16} fill="#fff" stroke={interpolateColors(hot, [0, 1], [C.cyan, C.red])} strokeWidth={4} />
          <text x={1300} y={650} fontFamily={FONT.mono} fontSize={24} fill={C.ink}>
            <tspan fontFamily={FONT.serif} fontStyle="italic">
              T
            </tspan>
            {` = ${Math.round(T / 10) * 10} K`}
          </text>
          <Label x={1740} y={650} size={22} color={C.muted} anchor="end">
            laju ×{sf.toFixed(1).replace('.', ',')}
          </Label>
        </g>

        {/* tangga tingkat energi translasi */}
        <g opacity={Math.min(1, ladIn)}>
          <line x1={LAD0 - 20} y1={LADB + 10} x2={LAD0 - 20} y2={LADT - 20} stroke={C.muted} strokeWidth={2} />
          <text x={LAD0 - 34} y={LADT - 8} textAnchor="end" fontFamily={FONT.serif} fontStyle="italic" fontSize={28} fill={C.muted}>
            E
          </text>
          {Array.from({length: 150}, (_, k) => {
            const n = k + 1;
            const y = LADB - n * n * E1;
            if (y < LADT - 2) return null;
            const sep = Math.min(1, (2 * n + 1) * E1 / 30);
            const top = Math.min(1, (y - LADT) / 20);
            const col = n <= 4 ? interpolateColors(sep, [0, 1], [C.muted, ncol(n)]) : C.muted;
            return <line key={n} x1={LAD0} y1={y} x2={LAD1} y2={y} stroke={col} strokeWidth={1 + 2 * sep} opacity={(0.35 + 0.6 * sep) * top} />;
          })}
          <g opacity={dense}>
            <path d={`M${LAD1 + 18},${LADB} l10,0 l0,${LADT - LADB} l-10,0`} fill="none" stroke={C.gold} strokeWidth={3} />
            <Label x={LAD1 + 6} y={LADT - 28} size={24} color={C.gold} anchor="end">
              hampir kontinu
            </Label>
          </g>
          <Label x={LAD0} y={LADB + 36} size={22} color={C.muted} anchor="start" font="mono" opacity={1 - shrink}>
            tingkat translasi (wadah besar)
          </Label>
          {/* fungsi gelombang di tingkat yang terpisah */}
          {[1, 2, 3, 4].map((n) => {
            const y = LADB - n * n * E1;
            const p = ramp(t, tBox - 0.6 + n * 0.15, tBox + 0.2 + n * 0.15) * waves;
            if (p <= 0.01 || y < LADT) return null;
            let d = '';
            for (let i = 0; i <= 80; i++) {
              const u = i / 80;
              d += `${i ? 'L' : 'M'}${mix(LAD0 + 60, LAD1 - 60, u).toFixed(1)},${(y - 30 * psi(n, u) * Math.cos(t * 1.2 * n)).toFixed(1)}`;
            }
            return (
              <g key={n} opacity={p}>
                <path d={d} fill="none" stroke={ncol(n)} strokeWidth={3} />
                <text x={LAD1 + 16} y={y + 7} fontFamily={FONT.serif} fontStyle="italic" fontSize={22} fill={ncol(n)}>
                  n = {n}
                </text>
              </g>
            );
          })}
          <g opacity={waves}>
            <line x1={LAD0 + 60} y1={LADB + 6} x2={LAD0 + 60} y2={LADT} stroke={C.violet} strokeWidth={4} opacity={0.6} />
            <line x1={LAD1 - 60} y1={LADB + 6} x2={LAD1 - 60} y2={LADT} stroke={C.violet} strokeWidth={4} opacity={0.6} />
          </g>
        </g>

        {/* titik kuantum: elektron dalam kotak kecil */}
        <g opacity={ramp(t, tDot - 0.4, tDot + 0.5)}>
          <Electron x={590 + 42 * Math.sin(t * 2.3)} y={480 + 30 * Math.sin(t * 1.7 + 1)} r={10} />
          <Label x={590} y={590} size={28} color={C.violet} weight={700}>
            titik kuantum
          </Label>
          <Label x={590} y={628} size={22} color={C.muted}>
            (skala diperbesar)
          </Label>
        </g>
        <g opacity={pibTag}>
          <rect x={460} y={318} width={260} height={50} rx={25} fill="rgba(255,194,74,0.1)" stroke={C.gold} strokeWidth={2} />
          <Label x={590} y={343} size={24} color={C.gold}>
            partikel dalam kotak
          </Label>
        </g>
      </Stage>

      <Formula x={1525} y={800} p={card3} accent={C.gold} caption="makin panas → makin lebar">
        Δ<V>ν</V>
        <Sub>Doppler</Sub> ∝ <Sqrt>
          <V>T</V>
        </Sqrt>
      </Formula>
      <Formula x={1000} y={800} p={cardE} accent={C.violet}>
        <V>E</V>
        <Sub>n</Sub> ={' '}
        <Frac
          n={
            <>
              <V>n</V>
              <Sup>2</Sup>
              <V>h</V>
              <Sup>2</Sup>
            </>
          }
          d={
            <>
              8<V>mL</V>
              <Sup>2</Sup>
            </>
          }
        />
      </Formula>
    </AbsoluteFill>
  );
};
