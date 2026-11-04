import type React from 'react';
import {Boltzmann} from './Boltzmann';
import {Breath} from './Breath';
import {Electronic} from './Electronic';
import {Exoplanet} from './Exoplanet';
import {Hook} from './Hook';
import {Ladders} from './Ladders';
import {Outro} from './Outro';
import {Radio} from './Radio';
import {Raman} from './Raman';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {Rotation} from './Rotation';
import {Rovib} from './Rovib';
import {Ruler} from './Ruler';
import {Selection} from './Selection';
import {Title} from './Title';
import {Translation} from './Translation';

// Pemetaan id scene di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  ladders: Ladders,
  ruler: Ruler,
  boltzmann: Boltzmann,
  selection: Selection,
  rotation: Rotation,
  rovib: Rovib,
  raman: Raman,
  electronic: Electronic,
  translation: Translation,
  breath: Breath,
  radio: Radio,
  exoplanet: Exoplanet,
  recap: Recap,
  outro: Outro,
};
