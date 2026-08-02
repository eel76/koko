const KEY = 'koko-run.highscore';

export function getHighscore(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

// Returns true if the score is a new personal best.
export function submitScore(score: number): boolean {
  if (score <= getHighscore()) {
    return false;
  }
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    // localStorage unavailable (e.g. private mode) — highscore just isn't persisted
  }
  return true;
}
