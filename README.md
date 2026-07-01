# Humster FaceTime 🐹

A meme-hamster desktop overlay that mirrors your facial expressions. It watches
your webcam, reads your face in real time, and shows the hamster with a matching
emotion in a always-on-top window in the corner of your screen.

No emotion model is trained: MediaPipe gives 52 facial "blendshape" signals per
frame, and a small set of rules maps them to hamster emotions.

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
webcam → MediaPipe FaceLandmarker → classifier → stabilizer → renderer → overlay
         (52 blendshapes)           (rules)      (anti-flicker)  (crossfade)
```

- `src/camera.js` — opens the webcam via `getUserMedia`.
- `src/landmarker.js` — MediaPipe FaceLandmarker, emits 52 blendshapes/frame.
- `src/emotions.js` — rule table mapping blendshapes → emotion + confidence.
- `src/stabilizer.js` — enter threshold + N-frames-in-a-row + cooldown so the
  hamster doesn't flicker between emotions.
- `src/display.js` — draws the hamster (PNG, or emoji fallback).
- `src/main.js` — the per-frame loop that wires it all together.
- `electron/main.js` — the transparent, always-on-top overlay window.

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
