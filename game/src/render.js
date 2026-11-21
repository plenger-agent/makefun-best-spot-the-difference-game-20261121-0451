// Renderer for Spot the Difference: paints the HUD, the two panels, found
// markers, hints, flashes and every screen onto one 1280x720 canvas.
import { PANEL_H, PANEL_W } from './scenes.js';
import { drawScene } from './draw-scene.js';
import {
  SCREEN_LEVEL, SCREEN_PLAY, SCREEN_RESULTS, SCREEN_TITLE,
  currentScene, finalTally, foundLabel, hintsLeft, secondsLeft,
} from './game.js';

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const PANEL_LEFT = { x: 20, y: 112 };
export const PANEL_RIGHT = { x: 660, y: 112 };

const INK = '#222831';
const PAPER = '#fdf6e3';
const GREEN = '#2fae5f';
const RED = '#e74c3c';
const GOLD = '#f5b301';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draw one panel: the scene plus a frame and a caption. */
function drawPanel(ctx, game, scene, variant, origin) {
  ctx.save();
  ctx.translate(origin.x, origin.y);
  drawScene(ctx, scene, variant);
  ctx.restore();
  ctx.strokeStyle = '#3a2b22';
  ctx.lineWidth = 4;
  ctx.strokeRect(origin.x, origin.y, PANEL_W, PANEL_H);
  ctx.fillStyle = 'rgba(34,40,49,0.85)';
  ctx.fillRect(origin.x, origin.y + PANEL_H - 26, PANEL_W, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(variant === 0 ? 'LEFT  —  original' : 'RIGHT  —  find the changes', origin.x + 10, origin.y + PANEL_H - 13);
}

/** A green ring + checkmark over a found difference, on both panels. */
function drawFoundMarker(ctx, diff, origin, now) {
  const age = (now - (diff._foundAt ?? now)) / 1000;
  const pop = age < 0.25 ? 0.6 + (age / 0.25) * 0.4 : 1;
  const r = diff.r * 0.85 * pop;
  const cx = origin.x + diff.x;
  const cy = origin.y + diff.y;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.globalAlpha = 0.25;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.45, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.4);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.4);
  ctx.stroke();
  ctx.fillStyle = GREEN;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓', cx, cy - r - 8);
}

/** The pulsing hint ring over one unfound difference, on both panels. */
function drawHintRing(ctx, diff, origin, now) {
  const pulse = 1 + 0.12 * Math.sin(now / 130);
  const r = diff.r * pulse;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HINT', origin.x + diff.x, origin.y + diff.y - r - 8);
}

function drawHud(ctx, game) {
  const scene = currentScene(game);
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(0, 0, CANVAS_W, 104);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPOT THE DIFFERENCE', 20, 34);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#a8d8ea';
  ctx.fillText(`${scene.name}  •  Level ${game.level + 1} of 3  •  ${scene.tagline}`, 20, 66);
  // Found counter — the big number the cover shot must show.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 560, 14, 260, 76, 12);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DIFFERENCES', 690, 32);
  ctx.font = 'bold 34px sans-serif';
  ctx.fillStyle = game.found[game.level].size === scene.diffs.length ? GREEN : INK;
  ctx.fillText(foundLabel(game), 690, 66);
  // Timer bar.
  const total = scene.timeLimit;
  const frac = Math.max(0, game.timeLeft / total);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 850, 22, 220, 22, 11);
  ctx.fill();
  ctx.fillStyle = frac > 0.33 ? '#7ee0a3' : RED;
  if (frac > 0) {
    roundRect(ctx, 850, 22, 220 * frac, 22, 11);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`TIME ${Math.floor(secondsLeft(game) / 60)}:${String(secondsLeft(game) % 60).padStart(2, '0')}`, 850, 66);
  // Score and hints.
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`★ ${game.score}`, 1252, 34);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = hintsLeft(game) > 0 ? GOLD : '#8a8a8a';
  ctx.fillText(`HINTS ${hintsLeft(game)}  (press H)`, 1252, 66);
  ctx.textAlign = 'left';
}

function drawBottomBar(ctx, game) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 644, CANVAS_W, 76);
  ctx.fillStyle = INK;
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Click a difference in EITHER picture  •  Wrong click costs 5 seconds  •  H hint  •  P pause  •  ← → ↑ ↓ move cursor, Enter marks', 20, 668);
  // Level dots.
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < game.level ? GREEN : i === game.level ? GOLD : '#c9c9c9';
    ctx.beginPath();
    ctx.arc(1180 + i * 28, 668, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), 1180 + i * 28, 669);
  }
  ctx.textAlign = 'left';
  const flash = game.flash;
  if (flash && performance.now() - flash.at < 1200) {
    ctx.fillStyle = flash.kind === 'found' ? GREEN : RED;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(flash.kind === 'found' ? 'Found it! +100' : 'Not there — minus 5 seconds!', 20, 700);
  }
}

