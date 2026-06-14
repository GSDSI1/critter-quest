import { describe, it, expect } from 'vitest';
import { buildBattleEntryData } from '../battleEntry';

describe('buildBattleEntryData', () => {
  it('builds wild battle data with defaults', () => {
    const data = buildBattleEntryData([], 'route1');
    expect(data.isTrainer).toBe(false);
    expect(data.trainerId).toBe('');
    expect(data.mapId).toBe('route1');
  });

  it('builds trainer battle data', () => {
    const data = buildBattleEntryData([], 'gym1', {
      isTrainer: true,
      trainerId: 'gym1_leader',
      trainerName: 'Rex',
      reward: 500,
      badge: 'stone',
    });
    expect(data.isTrainer).toBe(true);
    expect(data.trainerName).toBe('Rex');
    expect(data.reward).toBe(500);
    expect(data.badge).toBe('stone');
  });
});
