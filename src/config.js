// All tunable knobs live here. Tweak thresholds to taste under your lighting.

// The 18 hamster states. Keys match the file names in assets/hamster/ exactly
// (spaces and hyphens included). "kind" says which model drives the state.
export const STATES = [
  // face-driven
  { key: 'idle', kind: 'face' },
  { key: 'very-angry', kind: 'face' },
  { key: 'gloomy', kind: 'face' },
  { key: 'goofy', kind: 'face' },
  { key: 'showing-teeth', kind: 'face' },
  { key: 'duck-like lips', kind: 'face' },
  { key: 'an-open-tongue', kind: 'face' }, // approx: tongue not detectable
  { key: 'funny-with-an-open-tongue', kind: 'face' }, // approx: tongue not detectable
  { key: 'raised an eyebrow', kind: 'face' },
  { key: 'questioned', kind: 'face' },
  { key: 'suspect', kind: 'face' },
  { key: 'plotting-smt', kind: 'face' },
  { key: 'stone-faced', kind: 'face' },
  { key: 'scary', kind: 'face' },
  { key: 'i-dont-know', kind: 'face' },
  // pose-driven (override the face when detected)
  { key: 'happy-raised-urms', kind: 'pose' },
  { key: 'strong-showing-arm', kind: 'pose' },
  { key: 'strict-staring-crossed-his-arms', kind: 'pose' }
]

// Build the emotion -> image map from the state list (files are .jpg).
// Paths are relative to src/index.html, so hop up one level to the repo root.
const assets = {}
for (const s of STATES) assets[s.key] = `../assets/hamster/${s.key}.jpg`

export const CONFIG = {
  // MediaPipe assets (loaded on first run; needs internet once).
  // To go fully offline/private, vendor these locally and point here. See README.
  wasmBase: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm',
  modelUrl:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  // Body pose (lite = lighter on CPU). Used for arm/hand gestures.
  poseModelUrl:
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',

  // Temporal stabilizer (stops the hamster from flickering).
  // Lower enter threshold because many of the 18 states fire at modest strength.
  enterThreshold: 0.45, // confidence needed to consider a new state
  framesToConfirm: 5, // it must hold for this many frames in a row
  cooldownMs: 400, // minimum time between state switches

  // Rendering.
  crossfadeMs: 150,

  assets
}
