import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, slot} from '../anim';
import {Formula, Glow, Label, Stage, V} from '../components/primitives';
import {CO, CO2M, HCL2, Helix, IR, MW, N2, RichText, spinAngle, spinTf} from '../components/spB';
import {SyDefs, molDraw, type SMol} from '../components/syC';
import {Ring, Tick, Vec, arrow3, co2, co2Mode, dipole, molItems3, place, vibrate} from '../components/syD';
import {Render3D, VbDefs, proj, rotZ, type Cam, type V3} from '../components/vbC';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Bab 04: aturan seleksi. Kasar: dipol permanen (gelombang mikro), dipol berubah (IR). Halus: ΔJ = ±1, Δv = ±1.
// Panah dipol menunjuk dari δ− ke δ+ (IUPAC): HCl Cl→H; CO C→O (dipol CO kecil, ujung negatif di C).
const DIP = '#ffb066';

type RowMol = {mol: SMol; name: (string | [string, 'sub' | 'sup' | 'i'])[]; dip: [V3, V3] | null; omega: number; x: number};
const ROW: RowMol[] = [
  {mol: HCL2, name: ['HCl'], dip: [[0.35, 0, 0], [-0.95, 0, 0]], omega: 1.0, x: 360},
  {mol: CO, name: ['CO'], dip: [[-0.28, 0, 0], [0.28, 0, 0]], omega: 0.8, x: 760},
  {mol: N2, name: ['N', ['2', 'sub']], dip: null, omega: 0.85, x: 1160},
  {mol: CO2M, name: ['CO', ['2', 'sub']], dip: null, omega: 0.6, x: 1560},
];

const ladderJ = (J: number) => 800 - 22 * J * (J + 1);
const ladderV = (v: number) => 800 - 140 * v;

