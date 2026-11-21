// Procedural art for Spot the Difference: every pixel of every scene is drawn
// by this file's own canvas code — no images, no fonts, no network. Each scene
// painter takes (ctx, variant): variant 0 paints the left panel, variant 1
// paints the right panel with that scene's 7 differences switched on. A
// difference is always a small, deliberate change hidden inside busy detail.
import { PANEL_H, PANEL_W } from './scenes.js';

// ---------- tiny drawing helpers ----------

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function cloud(ctx, x, y, scale) {
  ctx.fillStyle = '#ffffff';
  circle(ctx, x, y, 26 * scale, '#ffffff');
  circle(ctx, x + 24 * scale, y + 4 * scale, 20 * scale, '#ffffff');
  circle(ctx, x - 24 * scale, y + 6 * scale, 18 * scale, '#ffffff');
  ellipse(ctx, x, y + 10 * scale, 42 * scale, 14 * scale, '#ffffff');
}

function bird(ctx, x, y, scale, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 10 * scale, y);
  ctx.quadraticCurveTo(x - 4 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 4 * scale, y - 8 * scale, x + 10 * scale, y);
  ctx.stroke();
}

function flower(ctx, x, y, petal, centre) {
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, petal);
  }
  circle(ctx, x, y, 5, centre);
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------- scene 1: Sunny Park Picnic ----------

function drawPark(ctx, variant) {
  const diff = variant === 1;
  // Sky, sun, clouds.
  rect(ctx, 0, 0, PANEL_W, 330, '#8ed0f5');
  circle(ctx, 92, 78, 34, '#ffd93b');
  ctx.strokeStyle = '#f5b301';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 92 + Math.cos(a) * 42, 78 + Math.sin(a) * 42, 92 + Math.cos(a) * 54, 78 + Math.sin(a) * 54, '#f5b301', 4);
  }
  if (diff) {
    // The sun wears sunglasses on the right.
    rect(ctx, 66, 68, 52, 14, '#222831');
    line(ctx, 92, 82, 92, 92, '#222831', 3);
  }
  cloud(ctx, 180, 60, 1);
  cloud(ctx, 470, 48, 0.8);
  if (diff) cloud(ctx, 300, 58, 0.7);
  bird(ctx, 220, 110, 1, '#33507a');
  bird(ctx, 260, 92, 0.8, '#33507a');
  // Hills and grass.
  ellipse(ctx, 120, 560, 420, 240, '#7ec850');
  ellipse(ctx, 520, 580, 420, 260, '#6db844');
  rect(ctx, 0, 330, PANEL_W, 190, '#7ec850');
  // Old oak tree.
  rect(ctx, 60, 210, 26, 130, '#7a4a21');
  circle(ctx, 74, 190, 62, '#3f8f3a');
  circle(ctx, 30, 220, 42, '#4da344');
  circle(ctx, 118, 218, 44, '#4da344');
  circle(ctx, 74, 158, 40, '#57b04e');
  // Kite in the sky.
  poly(ctx, [[438, 92], [468, 118], [438, 146], [408, 118]], '#e74c3c');
  line(ctx, 438, 146, 452, 196, '#5b4a68', 2);
  circle(ctx, 443, 162, 5, diff ? '#2e86de' : '#e74c3c');
  circle(ctx, 447, 180, 5, diff ? '#2e86de' : '#e74c3c');
  circle(ctx, 451, 198, 5, diff ? '#2e86de' : '#e74c3c');
  // Picnic blanket and basket.
  poly(ctx, [[220, 400], [400, 400], [420, 480], [200, 480]], '#e85d75');
  for (let i = 0; i < 4; i += 1) {
    rect(ctx, 220 + i * 50, 400, 25, 80, '#f7f3e8');
    rect(ctx, 220, 400 + i * 20, 200, 10, 'rgba(247,243,232,0.55)');
  }
  rect(ctx, 282, 392, 56, 44, '#a5672f');
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(310, 392, 20, Math.PI, 0);
  ctx.stroke();
  // Apples in the basket: five on the left, four on the right.
  const apples = [[292, 388], [306, 382], [322, 388], [300, 396], [316, 396]];
  const shown = diff ? apples.slice(0, 4) : apples;
  for (const [ax, ay] of shown) circle(ctx, ax, ay, 8, '#d7263d');
  // Sandwich plate and lemonade.
  ellipse(ctx, 250, 452, 22, 8, '#ffffff');
  poly(ctx, [[240, 448], [260, 448], [250, 436]], '#f2c14e');
  rect(ctx, 368, 420, 16, 34, '#ffd93b');
  line(ctx, 376, 420, 386, 404, '#e74c3c', 3);
  // Dog dozing by the blanket.
  ellipse(ctx, 148, 448, 46, 24, '#f5e6c8');
  circle(ctx, 112, 436, 18, '#f5e6c8');
  poly(ctx, [[100, 424], [108, 406], [116, 424]], '#f5e6c8');
  if (diff) poly(ctx, [[100, 424], [96, 440], [112, 428]], '#c98f4e');
  else poly(ctx, [[100, 424], [108, 406], [116, 424]], '#c98f4e');
  circle(ctx, 104, 434, 3, '#222831');
  ellipse(ctx, 168, 452, 18, 8, '#c98f4e');
  circle(ctx, 188, 452, 6, '#c98f4e');
  // Flowers and grass tufts.
  flower(ctx, 60, 490, '#ffffff', '#ffd93b');
  flower(ctx, 540, 500, '#ff8fb3', '#ffd93b');
  flower(ctx, 460, 492, '#ffffff', '#ffd93b');
  if (diff) flower(ctx, 522, 468, '#ffffff', '#ffd93b');
  flower(ctx, 90, 500, '#c9a7eb', '#ffd93b');
  for (const gx of [30, 200, 380, 560, 580]) {
    line(ctx, gx, 500, gx - 4, 486, '#3f8f3a', 3);
    line(ctx, gx, 500, gx + 4, 486, '#3f8f3a', 3);
  }
  // Butterfly: only on the right panel.
  if (diff) {
    ellipse(ctx, 476, 248, 9, 6, '#ff8fb3');
    ellipse(ctx, 490, 248, 9, 6, '#ff8fb3');
    ellipse(ctx, 476, 258, 8, 5, '#e85d75');
    ellipse(ctx, 490, 258, 8, 5, '#e85d75');
    line(ctx, 483, 246, 483, 258, '#222831', 2);
  }
  // Ants marching to the blanket.
  circle(ctx, 430, 500, 3, '#222831');
  circle(ctx, 446, 502, 3, '#222831');
  circle(ctx, 462, 500, 3, '#222831');
}

