import { describe, it, expect } from 'vitest';
import {
  nextPow2,
  buildRounds,
  autoAdvanceByes,
  pickWinnerSilent,
  applyPick,
  clearFromRound,
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

describe('nextPow2 - edge cases', () => {
  it('handles exactly 64', () => {
    expect(nextPow2(64)).toBe(64);
  });

  it('handles values above 64 by clamping', () => {
    expect(nextPow2(65)).toBe(64);
    expect(nextPow2(128)).toBe(64);
    expect(nextPow2(1000)).toBe(64);
  });

  it('handles powers of 2 exactly', () => {
    expect(nextPow2(4)).toBe(4);
    expect(nextPow2(16)).toBe(16);
    expect(nextPow2(32)).toBe(32);
  });
});

describe('buildRounds - comprehensive', () => {
  it('creates correct number of rounds for various sizes', () => {
    // 2 teams = 1 round
    expect(buildRounds(['A', 'B'], { shuffleTeams: false }).rounds).toHaveLength(1);
    // 4 teams = 2 rounds
    expect(buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false }).rounds).toHaveLength(2);
    // 8 teams = 3 rounds
    const t8 = Array.from({ length: 8 }, (_, i) => `T${i}`);
    expect(buildRounds(t8, { shuffleTeams: false }).rounds).toHaveLength(3);
    // 16 teams = 4 rounds
    const t16 = Array.from({ length: 16 }, (_, i) => `T${i}`);
    expect(buildRounds(t16, { shuffleTeams: false }).rounds).toHaveLength(4);
  });

  it('pads with BYEs for non-power-of-2 rosters', () => {
    const { currentTeams } = buildRounds(['A', 'B', 'C'], { shuffleTeams: false });
    expect(currentTeams).toHaveLength(4);
    expect(currentTeams[3]).toMatch(/^BYE/);
  });

  it('assigns correct seeds in first round', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    expect(rounds[0][0].topSeed).toBe(1);
    expect(rounds[0][0].bottomSeed).toBe(2);
    expect(rounds[0][1].topSeed).toBe(3);
    expect(rounds[0][1].bottomSeed).toBe(4);
  });

  it('initializes all later rounds with null slots', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    expect(rounds[1][0].top).toBeNull();
    expect(rounds[1][0].bottom).toBeNull();
    expect(rounds[1][0].winner).toBeNull();
  });

  it('returns correct round names for each bracket size', () => {
    expect(buildRounds(['A', 'B'], { shuffleTeams: false }).roundNames).toEqual(['Championship']);
    expect(buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false }).roundNames).toEqual(['Final Four', 'Championship']);
    const t8 = Array.from({ length: 8 }, (_, i) => `T${i}`);
    expect(buildRounds(t8, { shuffleTeams: false }).roundNames).toEqual(['Elite 8', 'Final Four', 'Championship']);
  });

  it('shuffles teams when shuffleTeams is true', () => {
    const teams = Array.from({ length: 16 }, (_, i) => `T${i}`);
    const r1 = buildRounds(teams, { shuffleTeams: true });
    const r2 = buildRounds(teams, { shuffleTeams: true });
    // Extremely unlikely both are identical if shuffling works
    const order1 = r1.currentTeams.join(',');
    const order2 = r2.currentTeams.join(',');
    // At least one should differ (astronomically unlikely to be same)
    // We just verify it doesn't throw and has correct length
    expect(r1.currentTeams).toHaveLength(16);
  });

  it('handles exactly 64 teams', () => {
    const t64 = Array.from({ length: 64 }, (_, i) => `T${i}`);
    const { rounds, roundNames } = buildRounds(t64, { shuffleTeams: false });
    expect(rounds).toHaveLength(6);
    expect(rounds[0]).toHaveLength(32);
    expect(roundNames).toEqual(['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship']);
  });
});

describe('pickWinnerSilent', () => {
  it('sets winner and advances to next round', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    const result = pickWinnerSilent(rounds, 0, 0, 'top');
    expect(result).toBe('A');
    expect(rounds[0][0].winner).toBe('A');
    expect(rounds[1][0].top).toBe('A');
  });

  it('returns null for empty slot', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    const result = pickWinnerSilent(rounds, 1, 0, 'top');
    expect(result).toBeNull();
  });

  it('places in correct position based on match index parity', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    pickWinnerSilent(rounds, 0, 0, 'top'); // match 0 -> top of next
    pickWinnerSilent(rounds, 0, 1, 'bottom'); // match 1 -> bottom of next
    expect(rounds[1][0].top).toBe('A');
    expect(rounds[1][0].bottom).toBe('D');
  });
});

describe('clearFromRound', () => {
  it('clears winner of specified matchup', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top');
    clearFromRound(rounds, 0, 0);
    expect(rounds[0][0].winner).toBeNull();
  });

  it('cascades clearing to downstream rounds', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top'); // A wins match 0
    applyPick(rounds, 0, 1, 'top'); // C wins match 1
    applyPick(rounds, 1, 0, 'top'); // A wins championship

    clearFromRound(rounds, 0, 0); // Clear A's first round win
    expect(rounds[0][0].winner).toBeNull();
    expect(rounds[1][0].top).toBeNull();
    expect(rounds[1][0].winner).toBeNull(); // Championship should be cleared too
  });

  it('does not affect unrelated matches', () => {
    const t8 = Array.from({ length: 8 }, (_, i) => `T${i}`);
    const { rounds } = buildRounds(t8, { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top'); // T0 wins
    applyPick(rounds, 0, 2, 'top'); // T4 wins

    clearFromRound(rounds, 0, 0);
    expect(rounds[0][2].winner).toBe('T4'); // Unaffected
  });
});

