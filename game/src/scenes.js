// Scene definitions for Spot the Difference: three original hand-drawn scenes.
// Each scene is 600 x 520 scene units and carries exactly 7 differences.
// A difference is a point (x, y) with a click radius and a short label; the
// drawing code in draw-scene.js renders the alternate version on the right
// panel whenever the matching difference id is "on" for that panel.
export const PANEL_W = 600;
export const PANEL_H = 520;

export const SCENES = [
  {
    id: 'park',
    name: 'Sunny Park Picnic',
    tagline: 'A lazy afternoon under the old oak tree',
    timeLimit: 180,
    hints: 3,
    diffs: [
      { id: 'sun-glasses', x: 92, y: 78, r: 34, label: 'The sun wears sunglasses' },
      { id: 'kite-tail', x: 438, y: 118, r: 30, label: 'The kite tail changed colour' },
      { id: 'apple-missing', x: 312, y: 428, r: 26, label: 'An apple is missing from the basket' },
      { id: 'extra-flower', x: 522, y: 468, r: 24, label: 'An extra daisy grew here' },
      { id: 'dog-ear', x: 148, y: 428, r: 30, label: "The dog's ear flopped down" },
      { id: 'extra-cloud', x: 300, y: 58, r: 30, label: 'A new cloud drifted in' },
      { id: 'butterfly', x: 482, y: 252, r: 26, label: 'A butterfly appeared' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market Stall',
    tagline: 'Lanterns, oranges and one sleepy cat',
    timeLimit: 150,
    hints: 2,
    diffs: [
      { id: 'lantern-colour', x: 118, y: 122, r: 30, label: 'A lantern changed colour' },
      { id: 'moon-phase', x: 522, y: 72, r: 32, label: 'The moon turned crescent' },
      { id: 'cat-tail', x: 92, y: 452, r: 30, label: "The cat's tail dropped" },
      { id: 'price-sign', x: 300, y: 372, r: 28, label: 'The price sign changed' },
      { id: 'orange-missing', x: 422, y: 418, r: 26, label: 'An orange vanished from the crate' },
      { id: 'extra-star', x: 252, y: 52, r: 24, label: 'A new star came out' },
      { id: 'awning-stripe', x: 352, y: 152, r: 28, label: 'An awning stripe changed colour' },
    ],
  },
  {
    id: 'harbour',
    name: 'Harbour at Dawn',
    tagline: 'Fishing boats and the first light',
    timeLimit: 120,
    hints: 2,
    diffs: [
      { id: 'lighthouse-beam', x: 102, y: 128, r: 34, label: 'The lighthouse beam switched off' },
      { id: 'sail-colour', x: 382, y: 222, r: 30, label: 'A sail changed colour' },
      { id: 'extra-gull', x: 302, y: 92, r: 26, label: 'An extra gull joined the flock' },
      { id: 'crate-missing', x: 482, y: 442, r: 28, label: 'A crate disappeared from the dock' },
      { id: 'anchor-missing', x: 152, y: 462, r: 28, label: 'The anchor is gone' },
      { id: 'sun-height', x: 522, y: 122, r: 30, label: 'The sun sits lower in the sky' },
      { id: 'flag-colour', x: 102, y: 62, r: 26, label: 'The lighthouse flag changed colour' },
    ],
  },
];

/** The scene at `index`, wrapping never happens: callers clamp the index. */
export function sceneAt(index) {
  return SCENES[index];
}

/** Total differences across the whole game (7 per scene, 3 scenes). */
export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.diffs.length, 0);
}