// ---------- scene 2: Night Market Stall ----------

function drawMarket(ctx, variant) {
  const diff = variant === 1;
  // Night sky, moon, stars.
  rect(ctx, 0, 0, PANEL_W, PANEL_H, '#1b2340');
  circle(ctx, 522, 72, 30, '#f7f3d8');
  if (diff) circle(ctx, 534, 66, 26, '#1b2340');
  star(ctx, 80, 60, 8, '#ffe98a');
  star(ctx, 180, 40, 6, '#ffffff');
  star(ctx, 360, 70, 7, '#ffffff');
  star(ctx, 440, 36, 5, '#ffe98a');
  if (diff) star(ctx, 252, 52, 8, '#ffe98a');
  bird(ctx, 300, 120, 0.9, '#0f1428');
  bird(ctx, 340, 100, 0.7, '#0f1428');
  // Rooftops behind the stall.
  poly(ctx, [[0, 300], [120, 210], [240, 300]], '#2a3358');
  poly(ctx, [[380, 300], [500, 200], [600, 300]], '#2a3358');
  rect(ctx, 0, 300, PANEL_W, 220, '#3a2b22');
  // String lights.
  ctx.strokeStyle = '#0f1428';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(300, 150, 600, 96);
  ctx.stroke();
  const bulbColours = ['#ffd93b', '#ff8fb3', '#7ee0a3', '#ffd93b', '#ff8fb3', '#7ee0a3'];
  for (let i = 0; i < 6; i += 1) {
    const bx = 50 + i * 100;
    const by = 96 + Math.sin((bx / 600) * Math.PI) * 34 + 10;
    line(ctx, bx, by - 6, bx, by + 2, '#0f1428', 2);
    circle(ctx, bx, by + 8, 7, bulbColours[i]);
  }
  // Stall awning.
  for (let i = 0; i < 6; i += 1) {
    const stripe = i === 2 && diff ? '#2e86de' : i % 2 === 0 ? '#e74c3c' : '#f7f3e8';
    rect(ctx, 140 + i * 55, 130, 55, 44, stripe);
  }
  rect(ctx, 140, 174, 330, 8, '#7a4a21');
  // Lanterns hanging from the awning.
  const lantern = (x, y, colour) => {
    ellipse(ctx, x, y, 18, 24, colour);
    rect(ctx, x - 8, y - 28, 16, 6, '#f5b301');
    rect(ctx, x - 8, y + 22, 16, 6, '#f5b301');
    line(ctx, x, y - 28, x, y - 34, '#f5b301', 2);
  };
  lantern(118, 122, diff ? '#2e86de' : '#e74c3c');
  lantern(240, 122, '#ffd93b');
  lantern(352, 122, '#e74c3c');
  lantern(470, 122, '#ffd93b');
  // Stall counter and crates.
  rect(ctx, 150, 330, 300, 120, '#8a5a2b');
  rect(ctx, 150, 330, 300, 12, '#a5672f');
  rect(ctx, 160, 380, 90, 70, '#c98f4e');
  rect(ctx, 270, 380, 90, 70, '#c98f4e');
  rect(ctx, 380, 380, 90, 70, '#c98f4e');
  // Oranges in the crates: one missing on the right.
  const oranges = [[180, 372], [205, 368], [230, 372], [290, 372], [315, 368], [340, 372], [400, 372], [422, 418], [448, 372]];
  const orangeSpots = diff ? oranges.filter(([ox]) => ox !== 422) : oranges;
  for (const [ox, oy] of orangeSpots) circle(ctx, ox, oy, 11, '#ff8c1a');
  circle(ctx, 205, 368, 3, '#3f8f3a');
  // Price sign pinned to the front of the counter, clear of the vendor.
  rect(ctx, 278, 352, 44, 40, '#f7f3e8');
  ctx.fillStyle = '#222831';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(diff ? '5' : '3', 300, 373);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('COINS', 300, 388);
  // Vendor behind the counter.
  circle(ctx, 300, 250, 26, '#f5c99b');
  poly(ctx, [[268, 330], [300, 292], [332, 330]], '#2e86de');
  rect(ctx, 276, 236, 48, 8, '#222831');
  circle(ctx, 290, 250, 3, '#222831');
  circle(ctx, 310, 250, 3, '#222831');
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(300, 258, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Sleepy cat on the crate.
  ellipse(ctx, 92, 462, 34, 16, '#3a3a3a');
  circle(ctx, 64, 452, 14, '#3a3a3a');
  poly(ctx, [[54, 444], [58, 430], [64, 442]], '#3a3a3a');
  poly(ctx, [[66, 442], [72, 430], [74, 444]], '#3a3a3a');
  if (diff) line(ctx, 124, 458, 140, 470, '#3a3a3a', 6);
  else line(ctx, 124, 458, 138, 440, '#3a3a3a', 6);
  line(ctx, 124, 458, 128, 470, '#3a3a3a', 5);
  // Paper lanterns on the ground and a broom.
  ellipse(ctx, 540, 470, 20, 26, '#ff8fb3');
  line(ctx, 520, 500, 560, 430, '#7a4a21', 4);
  poly(ctx, [[556, 428], [566, 448], [552, 446]], '#f5b301');
}

// ---------- scene 3: Harbour at Dawn ----------

function drawHarbour(ctx, variant) {
  const diff = variant === 1;
  // Dawn sky and sun: lower on the right.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#f7b267');
  sky.addColorStop(0.6, '#f4845f');
  sky.addColorStop(1, '#e56b6f');
  rect(ctx, 0, 0, PANEL_W, 300, '#f7b267');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 300);
  circle(ctx, 522, diff ? 152 : 122, 30, '#fff3b0');
  cloud(ctx, 140, 70, 0.9);
  cloud(ctx, 380, 50, 0.7);
  bird(ctx, 260, 80, 1, '#5b3a3a');
  bird(ctx, 302, 92, 0.9, '#5b3a3a');
  if (diff) bird(ctx, 340, 74, 0.8, '#5b3a3a');
  // Sea.
  rect(ctx, 0, 300, PANEL_W, 220, '#2e6f8e');
  for (let i = 0; i < 5; i += 1) {
    const wy = 330 + i * 36;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20 + i * 12, wy);
    ctx.quadraticCurveTo(150, wy - 8, 300, wy);
    ctx.quadraticCurveTo(450, wy + 8, 580, wy);
    ctx.stroke();
  }
  // Lighthouse on the left rocks.
  rect(ctx, 78, 180, 48, 140, '#f7f3e8');
  rect(ctx, 78, 210, 48, 18, '#e74c3c');
  rect(ctx, 78, 262, 48, 18, '#e74c3c');
  rect(ctx, 72, 160, 60, 22, '#333333');
  circle(ctx, 102, 150, 12, '#ffe98a');
  line(ctx, 102, 138, 102, 118, '#333333', 3);
  poly(ctx, [[102, 62], [128, 74], [102, 86]], diff ? '#2e86de' : '#e74c3c');
  line(ctx, 102, 62, 102, 118, '#333333', 2);
  if (!diff) {
    // The beam sweeps out only on the left panel.
    const beam = ctx.createLinearGradient(132, 150, 420, 110);
    beam.addColorStop(0, 'rgba(255,233,138,0.55)');
    beam.addColorStop(1, 'rgba(255,233,138,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(132, 142);
    ctx.lineTo(420, 96);
    ctx.lineTo(420, 168);
    ctx.lineTo(132, 160);
    ctx.closePath();
    ctx.fill();
  }
  // Rocks and dock.
  poly(ctx, [[40, 520], [60, 320], [170, 320], [200, 520]], '#6b6b6b');
  poly(ctx, [[150, 520], [180, 380], [600, 380], [600, 520]], '#8a5a2b');
  for (let i = 0; i < 6; i += 1) line(ctx, 200 + i * 70, 380, 200 + i * 70, 520, '#6b4226', 3);
  // Fishing boats.
  const boat = (x, y, sailColour, hullColour) => {
    line(ctx, x, y - 70, x, y, '#5b3a29', 4);
    poly(ctx, [[x + 4, y - 66], [x + 4, y - 12], [x + 52, y - 12]], sailColour);
    poly(ctx, [[x - 4, y - 60], [x - 4, y - 12], [x - 34, y - 12]], '#f7f3e8');
    poly(ctx, [[x - 46, y], [x + 60, y], [x + 46, y + 20], [x - 32, y + 20]], hullColour);
    circle(ctx, x + 8, y + 8, 4, '#ffd93b');
  };
  boat(300, 330, '#e74c3c', '#7a4a21');
  boat(430, 300, diff ? '#2e86de' : '#f7f3e8', '#5b6b7a');
  // Crates and barrels on the dock.
  rect(ctx, 430, 400, 42, 42, '#c98f4e');
  rect(ctx, 478, 400, 42, 42, '#a5672f');
  if (!diff) rect(ctx, 482, 442, 36, 36, '#c98f4e');
  ellipse(ctx, 250, 462, 20, 26, '#7a4a21');
  ellipse(ctx, 300, 468, 20, 26, '#5b6b7a');
  // Anchor leaning on the dock: gone on the right.
  if (!diff) {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(152, 470, 16, 0, Math.PI);
    ctx.stroke();
    line(ctx, 152, 470, 152, 428, '#333333', 6);
    circle(ctx, 152, 424, 7, '#333333');
    line(ctx, 138, 436, 166, 436, '#333333', 5);
  }
  // Fishing nets and a bucket.
  ctx.strokeStyle = '#e8dcc8';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(540, 500, 10 + i * 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  poly(ctx, [[350, 470], [372, 470], [368, 492], [354, 492]], '#e74c3c');
}

// ---------- dispatcher ----------

/** Paint scene `scene` into ctx (already translated to the panel origin). */
export function drawScene(ctx, scene, variant) {
  ctx.save();
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  if (scene.id === 'park') drawPark(ctx, variant);
  else if (scene.id === 'market') drawMarket(ctx, variant);
  else drawHarbour(ctx, variant);
  ctx.restore();
}