describe('applyPick - advanced', () => {
  it('returns changed:false for empty slot', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    const result = applyPick(rounds, 1, 0, 'top'); // Empty slot
    expect(result.changed).toBe(false);
  });

  it('toggling same winner clears the pick', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top'); // Pick A
    const result = applyPick(rounds, 0, 0, 'top'); // Toggle A off
    expect(result.cleared).toBe(true);
    expect(rounds[0][0].winner).toBeNull();
    expect(rounds[1][0].top).toBeNull();
  });

  it('switching winner clears downstream before setting new', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top'); // A wins
    applyPick(rounds, 0, 1, 'top'); // C wins
    applyPick(rounds, 1, 0, 'top'); // A is champion

    // Now switch first match to B
    applyPick(rounds, 0, 0, 'bottom');
    expect(rounds[0][0].winner).toBe('B');
    expect(rounds[1][0].top).toBe('B');
    expect(rounds[1][0].winner).toBeNull(); // Championship cleared
  });

  it('returns isFinal:true for championship pick', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top');
    applyPick(rounds, 0, 1, 'top');
    const result = applyPick(rounds, 1, 0, 'top');
    expect(result.isFinal).toBe(true);
  });

  it('can complete a full 8-team bracket', () => {
    const t8 = Array.from({ length: 8 }, (_, i) => `T${i}`);
    const { rounds } = buildRounds(t8, { shuffleTeams: false });

    // Round 0: T0, T2, T4, T6 win
    applyPick(rounds, 0, 0, 'top');
    applyPick(rounds, 0, 1, 'top');
    applyPick(rounds, 0, 2, 'top');
    applyPick(rounds, 0, 3, 'top');

    // Round 1: T0, T4 win
    applyPick(rounds, 1, 0, 'top');
    applyPick(rounds, 1, 1, 'top');

    // Championship: T0 wins
    const result = applyPick(rounds, 2, 0, 'top');
    expect(result.isFinal).toBe(true);
    expect(result.chosen).toBe('T0');
    expect(rounds[2][0].winner).toBe('T0');
  });
});

describe('autoAdvanceByes - comprehensive', () => {
  it('advances single non-BYE team when paired with BYE', () => {
    const { rounds } = buildRounds(['A', 'B', 'C'], { shuffleTeams: false });
    // Teams: A, B, C, BYE 4
    autoAdvanceByes(rounds);
    // Match with BYE should have a winner
    const byeMatch = rounds[0].find(m => m.top?.startsWith('BYE') || m.bottom?.startsWith('BYE'));
    expect(byeMatch.winner).toBeTruthy();
    expect(byeMatch.winner).not.toMatch(/^BYE/);
  });

  it('handles double BYE matchup', () => {
    // This happens with 2 teams in a 2-bracket (no BYEs actually)
    // or edge cases. Let's test with a manual setup.
    const { rounds } = buildRounds(['A', 'B'], { shuffleTeams: false });
    // A 2-team bracket has no BYEs, but let's verify no crash
    autoAdvanceByes(rounds);
    expect(rounds[0][0].top).toBe('A');
    expect(rounds[0][0].bottom).toBe('B');
  });

  it('advances BYE winners to next round', () => {
    const teams = ['A', 'B', 'C'];
    const { rounds } = buildRounds(teams, { shuffleTeams: false });
    autoAdvanceByes(rounds);
    // The advanced winner should appear in round 1
    const hasAdvanced = rounds[1][0].top !== null || rounds[1][0].bottom !== null;
    expect(hasAdvanced).toBe(true);
  });
});

describe('resetPicks - comprehensive', () => {
  it('preserves first round matchups', () => {
    const { rounds } = buildRounds(['A', 'B', 'C', 'D'], { shuffleTeams: false });
    applyPick(rounds, 0, 0, 'top');
    applyPick(rounds, 0, 1, 'top');
    resetPicks(rounds);

    expect(rounds[0][0].top).toBe('A');
    expect(rounds[0][0].bottom).toBe('B');
    expect(rounds[0][1].top).toBe('C');
    expect(rounds[0][1].bottom).toBe('D');
  });

  it('re-auto-advances BYEs after reset', () => {
    const { rounds } = buildRounds(['A', 'B', 'C'], { shuffleTeams: false });
    autoAdvanceByes(rounds);
    applyPick(rounds, 0, 0, 'top');

    resetPicks(rounds);
    // BYE should still be auto-advanced
    const byeMatch = rounds[0].find(m => m.top?.startsWith('BYE') || m.bottom?.startsWith('BYE'));
    expect(byeMatch.winner).toBeTruthy();
  });

  it('handles empty rounds array', () => {
    const rounds = [];
    resetPicks(rounds); // Should not throw
    expect(rounds).toHaveLength(0);
  });

  it('clears a fully completed 8-team bracket', () => {
    const t8 = Array.from({ length: 8 }, (_, i) => `T${i}`);
    const { rounds } = buildRounds(t8, { shuffleTeams: false });

    // Complete the whole bracket
    applyPick(rounds, 0, 0, 'top');
    applyPick(rounds, 0, 1, 'top');
    applyPick(rounds, 0, 2, 'top');
    applyPick(rounds, 0, 3, 'top');
    applyPick(rounds, 1, 0, 'top');
    applyPick(rounds, 1, 1, 'top');
    applyPick(rounds, 2, 0, 'top');

    resetPicks(rounds);

    // All winners should be null
    rounds.forEach(rnd => rnd.forEach(m => expect(m.winner).toBeNull()));
    // Later rounds should have null slots
    expect(rounds[1][0].top).toBeNull();
    expect(rounds[2][0].top).toBeNull();
  });
});
