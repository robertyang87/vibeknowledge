// Which builder draws which shot. Keys are the "shot" names in the beat sheet (main.js).
import { makePatagonia, makeJungle, makeDisguise, makeRiver, makeCell } from './scenes.js';
import * as S2 from './scenes2.js';
export const SCENE_MAKERS = {
  patagonia: makePatagonia, disguise: makeDisguise, river: makeRiver, jungle: makeJungle, cell: makeCell,
  shelby: S2.makeShelby, alaska: S2.makeAlaska, bering: S2.makeBering, kolyma: S2.makeKolyma, protest: S2.makeProtest, aldan: S2.makeAldan,
  camels: S2.makeCamels, turkmen: S2.makeTurkmen, storm: S2.makeStorm, caspian: S2.makeCaspian, channel: S2.makeChannel, humber: S2.makeHumber, home: S2.makeHome,
};
