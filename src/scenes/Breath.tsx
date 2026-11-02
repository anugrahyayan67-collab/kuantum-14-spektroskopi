import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand, slot} from '../anim';
import {Formula, Glow, Label, Stage, V} from '../components/primitives';
import {Render3D, VbDefs} from '../components/vbC';
import {molItems3} from '../components/syD';
import {IR_COL, SpDefs, Gauge, camAt, ethanol, spinZ, wavePath} from '../components/spD';
import {Ring} from '../components/syD';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 10: alat uji napas inframerah — berkas IR melewati sampel napas; C–H etanol menyerap ≈ 3,4 µm;
// makin banyak etanol, makin lemah cahaya yang sampai ke detektor (Lambert–Beer, A = εbc).

const SRC_X = 210;
const TUBE_X0 = 290;
const TUBE_X1 = 1150;
const BY = 540; // sumbu berkas
const FIL_X = 1196;
const DET_X = 1262;
const ALPHA = 0.46; // pelemahan per satuan konsentrasi (skematis)
const PLOT = {x: 190, y: 870, w: 330, h: 170};

/** Glyph etanol kecil (2D) untuk molekul di dalam tabung. */
const MiniEthanol: React.FC<{x: number; y: number; a: number; op: number; hot: number}> = ({x, y, a, op, hot}) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const P = (u: number, v: number) => [x + u * c - v * s, y + u * s + v * c];
  const [ax, ay] = P(-11, 0);
  const [bx, by] = P(3, 4);
  const [ox, oy] = P(14, -5);
  return (
    <g opacity={op}>
      <circle cx={x} cy={y} r={22} fill="url(#soft-gold)" opacity={0.5 * hot} />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#9aa6c6" strokeWidth={3} />
      <line x1={bx} y1={by} x2={ox} y2={oy} stroke="#9aa6c6" strokeWidth={3} />
      {[
        [-18, -7],
        [-17, 8],
        [-6, -9],
        [4, 14],
        [9, 7],
      ].map(([u, v], k) => {
        const [hx, hy] = P(u, v);
        return <circle key={k} cx={hx} cy={hy} r={3.2} fill="#f2f5ff" opacity={0.9} />;
      })}
      <circle cx={ax} cy={ay} r={6} fill="#6b7590" />
      <circle cx={bx} cy={by} r={6} fill="#6b7590" />
      <circle cx={ox} cy={oy} r={6} fill="#ff4d63" />
    </g>
  );
};

