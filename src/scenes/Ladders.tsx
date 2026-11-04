import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {Render3D, VbDefs, rotZ, type Cam} from '../components/vbC';
import {molItems3, place} from '../components/syD';
import {coMol, wavePath} from '../components/spA';
import {wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Empat tangga energi berdampingan (jarak antartingkat kualitatif tetapi jujur urutannya):
// translasi hampir kontinu · rotasi rapat (∝ J(J+1)) · vibrasi renggang · elektronik sangat renggang.
// Di atas tiap tangga, molekul CO mini melakukan geraknya.

const XS = [330, 750, 1170, 1590];
const BOT = 800;
const HGT = 400;
const HALF = 92;
const DEMO_Y = 245;
const COL = [C.muted, C.cyan, C.amber, C.violet];
const NAME = ['Translasi', 'Rotasi', 'Vibrasi', 'Elektronik'];
const ENERGY = ['hampir kontinu', '~0,001 eV', '~0,1 eV', 'beberapa eV'];
const REGION = ['(kotak besar)', 'gelombang mikro', 'inframerah', 'tampak / UV'];

/** Tinggi (px dari dasar) tingkat-tingkat tiap tangga. */
const transLv = (n: number) => Array.from({length: n}, (_, k) => (HGT * ((k + 8) ** 2 - 64)) / ((n + 8) ** 2 - 64));
const ROT = Array.from({length: 13}, (_, J) => (HGT * J * (J + 1)) / 156);
const VIB = [0, 1, 2, 3, 4].map((v) => 98 * v * (1 - 0.045 * v));
const ELEC = [0, 330];

const tri = (x: number) => (2 / Math.PI) * Math.asin(Math.sin(x));

export const Ladders: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const appear = XS.map((_, i) => ramp(t, cue(0) + 0.4 + i * 0.35, cue(0) + 1.4 + i * 0.35));
  const on = XS.map((_, i) => ramp(t, cue(i + 1) - 0.2, cue(i + 1) + 0.6));
  const focus = XS.map((_, i) => on[i] * (1 - (i < 3 ? on[i + 1] : 0)));
  const quant = ramp(t, wordOf(0, 'terkuantisasi') - 0.3, wordOf(0, 'terkuantisasi') + 0.6);
  const kWords = [wordOf(1, 'kontinu'), wordOf(2, 'seperseribu'), wordOf(3, 'sepersepuluh'), wordOf(4, 'beberapa')];
  const rWords = [wordOf(1, 'kotak'), wordOf(2, 'gelombang'), wordOf(3, 'inframerah'), wordOf(4, 'tampak')];
  const eLab = kWords.map((w) => ramp(t, w - 0.3, w + 0.5));
  const rLab = rWords.map((w) => ramp(t, w - 0.3, w + 0.5));
  const big = ramp(t, wordOf(1, 'besar') - 0.4, wordOf(1, 'besar') + 0.8, EASE_IN_OUT);
  const axis = ramp(t, cue(0) + 0.2, cue(0) + 1.2);

  const levelsOf = (i: number): {y: number; w?: number; col?: string; op?: number}[][] => {
    if (i === 0) return [transLv(34).map((y) => ({y})), transLv(90).map((y) => ({y}))];
    if (i === 1) return [ROT.map((y) => ({y}))];
    if (i === 2) {
      const out: {y: number; w?: number; col?: string; op?: number}[] = [];
      VIB.forEach((y, v) => {
        out.push({y});
        if (v < 4) [1, 2, 3, 4].forEach((J) => out.push({y: y + J * (J + 1) * 1.5, w: 0.55, col: C.cyan, op: 0.45}));
      });
      return [out];
    }
    const out: {y: number; w?: number; col?: string; op?: number}[] = [];
    ELEC.forEach((y) => {
      out.push({y});
      [1, 2, 3].forEach((v) => out.push({y: y + v * 18 * (1 - 0.08 * v), w: 0.6, col: C.amber, op: 0.5}));
    });
    return [out];
  };

  return (
    <AbsoluteFill>
      <Stage>
        <VbDefs />
        {/* sumbu energi */}
        <g opacity={axis}>
          <line x1={140} y1={BOT + 10} x2={140} y2={BOT - HGT - 30} stroke={C.muted} strokeWidth={3} markerEnd="url(#arrow-muted)" />
          <Label x={140} y={BOT - HGT - 64} size={30} color={C.muted} font="serif" italic>
            E
          </Label>
          <Label x={1840} y={140} size={20} color={C.muted} font="mono" anchor="end" opacity={ramp(t, cue(0) + 1.5, cue(0) + 2.5)}>
            jarak antartingkat · kualitatif
          </Label>
        </g>
        {XS.map((cx, i) => {
          const op = appear[i] * (0.4 + 0.6 * Math.max(on[i], 0.25 * quant));
          const sets = levelsOf(i);
          const mol = (() => {
            if (i === 0) {
              const bw = mix(100, 128, big);
              const c: Cam = {cx: cx + bw * tri(t * 1.6), cy: DEMO_Y + 34 * tri(t * 1.1 + 0.7), s: 34, yaw: 0, pitch: -0.3};
              return molItems3(c, place(coMol(), (v) => rotZ(v, 0.5)), {labels: false});
            }
            if (i === 1) {
              const c: Cam = {cx, cy: DEMO_Y, s: 52, yaw: 0, pitch: -0.4};
              return molItems3(c, place(coMol(), (v) => rotZ(v, t * 2.6)), {labels: false});
            }
            if (i === 2) {
              const c: Cam = {cx, cy: DEMO_Y, s: 60, yaw: 0.25, pitch: -0.3};
              return molItems3(c, coMol(0.2 * Math.sin(t * 11)), {labels: false});
            }
            const c: Cam = {cx, cy: DEMO_Y, s: 46, yaw: 0.25, pitch: -0.3};
            return molItems3(c, coMol(), {labels: false, opacity: 0.85});
          })();
          // elektron melompat (kolom elektronik)
          const ePh = (Math.max(0, t) / 3) % 1;
          const eUp = ramp(ePh, 0.15, 0.35, EASE_IN_OUT) * (1 - ramp(ePh, 0.7, 0.9, EASE_IN_OUT));
          const eR = mix(48, 104, eUp);
          const eA = t * 2.4;
          return (
            <g key={i} opacity={op}>
              <Glow x={cx} y={BOT - HGT / 2} r={260} color={i === 1 ? 'cyan' : i === 2 ? 'gold' : i === 3 ? 'violet' : 'white'} opacity={0.22 * focus[i]} />
              {/* kotak demo */}
              <rect
                x={cx - 160}
                y={DEMO_Y - 78}
                width={320}
                height={156}
                rx={18}
                fill="rgba(12,18,40,0.6)"
                stroke={COL[i]}
                strokeOpacity={0.25 + 0.55 * focus[i]}
                strokeWidth={2}
              />
              {i === 0 ? (
                <rect
                  x={cx - mix(120, 150, big)}
                  y={DEMO_Y - 66}
                  width={2 * mix(120, 150, big)}
                  height={132}
                  rx={6}
                  fill="none"
                  stroke={C.muted}
                  strokeWidth={3 + 3 * cyc(ramp(t, rWords[0] - 0.2, rWords[0] + 1.2))}
                  strokeDasharray="10 6"
                  opacity={0.7}
                />
              ) : null}
              {i === 1 ? <ellipse cx={cx} cy={DEMO_Y + 4} rx={92} ry={30} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="12 9" strokeDashoffset={-t * 50} opacity={0.6} /> : null}
              {i === 3 ? (
                <g>
                  <ellipse cx={cx} cy={DEMO_Y} rx={48} ry={26} fill="none" stroke={C.violet} strokeWidth={2} opacity={0.6} />
                  <ellipse cx={cx} cy={DEMO_Y} rx={104} ry={56} fill="none" stroke={C.violet} strokeWidth={2} strokeDasharray="6 6" opacity={0.6} />
                </g>
              ) : null}
              <Render3D items={mol} />
              {i === 3 ? (
                <g>
                  <circle cx={cx + eR * Math.cos(eA)} cy={DEMO_Y + eR * 0.54 * Math.sin(eA)} r={16} fill="url(#soft-violet)" />
                  <circle cx={cx + eR * Math.cos(eA)} cy={DEMO_Y + eR * 0.54 * Math.sin(eA)} r={7} fill="#e6ddff" />
                </g>
              ) : null}

              <Label x={cx} y={358} size={38} weight={700} color={COL[i]}>
                {NAME[i]}
              </Label>

              {/* tangga */}
              {sets.map((set, si) => {
                const sop = i === 0 ? (si === 0 ? 1 - big : big) : 1;
                if (sop <= 0.003) return null;
                return (
                  <g key={si} opacity={sop}>
                    {set.map((lv, k) => {
                      const d = ramp(t, cue(0) + 0.5 + i * 0.35 + (lv.y / HGT) * 1.2, cue(0) + 1.0 + i * 0.35 + (lv.y / HGT) * 1.2);
                      const hw = HALF * (lv.w ?? 1);
                      const y = BOT - lv.y;
                      return (
                        <line
                          key={k}
                          x1={cx - hw * d}
                          y1={y}
                          x2={cx + hw * d}
                          y2={y}
                          stroke={lv.col ?? COL[i]}
                          strokeWidth={i === 0 ? 1.4 : lv.w ? 1.6 : 3.2}
                          opacity={(lv.op ?? 1) * (i === 0 ? 0.75 : 0.95)}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* foton masuk & celah ΔE */}
              {i > 0
                ? (() => {
                    const g0 = i === 1 ? ROT[3] : i === 2 ? VIB[0] : ELEC[0];
                    const g1 = i === 1 ? ROT[4] : i === 2 ? VIB[1] : ELEC[1];
                    const ym = BOT - (g0 + g1) / 2;
                    const lam = i === 1 ? 70 : i === 2 ? 30 : 12;
                    const col = i === 1 ? '#3f9fc4' : i === 2 ? '#c0392b' : wlColor(420);
                    const wp = rLab[i];
                    return (
                      <g opacity={wp}>
                        <path d={wavePath(cx - 200, cx - HALF - 12, ym, () => lam, i === 3 ? 10 : 12, t * 7)} fill="none" stroke={col} strokeWidth={3} />
                        <line x1={cx + HALF + 22} y1={BOT - g0} x2={cx + HALF + 22} y2={BOT - g1} stroke={C.gold} strokeWidth={2.5} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
                        <Label x={cx + HALF + 46} y={ym} size={22} color={C.gold} font="serif" italic anchor="start">
                          ΔE
                        </Label>
                      </g>
                    );
                  })()
                : null}

              <Label x={cx} y={842} size={26} weight={600} color={C.gold} font="mono" opacity={eLab[i]}>
                {ENERGY[i]}
              </Label>
              <Label x={cx} y={876} size={22} color={COL[i]} opacity={rLab[i]}>
                {REGION[i]}
              </Label>
            </g>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};