function drawWrongFlash(ctx, game, origin) {
  const flash = game.flash;
  if (!flash || flash.kind !== 'wrong') return;
  const age = performance.now() - flash.at;
  if (age > 500) return;
  const cx = origin.x + flash.x;
  const cy = origin.y + flash.y;
  ctx.strokeStyle = RED;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 14);
  ctx.lineTo(cx + 14, cy + 14);
  ctx.moveTo(cx + 14, cy - 14);
  ctx.lineTo(cx - 14, cy + 14);
  ctx.stroke();
}

function drawPlay(ctx, game, now) {
  const scene = currentScene(game);
  drawHud(ctx, game);
  drawPanel(ctx, game, scene, 0, PANEL_LEFT);
  drawPanel(ctx, game, scene, 1, PANEL_RIGHT);
  const found = game.found[game.level];
  for (const diff of scene.diffs) {
    if (!found.has(diff.id)) continue;
    const marked = { ...diff, _foundAt: now };
    drawFoundMarker(ctx, marked, PANEL_LEFT, now);
    drawFoundMarker(ctx, marked, PANEL_RIGHT, now);
  }
  if (game.hinted) {
    drawHintRing(ctx, game.hinted, PANEL_LEFT, now);
    drawHintRing(ctx, game.hinted, PANEL_RIGHT, now);
  }
  drawWrongFlash(ctx, game, PANEL_LEFT);
  drawWrongFlash(ctx, game, PANEL_RIGHT);
  if (game.cursor.visible) {
    for (const origin of [PANEL_LEFT, PANEL_RIGHT]) {
      const cx = origin.x + game.cursor.x;
      const cy = origin.y + game.cursor.y;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy);
      ctx.lineTo(cx + 18, cy);
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx, cy + 18);
      ctx.stroke();
    }
  }
  drawBottomBar(ctx, game);
}

function drawTitle(ctx, game) {
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('SPOT THE DIFFERENCE', CANVAS_W / 2, 150);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#a8d8ea';
  ctx.fillText('Three hand-drawn scenes. Seven differences hiding in each.', CANVAS_W / 2, 205);
  ctx.fillText('Find them all before the clock runs out.', CANVAS_W / 2, 240);
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, CANVAS_W / 2 - 130, 300, 260, 64, 12);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('▶  CLICK OR PRESS SPACE', CANVAS_W / 2, 333);
  ctx.fillStyle = '#a8d8ea';
  ctx.font = '18px sans-serif';
  ctx.fillText('1  Sunny Park Picnic      2  Night Market Stall      3  Harbour at Dawn', CANVAS_W / 2, 420);
  ctx.fillText('Click a difference in either picture  •  H for a hint  •  Wrong clicks cost 5 seconds', CANVAS_W / 2, 460);
  ctx.fillText('21 differences in total — how many can you spot?', CANVAS_W / 2, 500);
  ctx.textAlign = 'left';
}

function drawLevelComplete(ctx, game) {
  drawPlay(ctx, game, performance.now());
  ctx.fillStyle = 'rgba(29,53,87,0.88)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText('LEVEL CLEAR!', CANVAS_W / 2, 250);
  ctx.font = '26px sans-serif';
  ctx.fillText(`You found all 7 differences in ${currentScene(game).name}.`, CANVAS_W / 2, 310);
  ctx.fillText(`Time bonus +${game.levelBonus}  •  Score ${game.score}`, CANVAS_W / 2, 350);
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Press SPACE for the next scene', CANVAS_W / 2, 430);
  ctx.textAlign = 'left';
}

function drawResults(ctx, game) {
  const tally = finalTally(game);
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(tally.clearedAll ? 'YOU FOUND THEM ALL!' : "TIME'S UP!", CANVAS_W / 2, 140);
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#a8d8ea';
  ctx.fillText(tally.clearedAll
    ? 'Every last difference, spotted. Sharp eyes!'
    : 'The clock beat you this time — the hunt goes on.', CANVAS_W / 2, 190);
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, CANVAS_W / 2 - 260, 240, 520, 190, 16);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`FOUND  ${tally.found} / ${tally.total}`, CANVAS_W / 2, 290);
  ctx.font = '24px sans-serif';
  ctx.fillText(`SCORE  ${tally.score}`, CANVAS_W / 2, 335);
  ctx.fillText(`Wrong clicks  ${tally.wrongClicks}`, CANVAS_W / 2, 375);
  ctx.fillStyle = '#ffd93b';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Press SPACE to play again', CANVAS_W / 2, 490);
  ctx.fillStyle = '#a8d8ea';
  ctx.font = '18px sans-serif';
  ctx.fillText('Sunny Park Picnic  •  Night Market Stall  •  Harbour at Dawn', CANVAS_W / 2, 540);
  ctx.textAlign = 'left';
}

/** Paint the whole game for the current screen. */
export function drawGame(ctx, game) {
  const now = performance.now();
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (game.screen === SCREEN_TITLE) drawTitle(ctx, game);
  else if (game.screen === SCREEN_PLAY) drawPlay(ctx, game, now);
  else if (game.screen === SCREEN_LEVEL) drawLevelComplete(ctx, game);
  else if (game.screen === SCREEN_RESULTS) drawResults(ctx, game);
}
