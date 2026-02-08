import { describe, it, expect } from 'vitest';
import {
  nextPow2,
  buildRounds,
  autoAdvanceByes,
  applyPick,
  resetPicks,
} from '../src/bracket-logic.js';

describe('bracket-logic', () => {
  it('nextPow2 clamps to nearest power of 2 up to 64', () => {
    expect(nextPow2(1)).toBe(2);
    expect(nextPow2(2)).toBe(2);
    expect(nextPow2(3)).toBe(4);
    expect(nextPow2(8)).toBe(8);
    expect(nextPow2(63)).toBe(64);
    expect(nextPow2(100)).toBe(64);
  });

  it('buildRounds creates correct structure without shuffle', () => {
    const teams = ['A', 'B', 'C', 'D'];
    const { rounds, roundNames, currentTeams } = buildRounds(teams, { shuffleTeams: false });

    expect(currentTeams).toEqual(['A', 'B', 'C', 'D']);
    expect(roundNames).toEqual(['Final Four', 'Championship']);
    expect(rounds).toHaveLength(2);
    expect(rounds[0]).toHaveLength(2);
    expect(rounds[0][0].top).toBe('A');
    expect(rounds[0][0].bottom).toBe('B');
    expect(rounds[0][1].top).toBe('C');
    expect(rounds[0][1].bottom).toBe('D');
  });

  it('autoAdvanceByes advances non-BYE teams', () => {
    const teams = ['A', 'B', 'C'];
    const { rounds } = buildRounds(teams, { shuffleTeams: false });
    autoAdvanceByes(rounds);

    const match0 = rounds[0][0];
    const match1 = rounds[0][1];
    expect([match0.winner, match1.winner].filter(Boolean).length).toBeGreaterThanOrEqual(1);
    expect(rounds[1][0].top || rounds[1][0].bottom).toBeTruthy();
  });

  it('applyPick switches winners and clears downstream picks', () => {
    const teams = ['A', 'B', 'C', 'D'];
    const { rounds } = buildRounds(teams, { shuffleTeams: false });

    // Pick A over B (match 0)
    applyPick(rounds, 0, 0, 'top');
    expect(rounds[0][0].winner).toBe('A');
    expect(rounds[1][0].top).toBe('A');

    // Switch to B over A
    applyPick(rounds, 0, 0, 'bottom');
    expect(rounds[0][0].winner).toBe('B');
    expect(rounds[1][0].top).toBe('B');
  });

  it('resetPicks clears winners and downstream slots', () => {
    const teams = ['A', 'B', 'C', 'D'];
    const { rounds } = buildRounds(teams, { shuffleTeams: false });

    applyPick(rounds, 0, 0, 'top');
    applyPick(rounds, 0, 1, 'top');
    applyPick(rounds, 1, 0, 'top');

    resetPicks(rounds);
    expect(rounds[0][0].winner).toBeNull();
    expect(rounds[0][1].winner).toBeNull();
    expect(rounds[1][0].top).toBeNull();
    expect(rounds[1][0].bottom).toBeNull();
  });
});
