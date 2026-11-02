import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, ramp, rand} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {Render3D, VbDefs} from '../components/vbC';
import {Ring, molItems3} from '../components/syD';
import {StarIcon} from '../components/grupD';
import {Dish, SpDefs, StarField, camAt, coMol, spinY, wavePath} from '../components/spD';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 11: awan molekular gelap (H₂ tak terlihat) → CO berputar memancarkan garis ≈ 115 GHz →
// teleskop radio memetakan awan, bintang baru menyala di gumpalan padat → > 200 molekul antarbintang.

const BLOBS: [number, number, number, number][] = [
  [760, 470, 230, 1],
  [980, 530, 250, 1],
  [1180, 460, 190, 0.9],
  [620, 610, 170, 0.8],
  [900, 680, 190, 0.8],
  [1240, 630, 160, 0.7],
  [520, 430, 140, 0.6],
  [1350, 520, 140, 0.6],
];
const CLUMPS: [number, number][] = [
  [800, 490],
  [1020, 570],
  [1190, 470],
];
const dens = (x: number, y: number) => BLOBS.reduce((s, [bx, by, r, w]) => s + w * Math.exp(-((x - bx) ** 2 + (y - by) ** 2) / (r * 0.75) ** 2), 0);

const CO_PTS: [number, number][] = [
  [700, 420],
  [880, 600],
  [1110, 520],
  [960, 410],
  [640, 640],
  [1280, 600],
  [1060, 700],
  [820, 740],
  [1220, 420],
  [560, 500],
];

type Part = [string, boolean?];
const MOLS: {f: Part[]; org?: boolean}[] = [
  {f: [['H'], ['2', true], ['O']]},
  {f: [['NH'], ['3', true]]},
  {f: [['HCN']]},
  {f: [['CH'], ['3', true], ['OH']], org: true},
  {f: [['HC'], ['3', true], ['N']], org: true},
];

const Chem: React.FC<{x: number; y: number; f: Part[]; size: number; color: string; opacity: number}> = ({x, y, f, size, color, opacity}) => (
  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={700} fontSize={size} fill={color} opacity={opacity} style={{paintOrder: 'stroke', stroke: 'rgba(4,6,12,0.85)', strokeWidth: size * 0.12}}>
    {f.map(([s, sub], k) =>
      sub ? (
        <tspan key={k} baselineShift="sub" fontSize={size * 0.62}>
          {s}
        </tspan>
      ) : (
        <tspan key={k}>{s}</tspan>
      ),
    )}
  </text>
);

