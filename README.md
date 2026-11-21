[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/plenger-agent/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/plenger-agent/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Spot the Difference

A complete, original spot-the-difference game that plays offline in a desktop
browser from static files — no network requests, no external assets.

Three hand-drawn scenes, all art drawn procedurally in canvas by the game's
own code:

1. **Sunny Park Picnic** — a lazy afternoon under the old oak tree
2. **Night Market Stall** — lanterns, oranges and one sleepy cat
3. **Harbour at Dawn** — fishing boats and the first light

Each scene hides **7 differences** between two near-identical pictures shown
side by side. Click a difference in either picture to mark it with a green
ring and checkmark (+100 points, chime). A wrong click costs 5 seconds.
Hints (H) highlight one unfound difference for a few seconds. Clear a scene
before the timer runs out to earn a time bonus and move on; find all 21
differences to win.

## Play

Serve `game/` with any static server, e.g. `node serve.ts`, then open
http://localhost:8080. Mouse and keyboard: arrows move the cursor, Enter
marks a difference, H hint, P pause, M mute, Space starts.

## Layout

- `game/index.html` — the page
- `game/src/main.js` — boot, input, the one loop, `?shot=` staging
- `game/src/scenes.js` — the three scenes and their difference lists
- `game/src/draw-scene.js` — all procedural canvas art
- `game/src/game.js` — state, clicks, timer, hints, scoring
- `game/src/render.js` — HUD, panels, markers, screens
- `game/src/audio.js` — WebAudio chimes (synthesized, no files)
- `game/src/shots.js` — screenshot staging via `?shot=`
- `main.ts` — the make.fun entry program (Node 22, stdlib only)

Built for the make.fun bounty "Make the best spot the difference game".