export const Selection: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ---- fase ----
  const pA = slot(t, -0.4, cue(2), 0.8, 0.6); // deretan empat molekul
  const pB = slot(t, cue(2), cue(3), 0.7, 0.6); // CO₂ di IR
  const pC = ramp(t, cue(3), cue(3) + 0.8); // tangga aturan halus

  // judul bergantian
  const heads: [number, React.ReactNode, string][] = [
    [slot(t, -0.2, cue(1)), 'Aturan seleksi', C.ink],
    [slot(t, cue(1), cue(2)), 'Aturan kasar · rotasi (gelombang mikro)', C.cyan],
    [slot(t, cue(2), cue(3)), 'Aturan kasar · vibrasi (inframerah)', C.amber],
    [ramp(t, cue(3), cue(3) + 0.6), 'Aturan halus · berapa anak tangga?', C.gold],
  ];

  // ---- deretan molekul (fase A) ----
  const pDip = ramp(t, wordOf(1, 'dipol'), wordOf(1, 'dipol') + 0.8);
  const pWave = ramp(t, wordOf(1, 'gelombang'), wordOf(1, 'gelombang') + 1.2);
  const nameT = [wordOf(1, 'Cl'), wordOf(1, 'CO', 0), wordOf(1, 'dua', 0), wordOf(1, 'CO', 1)];
  const tickT = [wordOf(1, 'bisa'), wordOf(1, 'bisa') + 0.25, wordOf(1, 'tidak'), wordOf(1, 'tidak') + 0.25];
  const chipK = ramp(t, wordOf(0, 'kasar'), wordOf(0, 'kasar') + 0.6, BACK) * slot(t, -1, cue(1));
  const chipH = ramp(t, wordOf(0, 'halus'), wordOf(0, 'halus') + 0.6, BACK) * slot(t, -1, cue(1));

  const rowItems = ROW.flatMap((r, i) => {
    const cam: Cam = {cx: r.x, cy: 470, s: 118, yaw: 0, pitch: -0.42};
    const ang = t * r.omega * 1.6 + i * 0.9;
    const tf = spinTf(ang);
    const items = molDraw(cam, r.mol, {tf, opacity: pA});
    if (r.dip) {
      const lift: V3 = [0, 0, 0.62];
      const a = tf(r.dip[0]);
      const b = tf(r.dip[1]);
      const it = arrow3(cam, {a: [a[0] + lift[0], a[1] + lift[1], a[2] + lift[2]], b: [b[0] + lift[0], b[1] + lift[1], b[2] + lift[2]], color: DIP, width: 6, opacity: pA * pDip, head: 20});
      if (it) items.push(it);
    }
    return items;
  });

  // ---- fase B: CO₂ asimetris (μ berubah) vs simetris (μ tetap 0) ----
  const vibPh = 2 * Math.PI * 0.85 * t;
  const pIR = ramp(t, cue(2), cue(2) + 1.0);
  const pDipB = ramp(t, wordOf(2, 'mengubah'), wordOf(2, 'mengubah') + 0.7);
  const tickB = wordOf(2, 'dipol') + 0.2;
  const pSim = ramp(t, wordOf(2, 'simetri'), wordOf(2, 'simetri') + 0.7, BACK);
  const camA: Cam = {cx: 640, cy: 470, s: 135, yaw: 0, pitch: -0.3};
  const camS: Cam = {cx: 1280, cy: 470, s: 135, yaw: 0, pitch: -0.3};
  const sway = (ph: number) => (v: V3): V3 => rotZ(v, 0.35 * Math.sin(t * 0.5 + ph));
  const asym = place(vibrate(co2(), co2Mode('asym'), 0.24, vibPh), sway(0));
  const symm = place(vibrate(co2(), co2Mode('sym'), 0.2, vibPh), sway(1.4));
  const dA = dipole(asym);
  const bItems = [
    ...molItems3(camA, asym, {opacity: pB}),
    ...molItems3(camS, symm, {opacity: pB}),
    arrow3(camA, {a: [0, 0, 0.95], b: [dA[0] * 4.2, dA[1] * 4.2, 0.95 + dA[2] * 4.2], color: DIP, width: 6, opacity: pB * pDipB, head: 20}),
  ];
  const s0 = proj([0, 0, 0.95], camS);

  // ---- fase C: tangga aturan halus ----
  const tD0 = wordOf(3, 'delta', 0);
  const tD1 = wordOf(3, 'delta', 1);
  const pCard = ramp(t, tD0, tD0 + 0.6);
  const pCard2 = ramp(t, tD1, tD1 + 0.6);
  const tF = wordOf(3, 'rotasi');
  const tFv = wordOf(3, 'harmonik');
  const dimAfter = 1 - 0.6 * ramp(t, cue(4), cue(4) + 0.8);
  const vOut = 1 - ramp(t, cue(4), cue(4) + 0.6, EASE_IN_OUT);

  // foton: datang → diserap (J 1→2) → foton lain pergi (J 2→1)
  const tP = cue(4) + 0.3;
  const tAbs = wordOf(4, 'momentum') + 0.5;
  const tEm = wordOf(4, 'turun');
  const inP = ramp(t, tP, tAbs, EASE_IN_OUT);
  const inOp = ramp(t, tP, tP + 0.4) * (1 - ramp(t, tAbs - 0.15, tAbs + 0.25));
  const outP = ramp(t, tEm, tEm + 2.2, EASE_IN_OUT);
  const outOp = ramp(t, tEm, tEm + 0.3) * (1 - ramp(t, tEm + 1.7, tEm + 2.2));
  const Jc = 1 + ramp(t, tAbs - 0.1, tAbs + 0.6) - ramp(t, tEm, tEm + 0.6);
  const pMarker = ramp(t, cue(4), cue(4) + 0.6);
  const molC: Cam = {cx: 960, cy: 610, s: 120, yaw: 0, pitch: -0.42};
  const omegaC = (tau: number) => {
    const J = 1 + ramp(tau, tAbs - 0.1, tAbs + 0.6) - ramp(tau, tEm, tEm + 0.6);
    return 1.25 * Math.sqrt(J * (J + 1));
  };
  const angC = spinAngle(t, omegaC, cue(3) - 1);
  const tfC = spinTf(angC);
  const cItems = [
    ...molDraw(molC, HCL2, {tf: tfC, opacity: pC}),
    (() => {
      const a = tfC([0.35, 0, 0]);
      const b = tfC([-0.95, 0, 0]);
      return arrow3(molC, {a: [a[0], a[1], a[2] + 0.62], b: [b[0], b[1], b[2] + 0.62], color: DIP, width: 5, opacity: pC * 0.9, head: 18});
    })(),
  ];

  return (
    <AbsoluteFill>
      <Stage>
        <SyDefs />
        <VbDefs />

        {/* judul bagian */}
        {heads.map(([p, txt, col], i) => (
          <Label key={i} x={960} y={112 - (1 - p) * 10} size={44} weight={700} color={col} opacity={p}>
            {txt}
          </Label>
        ))}

        {/* L0: dua jenis aturan */}
        <g opacity={chipK} transform={`translate(620 215) scale(${0.85 + 0.15 * chipK})`}>
          <rect x={-250} y={-34} width={500} height={68} rx={34} fill="rgba(79,214,255,0.10)" stroke={C.cyan} strokeWidth={2} />
          <Label x={0} y={0} size={28} color={C.cyan} weight={600}>
            kasar: boleh menyerap atau tidak?
          </Label>
        </g>
        <g opacity={chipH} transform={`translate(1300 215) scale(${0.85 + 0.15 * chipH})`}>
          <rect x={-230} y={-34} width={460} height={68} rx={34} fill="rgba(255,194,74,0.10)" stroke={C.gold} strokeWidth={2} />
          <Label x={0} y={0} size={28} color={C.gold} weight={600}>
            halus: berapa langkah?
          </Label>
        </g>

        {/* ===== fase A ===== */}
        <g opacity={pA}>
          {/* berkas gelombang mikro: medan listrik berosilasi melintasi deretan */}
          <g opacity={pWave * 0.75}>
            <path
              d={Array.from({length: 161}, (_, k) => {
                const x = 110 + (1700 * k) / 160;
                const y = 470 + 46 * Math.sin((x - 110) / 62 - t * 4.2) * Math.min(1, (x - 110) / 120) * pWave;
                return `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
              }).join(' ')}
              fill="none"
              stroke={MW}
              strokeWidth={3}
              opacity={0.55}
            />
            <Label x={130} y={330} size={24} anchor="start" color={MW} weight={600}>
              gelombang mikro
            </Label>
          </g>
          {ROW.map((r, i) => {
            const pN = ramp(t, nameT[i], nameT[i] + 0.5);
            const pT = ramp(t, tickT[i], tickT[i] + 0.6);
            const ok = !!r.dip;
            const E = Math.sin((r.x - 110) / 62 - t * 4.2);
            const grip = ok ? pWave * pT : 0;
            return (
              <g key={i}>
                {ok ? <Glow x={r.x} y={470} r={170} color="gold" opacity={0.18 * grip * (0.6 + 0.4 * Math.abs(E))} /> : null}
                {ok ? (
                  <circle cx={r.x} cy={470} r={128 + 6 * E} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="10 12" opacity={0.7 * grip} transform={`rotate(${t * 40 * (i % 2 ? -1 : 1)} ${r.x} 470)`} />
                ) : null}
                {/* panah medan E di pusat molekul */}
                <g opacity={pWave * 0.5}>
                  <Vec x1={r.x + 150} y1={470} x2={r.x + 150} y2={470 - 70 * E} color={MW} width={3} head={12} halo={false} />
                </g>
                <RichText x={r.x} y={630} segs={r.name} size={40} weight={700} opacity={0.35 + 0.65 * pN} color={C.ink} />
                <RichText x={r.x} y={680} segs={[['μ', 'i'], ok ? ' ≠ 0' : ' = 0']} size={28} color={ok ? DIP : C.muted} opacity={pDip} weight={500} />
                <Tick x={r.x} y={748} ok={ok} s={30} p={pT} />
                {ok ? (
                  <Label x={r.x} y={800} size={22} color={C.mint} opacity={pT * pWave}>
                    dicengkeram medan
                  </Label>
                ) : (
                  <Label x={r.x} y={800} size={22} color={C.muted} opacity={pT}>
                    tak terpegang
                  </Label>
                )}
              </g>
            );
          })}
        </g>
        <Render3D items={rowItems} />

        {/* ===== fase B ===== */}
        <g opacity={pB}>
          <path
            d={Array.from({length: 161}, (_, k) => {
              const x = 110 + (1700 * k) / 160;
              const y = 470 + 30 * Math.sin((x - 110) / 34 - t * 6) * Math.min(1, (x - 110) / 100) * pIR;
              return `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ')}
            fill="none"
            stroke={IR}
            strokeWidth={3}
            opacity={0.45 * pIR}
          />
          <Label x={130} y={330} size={24} anchor="start" color={IR} weight={600} opacity={pIR}>
            inframerah
          </Label>
          <Label x={640} y={640} size={32} weight={600}>
            regangan asimetris
          </Label>
          <Label x={1280} y={640} size={32} weight={600}>
            regangan simetris
          </Label>
          <RichText x={640} y={688} segs={[['μ', 'i'], ' berubah-ubah']} size={27} color={DIP} opacity={pDipB} weight={500} />
          <RichText x={1280} y={688} segs={[['μ', 'i'], ' tetap 0']} size={27} color={C.muted} opacity={pDipB} weight={500} />
          <Tick x={640} y={752} ok s={30} p={ramp(t, tickB, tickB + 0.6)} />
          <Tick x={1280} y={752} ok={false} s={30} p={ramp(t, tickB + 0.3, tickB + 0.9)} />
          <circle cx={s0.X} cy={s0.Y} r={7} fill={C.muted} opacity={pDipB * (0.5 + 0.3 * Math.sin(t * 3))} />
          <Ring x={640} y={470} p={ramp(t, tickB, tickB + 1.2)} r={190} color={C.mint} />
          <g opacity={pSim} transform={`translate(960 830) scale(${0.85 + 0.15 * pSim})`}>
            <rect x={-330} y={-26} width={660} height={52} rx={26} fill="rgba(160,131,255,0.10)" stroke={C.violet} strokeWidth={2} />
            <Label x={0} y={0} size={24} color={C.violet} weight={600}>
              sudah diramal tabel karakter (video Simetri)
            </Label>
          </g>
        </g>
        <Render3D items={bItems} />

        {/* ===== fase C ===== */}
        <g opacity={pC}>
          {/* tangga rotasi */}
          <Label x={380} y={318} size={30} color={C.cyan} weight={700}>
            rotasi
          </Label>
          {[0, 1, 2, 3, 4].map((J) => {
            const y = ladderJ(J);
            const hl = Math.max(0, 1 - Math.abs(Jc - J)) * pMarker;
            return (
              <g key={J}>
                <line x1={200} y1={y} x2={560} y2={y} stroke={C.cyan} strokeWidth={3 + 2 * hl} opacity={0.65 + 0.35 * hl} strokeLinecap="round" />
                <RichText x={185} y={y} segs={[['J', 'i'], ` = ${J}`]} size={22} anchor="end" color={C.cyan} font="mono" weight={500} />
              </g>
            );
          })}
          {[0, 1, 2, 3].map((k) => {
            const a = tD0 + 0.35 + 0.3 * k;
            const p = ramp(t, a, a + 0.5);
            const x = 250 + 62 * k;
            return (
              <g key={k} opacity={dimAfter}>
                <Vec x1={x} y1={ladderJ(k) - 4} x2={x} y2={mix(ladderJ(k) - 4, ladderJ(k + 1) + 4, p)} color={C.mint} width={4} head={14} halo={false} />
              </g>
            );
          })}
          {/* ΔJ = 2 terlarang */}
          <g opacity={ramp(t, tF, tF + 0.5) * dimAfter}>
            <line x1={515} y1={ladderJ(1) - 4} x2={515} y2={ladderJ(3) + 14} stroke={C.red} strokeWidth={4} strokeDasharray="8 8" />
            <path d={`M505,${ladderJ(3) + 18} L515,${ladderJ(3) + 4} L525,${ladderJ(3) + 18}`} fill="none" stroke={C.red} strokeWidth={4} />
            <Tick x={515} y={(ladderJ(1) + ladderJ(3)) / 2} ok={false} s={22} p={ramp(t, tF + 0.2, tF + 0.8)} />
          </g>

          {/* tangga vibrasi */}
          <g opacity={vOut}>
            <Label x={1540} y={318} size={30} color={C.amber} weight={700}>
              vibrasi
            </Label>
            {[0, 1, 2, 3].map((v) => (
              <g key={v}>
                <line x1={1360} y1={ladderV(v)} x2={1720} y2={ladderV(v)} stroke={C.amber} strokeWidth={3} opacity={0.8} strokeLinecap="round" />
                <RichText x={1738} y={ladderV(v)} segs={[['v', 'i'], ` = ${v}`]} size={22} anchor="start" color={C.amber} font="mono" weight={500} />
              </g>
            ))}
            {[0, 1, 2].map((k) => {
              const a = tD1 + 0.35 + 0.3 * k;
              const p = ramp(t, a, a + 0.5);
              const x = 1420 + 70 * k;
              return <Vec key={k} x1={x} y1={ladderV(k) - 4} x2={x} y2={mix(ladderV(k) - 4, ladderV(k + 1) + 4, p)} color={C.mint} width={4} head={14} halo={false} />;
            })}
            <g opacity={ramp(t, tFv, tFv + 0.5)}>
              <line x1={1675} y1={ladderV(0) - 4} x2={1675} y2={ladderV(2) + 14} stroke={C.red} strokeWidth={4} strokeDasharray="8 8" />
              <path d={`M1665,${ladderV(2) + 18} L1675,${ladderV(2) + 4} L1685,${ladderV(2) + 18}`} fill="none" stroke={C.red} strokeWidth={4} />
              <Tick x={1675} y={ladderV(1)} ok={false} s={22} p={ramp(t, tFv + 0.2, tFv + 0.8)} />
            </g>
          </g>

          {/* penanda tingkat J molekul (L4) */}
          <g opacity={pMarker}>
            <circle cx={600} cy={mix(ladderJ(1), ladderJ(2), Jc - 1)} r={13} fill={C.gold} />
            <circle cx={600} cy={mix(ladderJ(1), ladderJ(2), Jc - 1)} r={22 + 4 * Math.sin(t * 4)} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.6} />
            <Label x={645} y={(ladderJ(1) + ladderJ(2)) / 2} size={30} color={C.mint} weight={700} anchor="start" opacity={ramp(t, tAbs, tAbs + 0.4) * (1 - ramp(t, tEm - 0.3, tEm))}>
              +1
            </Label>
            <Label x={645} y={(ladderJ(1) + ladderJ(2)) / 2} size={30} color={C.pink} weight={700} anchor="start" opacity={ramp(t, tEm, tEm + 0.4) * (1 - ramp(t, tEm + 2.2, tEm + 2.8))}>
              −1
            </Label>
          </g>
          <Glow x={960} y={610} r={200} color="cyan" opacity={0.12 + 0.12 * cyc(ramp(t, tAbs - 0.2, tAbs + 1.2))} />
          <Ring x={960} y={610} p={ramp(t, tAbs - 0.1, tAbs + 1.0)} r={180} color={C.gold} />
          <Label x={960} y={790} size={24} color={C.muted} opacity={pMarker}>
            berputar lebih cepat di J lebih tinggi
          </Label>
        </g>
        <Render3D items={cItems} />

        {/* foton spiral */}
        <Helix x={mix(1830, 1110, inP)} y={610} len={300} amp={30} wl={64} phase={t * 9} color={IR} opacity={inOp} />
        <RichText x={mix(1830, 1110, inP)} y={540} segs={['momentum sudut 1', ['ħ', 'i']]} size={28} color={C.gold} opacity={inOp} />
        <Helix x={mix(1110, 1830, outP)} y={610} len={300} amp={30} wl={64} phase={t * 9} color={IR} opacity={outOp} />
        <RichText x={mix(1110, 1830, outP)} y={540} segs={['1', ['ħ', 'i'], ' dibawa pergi']} size={28} color={C.gold} opacity={outOp} />
        <Label x={1470} y={690} size={22} color={IR} opacity={pC * pMarker * (1 - ramp(t, dur - 1, dur))}>
          foton (berpolarisasi melingkar)
        </Label>
      </Stage>

      <Formula x={960} y={240} p={pCard} accent={C.gold} size={60}>
        Δ<V>J</V> = ±1
        <span style={{opacity: pCard2}}>
          <span style={{display: 'inline-block', width: 70}} />Δ<V>v</V> = ±1
        </span>
      </Formula>
    </AbsoluteFill>
  );
};