export const Radio: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const sky = ramp(t, -0.6, 1.0);
  const h2 = ramp(t, wordOf(0, 'hidrogen') - 0.3, wordOf(0, 'hidrogen') + 0.8);
  const h2Lab = ramp(t, wordOf(0, 'hampir') - 0.3, wordOf(0, 'hampir') + 0.6) * (1 - 0.6 * ramp(t, cue(2), cue(2) + 1));
  const co = ramp(t, wordOf(1, 'karbon') - 0.3, wordOf(1, 'karbon') + 0.7);
  const lens = ramp(t, wordOf(1, 'berputar') - 0.5, wordOf(1, 'berputar') + 0.4, BACK) * (1 - ramp(t, cue(3) - 0.5, cue(3) + 0.1, EASE_IN_OUT));
  const emit = ramp(t, wordOf(1, 'memancarkan') - 0.3, wordOf(1, 'memancarkan') + 0.6);
  const ghz = ramp(t, wordOf(1, 'seratus') - 0.3, wordOf(1, 'seratus') + 0.5);
  const dish = ramp(t, cue(2) - 0.5, cue(2) + 0.5, BACK);
  const scan = ramp(t, wordOf(2, 'memetakan') - 0.2, wordOf(2, 'memetakan') + 2.6, EASE_IN_OUT);
  const born = (k: number) => ramp(t, wordOf(2, 'lahir') - 0.4 + k * 0.35, wordOf(2, 'lahir') + 0.3 + k * 0.35, BACK);
  const tick = ramp(t, wordOf(3, 'lebih') - 0.4, wordOf(3, 'lebih') + 0.4, BACK);
  const count = ramp(t, wordOf(3, 'dua') - 0.3, wordOf(3, 'ratus') + 0.8, EASE_IN_OUT);
  const org = ramp(t, wordOf(3, 'organik') - 0.3, wordOf(3, 'organik') + 0.5);
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);

  const camL = camAt(1640, 316, 64, 0.25, -0.12, 9);
  const coRot = spinY(coMol(), -t * 1.6);

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <VbDefs />
        <SpDefs />
        <defs>
          <clipPath id="radio-scan">
            <rect x={300} y={180} width={1300 * scan} height={720} />
          </clipPath>
        </defs>
        <g opacity={sky}>
          <Glow x={940} y={520} r={760} color="violet" opacity={0.2} />
          <Glow x={1100} y={460} r={420} color="red" opacity={0.1} />
          <StarField t={t} n={260} seed={3} hide={(x, y) => Math.min(1, dens(x, y) * 1.4)} box={[0, 170, 1920, 730]} />
          {/* awan gelap */}
          {BLOBS.map(([x, y, r], k) => (
            <circle key={`d${k}`} cx={x + 6 * Math.sin(t * 0.2 + k)} cy={y + 4 * Math.cos(t * 0.17 + k)} r={r * 1.35} fill="url(#sp-dark)" />
          ))}
          {BLOBS.slice(0, 5).map(([x, y, r], k) => (
            <circle key={`u${k}`} cx={x} cy={y} r={r * 1.45} fill="url(#sp-dust)" opacity={0.7} />
          ))}
        </g>

        {/* H₂ samar */}
        <g opacity={h2 * 0.32}>
          {Array.from({length: 22}, (_, k) => {
            const ph = ((rand(k * 1.9) + t * 0.02) % 1 + 1) % 1;
            const x = 480 + rand(k * 3.3) * 900 + 40 * Math.sin(t * 0.3 + k);
            const y = 330 + rand(k * 5.1) * 440 + 30 * (ph - 0.5);
            const a = t * (0.5 + rand(k)) + k;
            const dx = 9 * Math.cos(a);
            const dy = 9 * Math.sin(a);
            return (
              <g key={k} opacity={cyc(ph) * 1.2 * Math.min(1, dens(x, y))}>
                <line x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} stroke="#cfd8ff" strokeWidth={3} />
                <circle cx={x - dx} cy={y - dy} r={5} fill="#cfd8ff" />
                <circle cx={x + dx} cy={y + dy} r={5} fill="#cfd8ff" />
              </g>
            );
          })}
        </g>
        <g opacity={h2Lab}>
          <text x={880} y={300} textAnchor="middle" fontFamily={FONT.sans} fontSize={34} fontWeight={600} fill={C.muted} opacity={0.75}>
            H
            <tspan baselineShift="sub" fontSize={22}>
              2
            </tspan>
            <tspan dx={10}>· hampir tak terlihat</tspan>
          </text>
        </g>

        {/* peta CO berwarna (dipindai) */}
        <g clipPath="url(#radio-scan)" opacity={0.85 * ramp(t, wordOf(2, 'memetakan') - 0.3, wordOf(2, 'memetakan') + 0.3)}>
          {BLOBS.map(([x, y, r, w], k) => (
            <g key={k}>
              <circle cx={x} cy={y} r={r * 1.25} fill="url(#sp-map-v)" opacity={0.55 * w} />
              <circle cx={x} cy={y} r={r * 0.85} fill="url(#sp-map-c)" opacity={0.45 * w} />
            </g>
          ))}
          {CLUMPS.map(([x, y], k) => (
            <g key={k}>
              <circle cx={x} cy={y} r={120} fill="url(#sp-map-m)" opacity={0.55} />
              <circle cx={x} cy={y} r={72} fill="url(#sp-map-g)" opacity={0.75 + 0.15 * Math.sin(t * 2 + k)} />
              <circle cx={x} cy={y} r={30} fill="url(#sp-map-w)" opacity={0.6} />
            </g>
          ))}
        </g>
        {scan > 0.001 && scan < 0.999 ? <line x1={300 + 1300 * scan} y1={200} x2={300 + 1300 * scan} y2={860} stroke={C.cyan} strokeWidth={14} opacity={0.18} /> : null}
        {scan > 0.001 && scan < 0.999 ? <line x1={300 + 1300 * scan} y1={200} x2={300 + 1300 * scan} y2={860} stroke={C.cyan} strokeWidth={2.5} opacity={0.8} /> : null}
        <g opacity={ramp(t, wordOf(2, 'memetakan') + 1.5, wordOf(2, 'memetakan') + 2.4)}>
          <rect x={340} y={214} width={210} height={46} rx={23} fill="rgba(6,20,32,0.85)" stroke={C.cyan} strokeWidth={2} />
          <Label x={445} y={237} size={26} color={C.cyan} weight={700}>
            peta CO
          </Label>
        </g>

        {/* bintang baru di gumpalan padat */}
        {CLUMPS.map(([x, y], k) => (
          <g key={k}>
            <StarIcon x={x} y={y} r={20 * born(k)} t={t + k} opacity={Math.min(1, born(k) * 1.5)} />
            <Ring x={x} y={y} p={born(k) < 1 ? born(k) : 0} r={110} color={C.gold} />
          </g>
        ))}

        {/* CO di dalam awan */}
        {CO_PTS.map(([x, y], k) => {
          const xx = x + 10 * Math.sin(t * 0.4 + k);
          const yy = y + 8 * Math.cos(t * 0.33 + k);
          const a = t * (1.2 + 0.4 * rand(k)) + k;
          const ph = ((t * 0.45 + rand(k * 2.7)) % 1 + 1) % 1;
          return (
            <g key={k} opacity={co}>
              <circle cx={xx} cy={yy} r={18} fill="url(#soft-cyan)" opacity={0.5} />
              <line x1={xx - 7 * Math.cos(a)} y1={yy - 7 * Math.sin(a)} x2={xx + 6 * Math.cos(a)} y2={yy + 6 * Math.sin(a)} stroke="#9aa6c6" strokeWidth={3} />
              <circle cx={xx - 7 * Math.cos(a)} cy={yy - 7 * Math.sin(a)} r={5} fill="#7a8399" />
              <circle cx={xx + 6 * Math.cos(a)} cy={yy + 6 * Math.sin(a)} r={5} fill="#ff4d63" />
              {emit > 0.01 ? <circle cx={xx} cy={yy} r={10 + 50 * ph} fill="none" stroke={C.cyan} strokeWidth={2} opacity={emit * 0.7 * cyc(ph)} /> : null}
            </g>
          );
        })}

        {/* gelombang 115 GHz menuju antena */}
        {[0, 1, 2].map((k) => {
          const op = emit * dish * (0.5 + 0.5 * Math.sin(t * 2 + k * 2));
          return op > 0.01 ? (
            <path
              key={k}
              d={wavePath(1300, 520 + k * 60, 1590, 640 + k * 14, 34, t * 7 + k, (u) => 9 * Math.sin(Math.PI * u))}
              fill="none"
              stroke={C.cyan}
              strokeWidth={3}
              opacity={op}
            />
          ) : null;
        })}
        <Dish x={1680} y={712} s={0.95} tilt={-38} t={t} live={emit * dish} opacity={dish} />
        <g opacity={dish}>
          <Label x={1690} y={868} size={24} color={C.muted}>
            teleskop radio
          </Label>
        </g>

        {/* lensa zoom: CO berputar */}
        <g opacity={lens}>
          <line x1={1205} y1={512} x2={1530} y2={390} stroke={C.cyan} strokeWidth={1.5} strokeDasharray="5 6" opacity={0.5} />
          <circle cx={1640} cy={316} r={130} fill="rgba(4,10,22,0.92)" stroke={C.cyan} strokeWidth={3} />
          {[0, 1, 2].map((k) => {
            const ph = ((t * 0.7 + k / 3) % 1 + 1) % 1;
            return <circle key={k} cx={1640} cy={316} r={40 + 85 * ph} fill="none" stroke={C.cyan} strokeWidth={2.5} opacity={emit * cyc(ph) * 0.8} />;
          })}
          <Render3D items={molItems3(camL, coRot, {labels: true})} />
          {(() => {
            const a0 = t * 1.6;
            const pts = Array.from({length: 20}, (_, i) => {
              const a = a0 + (i / 19) * 1.3;
              return `${i ? 'L' : 'M'}${(1640 + 96 * Math.cos(a)).toFixed(1)},${(316 + 96 * Math.sin(a)).toFixed(1)}`;
            }).join(' ');
            return <path d={pts} fill="none" stroke={C.cyan} strokeWidth={4} strokeLinecap="round" markerEnd="url(#arrow-cyan)" opacity={0.8} />;
          })()}
          <Label x={1640} y={480} size={28} color={C.cyan} weight={700}>
            CO berputar · J = 1 → 0
          </Label>
          <g opacity={ghz}>
            <rect x={1530} y={504} width={220} height={50} rx={25} fill="rgba(6,24,36,0.92)" stroke={C.cyan} strokeWidth={2} />
            <Label x={1640} y={529} size={30} color={C.cyan} weight={800}>
              ≈ 115 GHz
            </Label>
          </g>
        </g>

        {/* rumus molekul antarbintang melayang */}
        {MOLS.map((m, k) => {
          const a = ramp(t, wordOf(3, 'molekul') - 0.2 + k * 0.4, wordOf(3, 'molekul') + 0.5 + k * 0.4, BACK);
          const x = [560, 760, 980, 1180, 1380][k] + 14 * Math.sin(t * 0.6 + k);
          const y = [300, 790, 300, 790, 300][k] + 10 * Math.cos(t * 0.8 + k * 1.3);
          const hot = m.org ? org : 0;
          return (
            <g key={k} opacity={a}>
              <circle cx={x} cy={y} r={60} fill="url(#soft-gold)" opacity={0.35 * hot} />
              <Chem x={x} y={y} f={m.f} size={46 + 6 * hot} color={hot > 0.01 ? C.gold : C.ink} opacity={1} />
            </g>
          );
        })}
        <g opacity={org}>
          <Label x={1280} y={850} size={26} color={C.gold}>
            molekul organik
          </Label>
        </g>
      </Stage>

      {/* ticker */}
      {tick > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: 1640,
            top: 330,
            transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * tick})`,
            opacity: tick,
            padding: '20px 36px',
            borderRadius: 22,
            background: 'linear-gradient(160deg, rgba(10,30,48,0.9), rgba(6,10,24,0.9))',
            border: `2px solid ${C.cyan}88`,
            boxShadow: `0 0 50px ${C.cyan}33`,
            textAlign: 'center',
            fontFamily: FONT.sans,
            color: C.ink,
          }}
        >
          <div style={{fontSize: 84, fontWeight: 800, color: C.cyan, lineHeight: 1}}>
            <span style={{opacity: count ** 3}}>&gt; </span>
            {Math.round(200 * count)}
          </div>
          <div style={{fontSize: 30, marginTop: 6}}>molekul antarbintang</div>
          <div style={{fontSize: 22, marginTop: 4, color: C.muted}}>terdeteksi lewat garis spektrumnya</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
