const ROUND_NAMES_MAP = {
  64: ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship'],
  32: ['Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship'],
  16: ['Sweet 16', 'Elite 8', 'Final Four', 'Championship'],
  8: ['Elite 8', 'Final Four', 'Championship'],
  4: ['Final Four', 'Championship'],
  2: ['Championship'],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function nextPow2(n) {
  let p = 2;
  while (p < n) p *= 2;
  return Math.min(p, 64);
}

export function buildRounds(teams, { shuffleTeams = true } = {}) {
  const size = nextPow2(teams.length);
  const currentTeams = teams.slice(0, size);
  while (currentTeams.length < size) currentTeams.push(`BYE ${currentTeams.length + 1}`);

  const seeded = shuffleTeams ? shuffle(currentTeams) : [...currentTeams];
  const roundNames = ROUND_NAMES_MAP[size] || [];
  const numRounds = Math.log2(size);

  const rounds = [];
  const r0 = [];
  for (let i = 0; i < size; i += 2) {
    r0.push({
      top: seeded[i],
      bottom: seeded[i + 1],
      winner: null,
      topSeed: i + 1,
      bottomSeed: i + 2,
    });
  }
  rounds.push(r0);

  let prevCount = size / 2;
  for (let r = 1; r < numRounds; r++) {
    const rnd = [];
    for (let m = 0; m < prevCount / 2; m++) {
      rnd.push({ top: null, bottom: null, winner: null });
    }
    rounds.push(rnd);
    prevCount /= 2;
  }

  return { currentTeams, rounds, roundNames };
}

export function pickWinnerSilent(rounds, roundIdx, matchIdx, pos) {
  const matchup = rounds[roundIdx][matchIdx];
  const chosen = pos === 'top' ? matchup.top : matchup.bottom;
  if (!chosen) return null;

  matchup.winner = chosen;
  if (roundIdx < rounds.length - 1) {
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const nextPos = matchIdx % 2 === 0 ? 'top' : 'bottom';
    rounds[roundIdx + 1][nextMatchIdx][nextPos] = chosen;
  }
  return chosen;
}

export function autoAdvanceByes(rounds) {
  rounds[0].forEach((m, mi) => {
    const topIsBye = m.top && m.top.startsWith('BYE');
    const botIsBye = m.bottom && m.bottom.startsWith('BYE');
    if (topIsBye && !botIsBye) {
      pickWinnerSilent(rounds, 0, mi, 'bottom');
    } else if (!topIsBye && botIsBye) {
      pickWinnerSilent(rounds, 0, mi, 'top');
    } else if (topIsBye && botIsBye) {
      pickWinnerSilent(rounds, 0, mi, 'top');
    }
  });
}

export function clearFromRound(rounds, roundIdx, matchIdx) {
  const matchup = rounds[roundIdx][matchIdx];
  const oldWinner = matchup.winner;
  matchup.winner = null;

  if (roundIdx < rounds.length - 1) {
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const nextPos = matchIdx % 2 === 0 ? 'top' : 'bottom';
    if (rounds[roundIdx + 1][nextMatchIdx][nextPos] === oldWinner) {
      clearFromRound(rounds, roundIdx + 1, nextMatchIdx);
      rounds[roundIdx + 1][nextMatchIdx][nextPos] = null;
    }
  }
}

export function applyPick(rounds, roundIdx, matchIdx, pos) {
  const matchup = rounds[roundIdx][matchIdx];
  const chosen = pos === 'top' ? matchup.top : matchup.bottom;
  if (!chosen) return { changed: false, chosen: null };

  if (matchup.winner === chosen) {
    clearFromRound(rounds, roundIdx, matchIdx);
    return { changed: true, cleared: true, chosen };
  }

  if (matchup.winner) clearFromRound(rounds, roundIdx, matchIdx);
  matchup.winner = chosen;

  if (roundIdx < rounds.length - 1) {
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const nextPos = matchIdx % 2 === 0 ? 'top' : 'bottom';
    rounds[roundIdx + 1][nextMatchIdx][nextPos] = chosen;
  }

  return { changed: true, cleared: false, chosen, isFinal: roundIdx === rounds.length - 1 };
}

export function resetPicks(rounds) {
  if (!rounds.length) return;
  for (let r = rounds.length - 1; r >= 0; r--) {
    rounds[r].forEach(m => {
      m.winner = null;
      if (r > 0) {
        m.top = null;
        m.bottom = null;
      }
    });
  }
  autoAdvanceByes(rounds);
}
