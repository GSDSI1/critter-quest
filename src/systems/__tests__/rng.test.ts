import { describe, it, expect } from 'vitest';
import { createSeededRng } from '../rng';

describe('SeededRng', () => {
  it('is deterministic', () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    const seqA = [a.next(), a.next(), a.int(1, 10)];
    const seqB = [b.next(), b.next(), b.int(1, 10)];
    expect(seqA).toEqual(seqB);
  });

  it('pick returns array element', () => {
    const rng = createSeededRng(7);
    expect(['a', 'b', 'c']).toContain(rng.pick(['a', 'b', 'c']));
  });
});