export const Breath: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // tahap
  const build = (k: number) => ramp(t, cue(0) - 0.6 + k * 0.35, cue(0) + k * 0.35 + 0.2, BACK);
  const breathIn = ramp(t, wordOf(1, 'napas') - 0.3, wordOf(1, 'napas') + 0.8);
  const fire = ramp(t, wordOf(1, 'menembakkan') - 0.2, wordOf(1, 'cahaya') + 0.6);
  const lampOn = ramp(t, wordOf(1, 'menembakkan') - 0.3, wordOf(1, 'menembakkan') + 0.3);
  const molCard = ramp(t, cue(2) - 0.5, cue(2) + 0.5, BACK);
  const chHot = ramp(t, wordOf(2, 'menyerap') - 0.3, wordOf(2, 'menyerap') + 0.5);
  const filt = ramp(t, wordOf(2, 'tiga') - 0.3, wordOf(2, 'tiga') + 0.5);
  const lv2 = ramp(t, wordOf(2, 'etanol', 1) - 0.3, wordOf(2, 'etanol', 1) + 1.0, EASE_IN_OUT);
  const lv3 = ramp(t, wordOf(2, 'cahaya') - 0.3, wordOf(2, 'cahaya') + 1.0, EASE_IN_OUT);
  const conc = ramp(t, wordOf(1, 'sampel') - 0.2, wordOf(1, 'sampel') + 1.4, EASE_IN_OUT) + lv2 + lv3; // 0..3
  const fLB = slot(t, wordOf(3, 'Lambert') - 0.3, dur + 5);
  const lineDraw = ramp(t, wordOf(3, 'Lambert') - 0.2, wordOf(3, 'Lambert') + 1.4, EASE_IN_OUT);
  const out = 1 - ramp(t, dur - 0.9, dur - 0.1, EASE_IN_OUT);

  const trans = Math.exp(-ALPHA * conc); // fraksi cahaya yang sampai ke detektor
  const reading = 1 - trans;

  // berkas IR: amplitudo melemah eksponensial di dalam tabung
  const W = DET_X - SRC_X;
  const uIn = (TUBE_X0 - SRC_X) / W;
  const uOut = (TUBE_X1 - SRC_X) / W;
  const amp = (u: number) => {
    const front = Math.max(0, Math.min(1, (fire * 1.15 - u) * 14));
    const inside = Math.max(0, Math.min(1, (u - uIn) / (uOut - uIn)));
    return 20 * front * Math.exp(-ALPHA * conc * inside);
  };
  const beam = wavePath(SRC_X + 40, BY, DET_X - 6, BY, 44, t * 9, (u) => amp(mix(40 / W, 1, u)), 260);

  // etanol 3D di kartu kanan atas
  const yaw = 0.5 + t * 0.35;
  const mol = spinZ(ethanol(t * 14, 0.09 * chHot, chHot), yaw);
  const cam = camAt(1630, 292, 62, 0, -0.25, 9);

  // titik data A–c (tiga tingkat)
  const pX = (c: number) => PLOT.x + (c / 3.4) * PLOT.w;
  const pY = (a: number) => PLOT.y - (a / 3.4) * PLOT.h;
  const levelP = [conc, conc - 1, conc - 2].map((v) => Math.max(0, Math.min(1, v * 1.4 - 0.3)));

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <VbDefs />
        <SpDefs />
        <Glow x={700} y={BY} r={620} color="red" opacity={0.06 + 0.04 * fire} />

        {/* pipa napas masuk & keluar */}
        <g opacity={build(1)}>
          <path d={`M362,${BY - 60} L362,348 Q362,330 380,330 L430,330 L430,312 L470,312 L470,370 L430,370 L430,352 L398,352 L398,${BY - 60}`} fill="url(#sp-tube)" stroke="#6b7698" strokeWidth={3} />
          <path d={`M1030,${BY + 60} L1030,642 L1066,642 L1066,${BY + 60}`} fill="url(#sp-tube)" stroke="#6b7698" strokeWidth={3} />
          <Label x={520} y={341} size={26} anchor="start" color={C.muted}>
            napas masuk
          </Label>
          <Label x={1084} y={628} size={22} anchor="start" color={C.muted}>
            keluar
          </Label>
          {Array.from({length: 7}, (_, k) => {
            const ph = ((t * 0.55 + k / 7) % 1 + 1) % 1;
            const y = 330 + ph * (BY - 330);
            const x = ph < 0.18 ? 470 - (ph / 0.18) * 90 : 380;
            return <circle key={k} cx={x} cy={y} r={9 + 6 * ph} fill="#cfe6ff" opacity={0.35 * cyc(ph) * breathIn * (1 - 0.6 * lv3)} />;
          })}
        </g>

        {/* tabung sampel */}
        <g opacity={build(1)}>
          <rect x={TUBE_X0} y={BY - 60} width={TUBE_X1 - TUBE_X0} height={120} rx={20} fill="url(#sp-tube)" stroke="#6b7698" strokeWidth={3} />
          <rect x={TUBE_X0 - 8} y={BY - 52} width={10} height={104} rx={4} fill="#4fd6ff" opacity={0.3} />
          <rect x={TUBE_X1 - 2} y={BY - 52} width={10} height={104} rx={4} fill="#4fd6ff" opacity={0.3} />
          <Label x={(TUBE_X0 + TUBE_X1) / 2 + 60} y={BY + 88} size={24} color={C.muted}>
            tabung sampel napas
          </Label>
        </g>

        {/* molekul etanol dalam tabung */}
        {Array.from({length: 18}, (_, k) => {
          const ph = ((rand(k * 2.3) + t * (0.03 + 0.02 * rand(k * 4.1))) % 1 + 1) % 1;
          const x = TUBE_X0 + 30 + ph * (TUBE_X1 - TUBE_X0 - 60);
          const y = BY - 38 + rand(k * 6.7) * 76 + 6 * Math.sin(t * 1.3 + k);
          const op = Math.max(0, Math.min(1, conc * 6 - k)) * Math.min(1, cyc(ph) * 1.4);
          const hot = fire * Math.max(0, Math.sin(t * 3 + k * 1.7)) * filt;
          return op > 0.01 ? <MiniEthanol key={k} x={x} y={y} a={t * (0.6 + rand(k)) + k} op={op} hot={hot} /> : null;
        })}

        {/* sumber IR */}
        <g opacity={build(0)}>
          <rect x={SRC_X - 62} y={BY - 54} width={104} height={108} rx={16} fill="#141a34" stroke="#6b7698" strokeWidth={3} />
          <circle cx={SRC_X - 10} cy={BY} r={60} fill="url(#soft-red)" opacity={0.2 + 0.7 * lampOn} />
          <path
            d={`M${SRC_X - 34},${BY} q6,-16 12,0 t12,0 t12,0 t12,0`}
            fill="none"
            stroke={lampOn > 0.5 ? '#ffb070' : '#ffb070'}
            strokeWidth={4}
            opacity={0.35 + 0.65 * lampOn * (0.85 + 0.15 * Math.sin(t * 11))}
          />
          <Label x={SRC_X - 10} y={BY - 84} size={24} color={C.amber}>
            sumber IR
          </Label>
        </g>

        {/* berkas */}
        {fire > 0.01 ? (
          <g>
            <path d={beam} fill="none" stroke={IR_COL} strokeWidth={9} opacity={0.22} />
            <path d={beam} fill="none" stroke={IR_COL} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        ) : null}
        <g opacity={fire}>
          <text x={TUBE_X0 + 18} y={BY - 82} fontFamily={FONT.serif} fontStyle="italic" fontSize={34} fill={C.ink}>
            I
            <tspan baselineShift="sub" fontSize={22} fontStyle="normal">
              0
            </tspan>
          </text>
          <text x={TUBE_X1 - 36} y={BY - 82} fontFamily={FONT.serif} fontStyle="italic" fontSize={34} fill={C.ink} opacity={0.5 + 0.5 * trans}>
            I
          </text>
        </g>

        {/* filter */}
        <g opacity={build(2)}>
          <rect x={FIL_X - 8} y={BY - 58} width={16} height={116} rx={4} fill={C.amber} opacity={0.3 + 0.4 * filt} stroke={C.amber} strokeWidth={2} />
          <Label x={FIL_X} y={BY + 88} size={22} color={C.muted}>
            filter
          </Label>
        </g>
        <g opacity={filt}>
          <rect x={FIL_X - 96} y={BY - 128} width={192} height={44} rx={22} fill="rgba(40,20,8,0.9)" stroke={C.amber} strokeWidth={2} />
          <Label x={FIL_X} y={BY - 106} size={26} color={C.amber} weight={700}>
            ≈ 3,4 µm
          </Label>
        </g>

        {/* detektor */}
        <g opacity={build(3)}>
          <rect x={DET_X} y={BY - 44} width={66} height={88} rx={10} fill="#1d2546" stroke="#8c96bb" strokeWidth={3} />
          <rect x={DET_X + 8} y={BY - 30} width={14} height={60} rx={3} fill={C.amber} opacity={0.15 + 0.8 * fire * trans} />
          <circle cx={DET_X + 15} cy={BY} r={40} fill="url(#soft-red)" opacity={0.6 * fire * trans} />
          <Label x={DET_X + 33} y={BY + 88} size={22} color={C.muted}>
            detektor
          </Label>
          <path d={`M${DET_X + 66},${BY} L${1400},${BY} L${1400},${612} L${1470},${612}`} fill="none" stroke="#5a6690" strokeWidth={3} />
          {[0, 1, 2].map((k) => {
            const ph = ((t * 0.9 + k / 3) % 1 + 1) % 1;
            const d = ph * 280;
            const x = d < 72 ? DET_X + 66 + d : d < 144 ? 1400 : 1400 + (d - 144);
            const yy = d < 72 ? BY : d < 144 ? BY + (d - 72) : 612;
            return <circle key={k} cx={Math.min(x, 1470)} cy={yy} r={4} fill={C.gold} opacity={cyc(ph) * fire} />;
          })}
        </g>

        <Gauge x={1610} y={640} r={104} v={reading * fire} label="kadar alkohol" t={t} opacity={build(4)} />

        {/* kartu etanol 3D */}
        <g opacity={molCard}>
          <rect x={1310} y={182} width={520} height={226} rx={22} fill="rgba(12,16,36,0.82)" stroke={C.amber} strokeOpacity={0.3 + 0.5 * chHot} strokeWidth={2} />
          <Glow x={1630} y={292} r={150} color="gold" opacity={0.12 + 0.18 * chHot} />
          <Render3D items={molItems3(cam, mol, {labels: false})} />
          <Label x={1338} y={232} size={30} anchor="start" weight={700}>
            etanol
          </Label>
          <text x={1338} y={276} fontFamily={FONT.mono} fontSize={22} fill={C.muted}>
            CH
            <tspan baselineShift="sub" fontSize={15}>
              3
            </tspan>
            CH
            <tspan baselineShift="sub" fontSize={15}>
              2
            </tspan>
            OH
          </text>
          <g opacity={chHot}>
            <Label x={1338} y={334} size={28} anchor="start" color={C.amber} weight={700}>
              regangan C–H
            </Label>
            <Label x={1338} y={372} size={24} anchor="start" color={C.amber}>
              menyerap ≈ 3,4 µm
            </Label>
          </g>
        </g>

        {/* grafik serapan vs konsentrasi */}
        <g opacity={ramp(t, wordOf(2, 'Makin') - 0.4, wordOf(2, 'Makin') + 0.4)}>
          <rect x={PLOT.x - 70} y={PLOT.y - PLOT.h - 50} width={PLOT.w + 120} height={PLOT.h + 96} rx={18} fill="rgba(10,14,32,0.8)" stroke={C.faint} strokeWidth={1.5} />
          <line x1={PLOT.x} y1={PLOT.y} x2={PLOT.x + PLOT.w} y2={PLOT.y} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
          <line x1={PLOT.x} y1={PLOT.y} x2={PLOT.x} y2={PLOT.y - PLOT.h} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
          <text x={PLOT.x - 26} y={PLOT.y - PLOT.h + 10} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={30} fill={C.amber}>
            A
          </text>
          <text x={PLOT.x + PLOT.w + 18} y={PLOT.y + 8} textAnchor="start" fontFamily={FONT.serif} fontStyle="italic" fontSize={30} fill={C.ink}>
            c
          </text>
          <text x={PLOT.x + PLOT.w / 2} y={PLOT.y + 34} textAnchor="middle" fontFamily={FONT.sans} fontSize={22} fill={C.muted}>
            konsentrasi etanol
          </text>
          {lineDraw > 0 ? (
            <line x1={pX(0)} y1={pY(0)} x2={mix(pX(0), pX(3.3), lineDraw)} y2={mix(pY(0), pY(3.3), lineDraw)} stroke={C.gold} strokeWidth={3} strokeDasharray="10 7" />
          ) : null}
          {[1, 2, 3].map((c, k) => (
            <g key={c} opacity={levelP[k]}>
              <circle cx={pX(c)} cy={pY(c)} r={9} fill={C.amber} />
              <Ring x={pX(c)} y={pY(c)} p={levelP[k] < 1 ? levelP[k] : 0} r={34} color={C.amber} />
              <text x={pX(c)} y={PLOT.y + 2 - 14} textAnchor="middle" fontFamily={FONT.mono} fontSize={18} fill={C.muted}>
                {c}
              </text>
            </g>
          ))}
          <circle cx={pX(conc)} cy={pY(conc)} r={6 + 2 * Math.sin(t * 5)} fill={C.gold} opacity={conc > 0.05 ? 1 : 0} />
        </g>
      </Stage>
      <Formula
        x={1000}
        y={792}
        p={fLB}
        accent={C.amber}
        caption={
          <>
            <V>ε</V> daya serap molar · <V>b</V> panjang lintasan · <V>c</V> konsentrasi
          </>
        }
      >
        <V>A</V> = <V>ε</V>
        <V> b</V>
        <V> c</V>
      </Formula>
    </AbsoluteFill>
  );
};
