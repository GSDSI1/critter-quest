import { addItem } from '../../data/items';
import { GameState } from '../../systems/stats';

/** Apply chest loot and return dialog lines. */
export function applyChestReward(chestId: string): string[] {
  const table: Record<string, () => string[]> = {
    chest_town: () => {
      GameState.player.money += 100;
      addItem(GameState.player.items, 'potion', 1);
      return ['You found $100 and a Potion!'];
    },
    chest_route1: () => {
      GameState.player.money += 150;
      addItem(GameState.player.items, 'oran_berry', 2);
      return ['You found $150 and 2 Oran Berries!'];
    },
    chest_moss: () => {
      addItem(GameState.player.items, 'great_orb', 1);
      return ['You found a Great Orb!'];
    },
    chest_cave: () => {
      GameState.player.money += 300;
      addItem(GameState.player.items, 'super_potion', 2);
      return ['You found $300 and 2 Super Potions!'];
    },
    grove_chest: () => {
      GameState.player.money += 500;
      if (!GameState.player.storyFlags.contest_winner) {
        addItem(GameState.player.items, 'hyper_potion', 2);
        return ['You found $500 and 2 Hyper Potions!'];
      }
      addItem(GameState.player.items, 'ultra_orb', 1);
      return ['You found $500 and an Ultra Orb!'];
    },
    chest_route4: () => {
      GameState.player.money += 200;
      addItem(GameState.player.items, 'great_orb', 1);
      return ['You found $200 and a Great Orb!'];
    },
    chest_glacier: () => {
      GameState.player.money += 150;
      addItem(GameState.player.items, 'hyper_potion', 1);
      addItem(GameState.player.items, 'oran_berry', 2);
      return ['You found $150, a Hyper Potion, and 2 Oran Berries!'];
    },
    chest_contest: () => {
      GameState.player.money += 250;
      addItem(GameState.player.items, 'oran_berry', 3);
      return ['You found $250 and 3 Oran Berries behind the stage!'];
    },
  };
  const fn = table[chestId] ?? (() => {
    GameState.player.money += 200;
    addItem(GameState.player.items, 'potion', 2);
    return ['You found $200 and 2 Potions!'];
  });
  return fn();
}
