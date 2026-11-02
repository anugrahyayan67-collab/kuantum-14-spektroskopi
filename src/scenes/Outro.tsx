import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, rand, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {Render3D, VbDefs} from '../components/vbC';
import {co2, co2Mode, molItems3, vibrate} from '../components/syD';
import {LineStrip, camAt, coMol, spinY} from '../components/spD';
import {wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const REFS = [
  'RPS Kimia Kuantum S1 Kimia UNESA — pertemuan 14: spektroskopi molekul (translasi, rotasi, vibrasi)',
  'P. Atkins & J. de Paula, Physical Chemistry — spektroskopi rotasi, vibrasi, Raman, elektronik',
  'C. N. Banwell & E. M. McCash, Fundamentals of Molecular Spectroscopy',
  'NIST: CO B ≈ 1,93 cm⁻¹ (r ≈ 113 pm); HCl pusat pita ≈ 2886 cm⁻¹; kT (298 K) ≈ 207 cm⁻¹',
  'C. V. Raman — Nobel Fisika 1930 (efek Raman, 1928) · nobelprize.org',
  'CO J = 1→0 ≈ 115,27 GHz (astronomi radio) · > 200 molekul antarbintang (CDMS)',
  'JWST ERS Transiting Exoplanet Team, Nature 614, 649 (2023) — CO₂ di WASP-39b (≈ 4,3 µm)',
  'Alat uji napas inframerah: serapan C–H etanol ≈ 3,4 µm (hukum Lambert–Beer)',
];

export const Outro: React.FC = () => {
  const {t, dur} = useScene();
  const a = ramp(t, 0, 1.6);
  const waves = ramp(t, 0, 4, EASE_IN_OUT);
  const refs = ramp(t, 2.4, 3.4);
  const out = 1 - ramp(t, dur - 1.6, dur - 0.1, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Glow x={960} y={300} r={500} color="violet" opacity={0.15} />
        <VbDefs />
        {/* hiasan spektroskopi: CO berputar, CO₂ bergetar, garis spektrum rotasi & cabang P/R */}
        <g opacity={waves}>
          <Glow x={200} y={950} r={170} color="cyan" opacity={0.14} />
          <Glow x={1720} y={950} r={170} color="gold" opacity={0.12} />
          <Render3D items={molItems3(camAt(200, 946, 52, 0.25, -0.15, 9), spinY(coMol(), t * 1.3), {labels: false})} />
          <Render3D items={molItems3(camAt(1720, 946, 44, 0.35 + 0.2 * Math.sin(t * 0.4), -0.25, 9), vibrate(co2(), co2Mode('asym'), 0.13, t * 7), {labels: false})} />
          <LineStrip x={360} y={904} w={560} h={84} t={t} color={C.cyan} n={20} />
          <LineStrip x={1000} y={904} w={560} h={84} t={t + 1} color={C.amber} n={20} gap />
          {Array.from({length: 12}, (_, k) => {
            const ph = ((t * (0.03 + 0.015 * rand(k)) + rand(k * 3.1)) % 1 + 1) % 1;
            const x = 120 + rand(k * 5.1) * 1680;
            const y = 860 - ph * 760;
            const nm = 420 + rand(k * 7.3) * 260;
            return <rect key={k} x={x} y={y} width={4} height={34} rx={2} fill={wlColor(nm)} opacity={0.22 * cyc(ph)} />;
          })}
        </g>
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 150}}>
        <div style={{fontFamily: FONT.sans, fontSize: 30, letterSpacing: 18, color: C.ink, fontWeight: 300, opacity: a}}>KIMIA KUANTUM · SPEKTROSKOPI MOLEKUL</div>
        <div style={{fontFamily: FONT.sans, fontSize: 100, fontWeight: 800, color: C.gold, lineHeight: 1.05, opacity: a, textShadow: '0 0 50px rgba(255,194,74,0.4)'}}>SATU MOLEKUL, TIGA TARIAN</div>
        <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 34, color: C.ink, opacity: ramp(t, 1.2, 2.2)}}>Terima kasih telah menonton</div>
        <div style={{marginTop: 46, textAlign: 'center', opacity: refs}}>
          <div style={{fontFamily: FONT.mono, fontSize: 20, letterSpacing: 4, color: C.muted, marginBottom: 14}}>RUJUKAN</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 56, rowGap: 6, width: 1720, textAlign: 'left'}}>
            {REFS.map((r, i) => (
              <div key={r} style={{fontFamily: FONT.sans, fontSize: 22, color: C.muted, lineHeight: 1.4, opacity: ramp(t, 2.4 + i * 0.08, 3.2 + i * 0.08)}}>
                {r}
              </div>
            ))}
          </div>
          <div style={{marginTop: 20, fontFamily: FONT.sans, fontSize: 22, color: C.muted, opacity: 0.8}}>
            Angka dari buku teks & NIST · spektrum & tingkat energi skematis kecuali angka yang disebut · nilai ukur ditandai “≈”
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
