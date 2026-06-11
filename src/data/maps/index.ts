export type { TrainerMon, NpcRole, MapNpc, MapTheme, GameMap } from './types';
export {
  isWalkable,
  isEncounterTile,
  isWarpTile,
  getTile,
  resolveTrainerParty,
} from './helpers';

import type { GameMap } from './types';
import { town } from './town';
import { heal_center } from './heal_center';
import { mart } from './mart';
import { lab } from './lab';
import { route1 } from './route1';
import { forest } from './forest';
import { route2 } from './route2';
import { mossgrove } from './mossgrove';
import { gym1 } from './gym1';
import { crystal_cave } from './crystal_cave';
import { route3 } from './route3';
import { ember_city } from './ember_city';
import { gym2 } from './gym2';
import { volcanic_path } from './volcanic_path';
import { route4 } from './route4';
import { glacier_pass } from './glacier_pass';
import { frostvale } from './frostvale';
import { gym3 } from './gym3';
import { route5 } from './route5';
import { mindspire } from './mindspire';
import { gym4 } from './gym4';
import { victory_road } from './victory_road';
import { fishing_pier } from './fishing_pier';
import { secret_grove } from './secret_grove';
import { contest_hall } from './contest_hall';

export { town, heal_center, mart, lab, route1, forest, route2, mossgrove, gym1, crystal_cave, route3, ember_city, gym2, volcanic_path, route4, glacier_pass, frostvale, gym3, route5, mindspire, gym4, victory_road, fishing_pier, secret_grove, contest_hall };

export const MAPS: Record<string, GameMap> = {
  town,
  heal_center,
  mart,
  lab,
  route1,
  forest,
  route2,
  mossgrove,
  gym1,
  crystal_cave,
  route3,
  ember_city,
  gym2,
  volcanic_path,
  route4,
  glacier_pass,
  frostvale,
  gym3,
  route5,
  mindspire,
  gym4,
  victory_road,
  fishing_pier,
  secret_grove,
  contest_hall,
};

export function getMap(id: string): GameMap {
  return MAPS[id] ?? MAPS.town;
}
