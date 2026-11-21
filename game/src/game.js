// Game state for Spot the Difference: screens, levels, clicks, timer, hints
// and score. Pure logic — no canvas calls here; render.js paints this state.
import { SCENES, totalDifferences } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL = 'level';
export const SCREEN_RESULTS = 'results';

export const WRONG_CLICK_PENALTY = 5;
export const FIND_POINTS = 100;
export const HINT_POINTS = 0;

/** A fresh game: three scenes in order, no differences found yet. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    level: 0,
    found: SCENES.map(() => new Set()),
    hinted: null,
    hintEndsAt: 0,
    timeLeft: SCENES[0].timeLimit,
    score: 0,
    wrongClicks: 0,
    totalFound: 0,
    levelBonus: 0,
    finishedAt: 0,
    cursor: { x: 300, y: 260, panel: 0, visible: false },
    flash: null,
    startedAt: 0,
  };
}

/** The scene currently being hunted. */
export function currentScene(game) {
  return SCENES[game.level];
}

/** Differences of the current scene that are still unfound. */
export function remainingDiffs(game) {
  const scene = currentScene(game);
  return scene.diffs.filter((d) => !game.found[game.level].has(d.id));
}

/** Start (or restart) the current level: fresh timer and hints. */
export function startLevel(game) {
  game.screen = SCREEN_PLAY;
  game.timeLeft = currentScene(game).timeLimit;
  game.hinted = null;
  game.hintEndsAt = 0;
  game.flash = null;
  game.startedAt = performance.now();
}

/** Start the whole game from the title screen. */
export function startGame(game) {
  game.level = 0;
  game.found = SCENES.map(() => new Set());
  game.score = 0;
  game.wrongClicks = 0;
  game.totalFound = 0;
  game.levelBonus = 0;
  startLevel(game);
}

/** Advance the clock by dt seconds; returns true when the level timed out. */
export function tickTimer(game, dt) {
  if (game.screen !== SCREEN_PLAY) return false;
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.hinted && performance.now() > game.hintEndsAt) game.hinted = null;
  if (game.timeLeft <= 0) {
    finishLevel(game, false);
    return true;
  }
  return false;
}

/**
 * Handle a click at scene coordinates (x, y) inside either panel.
 * Returns 'found' | 'wrong' | 'none' (none: not playing or already found).
 */
export function clickAt(game, x, y) {
  if (game.screen !== SCREEN_PLAY) return 'none';
  const scene = currentScene(game);
  for (const diff of scene.diffs) {
    if (game.found[game.level].has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      game.found[game.level].add(diff.id);
      game.totalFound += 1;
      game.score += FIND_POINTS;
      game.flash = { kind: 'found', x: diff.x, y: diff.y, at: performance.now() };
      if (game.found[game.level].size === scene.diffs.length) {
        game.levelBonus = Math.round(game.timeLeft) * 2;
        game.score += game.levelBonus;
        finishLevel(game, true);
      }
      return 'found';
    }
  }
  game.wrongClicks += 1;
  game.timeLeft = Math.max(0, game.timeLeft - WRONG_CLICK_PENALTY);
  game.flash = { kind: 'wrong', x, y, at: performance.now() };
  if (game.timeLeft <= 0) finishLevel(game, false);
  return 'wrong';
}

/** Use one hint: briefly highlight a random unfound difference. */
export function useHint(game) {
  if (game.screen !== SCREEN_PLAY) return null;
  const remaining = remainingDiffs(game);
  if (remaining.length === 0) return null;
  const scene = currentScene(game);
  const used = scene.diffs.length - remaining.length;
  const hintsLeft = scene.hints - usedHints(game);
  if (hintsLeft <= 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  if (!game._hintsUsed) game._hintsUsed = SCENES.map(() => 0);
  game._hintsUsed[game.level] += 1;
  game.hinted = pick;
  game.hintEndsAt = performance.now() + 3000;
  return pick;
}

/** Hints already spent on the current level (one per use, tracked by count). */
export function usedHints(game) {
  return game._hintsUsed?.[game.level] ?? 0;
}

/** Hints left on the current level. */
export function hintsLeft(game) {
  return Math.max(0, currentScene(game).hints - usedHints(game));
}

function finishLevel(game, cleared) {
  game.finishedAt = performance.now();
  if (cleared && game.level < SCENES.length - 1) {
    game.screen = SCREEN_LEVEL;
  } else {
    game.screen = SCREEN_RESULTS;
  }
}

/** Move to the next scene after a cleared level. */
export function nextLevel(game) {
  if (game.screen !== SCREEN_LEVEL) return;
  game.level += 1;
  startLevel(game);
}

/** Seconds left, whole, never negative. */
export function secondsLeft(game) {
  return Math.ceil(game.timeLeft);
}

/** "FOUND n / 7" text for the HUD. */
export function foundLabel(game) {
  return `FOUND ${game.found[game.level].size} / ${currentScene(game).diffs.length}`;
}

/** Final tally for the results screen. */
export function finalTally(game) {
  return {
    found: game.totalFound,
    total: totalDifferences(),
    score: game.score,
    wrongClicks: game.wrongClicks,
    clearedAll: game.totalFound === totalDifferences(),
  };
}
