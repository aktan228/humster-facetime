# Humster FaceTime 🐹

A meme-hamster desktop overlay that mirrors your facial expressions. It watches
your webcam, reads your face in real time, and shows the hamster with a matching
emotion in a always-on-top window in the corner of your screen.

No emotion model is trained: MediaPipe gives 52 facial "blendshape" signals per
frame, and a small set of rules maps them to hamster emotions. A second MediaPipe
model (body pose) runs in parallel so gestures like raising your hands can drive
the hamster too — a detected gesture overrides the facial emotion.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (includes npm)
- A webcam
- Internet on first run (to fetch the MediaPipe runtime + model; see
  [Going offline](#going-offline))

## Install & run

```bash
npm install
npm start
```

A frameless, transparent hamster window appears in the bottom-right corner.

- **Move it** — drag the hamster.
- **Resize** — drag the window edges.
- **Camera preview** — press `C` to show your webcam with the green face mesh
  (the window grows for a proper view; press `C` again to go back to the hamster).
- **Quit** — press `Esc` while it's focused.

Until you add art (see below) the hamster is shown as an emoji placeholder, and a
small line at the bottom prints the current + raw detected emotion so you can see
the pipeline working.

## Add hamster art

Put transparent PNGs in `assets/hamster/` named `idle.png`, `happy.png`,
`laugh.png`, `sad.png`, `angry.png`, `shock.png`. Missing files fall back to the
emoji placeholder, so you can add them one at a time. See
[`assets/hamster/README.md`](assets/hamster/README.md).

## How it works

```
                ┌ FaceLandmarker → emotions (rules) ┐
webcam frame → ─┤                                    ├→ merge → stabilizer → renderer → overlay
                └ PoseLandmarker → gesture (rules) ──┘  (gesture   (anti-flicker) (crossfade)
                                                         wins)
```

- `src/camera.js` — opens the webcam via `getUserMedia`.
- `src/landmarker.js` — MediaPipe FaceLandmarker, emits 52 blendshapes/frame.
- `src/emotions.js` — rule table mapping blendshapes → emotion + confidence.
- `src/pose.js` — MediaPipe PoseLandmarker (33 body points) → gesture (e.g. hands up).
- `src/stabilizer.js` — enter threshold + N-frames-in-a-row + cooldown so the
  hamster doesn't flicker between states.
- `src/display.js` — draws the hamster (PNG, or emoji fallback).
- `src/main.js` — the per-frame loop that runs both models and merges them
  (a detected pose gesture overrides the facial emotion).
- `electron/main.js` — the transparent, always-on-top overlay window.

### States

18 states, defined in `STATES` in `src/config.js`. Each maps to
`assets/hamster/<key>.jpg`.

Face (driven by `src/emotions.js`): `idle`, `very-angry`, `gloomy`, `goofy`,
`showing-teeth`, `duck-like lips`, `an-open-tongue`*, `funny-with-an-open-tongue`*,
`raised an eyebrow`, `questioned`, `suspect`, `plotting-smt`, `stone-faced`,
`scary`, `i-dont-know`.

Pose (driven by `src/pose.js`, overrides the face): `happy-raised-urms`
(both arms up), `strong-showing-arm` (one arm up), `strict-staring-crossed-his-arms`
(arms crossed).

\* Tongue is not detectable by MediaPipe (no tongue blendshape), so these two are
approximated by an open mouth. Many face states share overlapping signals — expect
to tune the thresholds in `src/emotions.js` for your face and lighting.

## Training the face model

Instead of the hand-tuned rules, you can train a small classifier (in-browser,
TensorFlow.js) on your own face. It learns from the 52 MediaPipe blendshape
signals, so it needs very little data and trains in seconds. Everything — record,
train, infer — runs inside the app; nothing is uploaded.

1. Press `T` to open the training panel.
2. Pick a state from the dropdown, make that expression, and **hold `R`** (or the
   record button) for ~2-3 seconds. Repeat for each face state. Aim for ~150-300
   samples per state; do a few head angles and lighting for robustness.
3. Click **Обучить** (Train). Accuracy is shown per epoch.
4. It switches to `model` mode automatically. Toggle rules/model anytime with `M`.

The model and dataset are saved in the browser storage and reload on next launch.
**Экспорт/Импорт** save the dataset to a JSON file as a backup. Tongue states
(`an-open-tongue`, `funny-with-an-open-tongue`) still can't be learned — the
blendshape input has no tongue signal. Pose states stay on `src/pose.js`.

Files: `src/features.js` (vectorize), `src/dataset.js` (samples), `src/model.js`
(TF.js MLP), `src/ui.js` (panel).

## Tuning

All thresholds live in `src/config.js`. If detection feels twitchy or
unresponsive under your lighting, adjust `enterThreshold`, `framesToConfirm`, and
`cooldownMs`. To add or change emotions, edit the rules in `src/emotions.js` and
the `assets` map in `src/config.js`.

## Going offline

By default the MediaPipe WASM runtime and the `face_landmarker.task` model are
loaded from a CDN on first run. To run fully offline (and keep everything local),
download both and point `wasmBase` / `modelUrl` in `src/config.js` at local
paths. Video never leaves your machine either way — inference is local.

## Troubleshooting

- **"Нет доступа к камере" / camera error** — another app (Zoom, Teams, OBS) may
  be holding the webcam. On Windows a camera can usually only be opened by one app
  at a time. Close the other app and restart.
- **Nothing detected** — make sure your face is lit and centered; watch the raw
  emotion readout at the bottom to confirm signals are coming through.

## Notes

This is a zero-build skeleton written as plain ES modules for simplicity. The
file structure mirrors a TypeScript design and can be migrated to TS + a bundler
later without changing the architecture.

## License

MIT
