# Hamster art

Image files here (one per state) are matched by the `key` in `STATES` in
`src/config.js`, as `<key>.jpg`. File names must match the keys exactly,
including spaces and hyphens.

Face states: `idle`, `very-angry`, `gloomy`, `goofy`, `showing-teeth`,
`duck-like lips`, `an-open-tongue`, `funny-with-an-open-tongue`,
`raised an eyebrow`, `questioned`, `suspect`, `plotting-smt`, `stone-faced`,
`scary`, `i-dont-know`.

Pose states: `happy-raised-urms`, `strong-showing-arm`,
`strict-staring-crossed-his-arms`.

Notes:

- A missing file falls back to an emoji placeholder, so the app still runs.
- Current art is `.jpg` with a white background. On the transparent overlay that
  shows as a white square. Export transparent PNGs (and switch the extension in
  `src/config.js`) for a clean cut-out, or enable runtime white-removal.
- To add a state: add it to `STATES` in `src/config.js`, add a rule in
  `src/emotions.js` (face) or `src/pose.js` (body), and drop the image here.
