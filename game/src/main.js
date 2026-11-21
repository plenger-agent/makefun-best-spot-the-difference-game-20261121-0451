// Boot and the one loop for Spot the Difference: the canvas is a fixed
// 1280x720 stage scaled to fit the window; input is mouse clicks on either
// panel plus a keyboard cursor (arrows + Enter), H for a hint, P to pause,
// Space to start and advance. ?shot=cover|market|results stages a screenshot
// frame instead of running the loop, paints it twice and sets
// window.__shotReady.
import { CANVAS_H, CANVAS_W, PANEL_LEFT, PANEL_RIGHT, drawGame } from './render.js';
import { PANEL_H, PANEL_W } from './scenes.js';
import {
  SCREEN_LEVEL, SCREEN_PLAY, SCREEN_RESULTS, SCREEN_TITLE,
  clickAt, createGame, hintsLeft, nextLevel, startGame, tickTimer,
  useHint,
} from './game.js';
import {
  ensureAudio, isMuted, playFoundChime, playHintBlip, playLevelFanfare,
  playWrongBuzz, toggleMuted,
} from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

function fitCanvas() {
  const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
  canvas.style.width = `${Math.floor(CANVAS_W * scale)}px`;
  canvas.style.height = `${Math.floor(CANVAS_H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function announce(message) {
  status.textContent = message;
}

/** Convert a mouse event to stage coordinates (1280x720 space). */
function toStage(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

/** Which panel (if any) a stage point sits in, and its scene coordinates. */
function panelHit(point) {
  for (const [panel, origin] of [[0, PANEL_LEFT], [1, PANEL_RIGHT]]) {
    if (point.x >= origin.x && point.x < origin.x + PANEL_W && point.y >= origin.y && point.y < origin.y + PANEL_H) {
      return { panel, x: point.x - origin.x, y: point.y - origin.y };
    }
  }
  return null;
}

function runShot(name) {
  const game = stageShot(name);
  let painted = 0;
  function paint() {
    drawGame(ctx, game);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const game = createGame();
  let paused = false;
  let last = performance.now();

  function handleFound(result) {
    if (result === 'found') {
      playFoundChime();
      announce(`Found one! ${game.found[game.level].size} of 7.`);
      if (game.screen === SCREEN_LEVEL) playLevelFanfare();
      if (game.screen === SCREEN_RESULTS) announce(`All done. Score ${game.score}.`);
    } else if (result === 'wrong') {
      playWrongBuzz();
      announce('Not there. Five seconds lost.');
    }
  }

  function clickPoint(point) {
    const hit = panelHit(point);
    if (!hit) return;
    handleFound(clickAt(game, hit.x, hit.y));
  }

  canvas.addEventListener('click', (event) => {
    ensureAudio();
    if (game.screen === SCREEN_TITLE) {
      startGame(game);
      announce('Playing. Find 7 differences in the park.');
    } else if (game.screen === SCREEN_LEVEL) {
      nextLevel(game);
      announce('Next scene. Find 7 differences.');
    } else if (game.screen === SCREEN_RESULTS) {
      startGame(game);
      announce('Playing again.');
    } else if (!paused) {
      clickPoint(toStage(event));
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    const point = toStage(event);
    const hit = panelHit(point);
    if (hit) {
      game.cursor.visible = true;
      game.cursor.x = hit.x;
      game.cursor.y = hit.y;
      game.cursor.panel = hit.panel;
    } else {
      game.cursor.visible = false;
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === ' ') {
      event.preventDefault();
      ensureAudio();
      if (game.screen === SCREEN_TITLE) startGame(game);
      else if (game.screen === SCREEN_LEVEL) nextLevel(game);
      else if (game.screen === SCREEN_RESULTS) startGame(game);
      return;
    }
    if (game.screen !== SCREEN_PLAY) return;
    if (key === 'h' || key === 'H') {
      if (hintsLeft(game) > 0) {
        const picked = useHint(game);
        if (picked) {
          playHintBlip();
          announce('Hint: look inside the gold ring.');
        }
      } else {
        announce('No hints left on this level.');
      }
      return;
    }
    if (key === 'p' || key === 'P') {
      paused = !paused;
      announce(paused ? 'Paused.' : 'Playing.');
      return;
    }
    if (key === 'm' || key === 'M') {
      toggleMuted();
      announce(isMuted() ? 'Sound off.' : 'Sound on.');
      return;
    }
    if (key === 'Enter') {
      ensureAudio();
      handleFound(clickAt(game, game.cursor.x, game.cursor.y));
      return;
    }
    const step = event.shiftKey ? 40 : 12;
    if (key === 'ArrowLeft') { game.cursor.visible = true; game.cursor.x = Math.max(0, game.cursor.x - step); event.preventDefault(); }
    if (key === 'ArrowRight') { game.cursor.visible = true; game.cursor.x = Math.min(PANEL_W, game.cursor.x + step); event.preventDefault(); }
    if (key === 'ArrowUp') { game.cursor.visible = true; game.cursor.y = Math.max(0, game.cursor.y - step); event.preventDefault(); }
    if (key === 'ArrowDown') { game.cursor.visible = true; game.cursor.y = Math.min(PANEL_H, game.cursor.y + step); event.preventDefault(); }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.screen === SCREEN_PLAY) {
      paused = true;
      announce('Paused.');
    }
  });

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    if (!paused && game.screen === SCREEN_PLAY) {
      const timedOut = tickTimer(game, dt);
      if (timedOut) announce(`Time up. Score ${game.score}.`);
    }
    drawGame(ctx, game);
  }

  announce('Spot the Difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
