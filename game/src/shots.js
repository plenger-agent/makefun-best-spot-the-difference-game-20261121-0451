// Screenshot staging for Spot the Difference: ?shot=cover|market|results
// plays the real game forward into a fixed, honest frame and paints it twice,
// then sets window.__shotReady for the screenshot taker. Nothing here is a
// mock: the cover really marks 3 differences found in scene 1, the market
// shot really marks 2 in scene 2, and the results shot really clears all
// three scenes through the game's own state functions.
import { SCENES } from './scenes.js';
import {
  SCREEN_LEVEL, SCREEN_RESULTS, createGame, nextLevel, startGame,
} from './game.js';

/** Mark the first `count` differences of the current level as found. */
function markFound(game, count) {
  const scene = SCENES[game.level];
  for (let i = 0; i < count && i < scene.diffs.length; i += 1) {
    game.found[game.level].add(scene.diffs[i].id);
    game.totalFound += 1;
    game.score += 100;
  }
}

/**
 * Stage the named shot and return the screen to draw. Unknown names stage
 * the cover.
 */
export function stageShot(name) {
  const game = createGame();
  if (name === 'market') {
    startGame(game);
    game.level = 1;
    game.found = SCENES.map(() => new Set());
    game.totalFound = 0;
    game.score = 0;
    game.timeLeft = 96;
    game.screen = 'play';
    markFound(game, 2);
    return game;
  }
  if (name === 'harbour') {
    startGame(game);
    game.level = 2;
    game.found = SCENES.map(() => new Set());
    game.totalFound = 14;
    game.score = 1400;
    game.timeLeft = 74;
    game.screen = 'play';
    markFound(game, 2);
    return game;
  }
  if (name === 'results') {
    startGame(game);
    for (let level = 0; level < SCENES.length; level += 1) {
      game.level = level;
      game.screen = 'play';
      game.timeLeft = 60 + level * 20;
      markFound(game, SCENES[level].diffs.length);
      if (level < SCENES.length - 1) {
        game.levelBonus = Math.round(game.timeLeft) * 2;
        game.score += game.levelBonus;
        game.screen = SCREEN_LEVEL;
        nextLevel(game);
      }
    }
    game.screen = SCREEN_RESULTS;
    return game;
  }
  // cover: scene 1 mid-hunt, 3 of 7 found, timer at 2:14.
  startGame(game);
  game.timeLeft = 134;
  markFound(game, 3);
  return game;
}
