// All tunable knobs live here. Tweak thresholds to taste under your lighting.

export const CONFIG = {
  // MediaPipe assets (loaded on first run; needs internet once).
  // To go fully offline/private, vendor these locally and point here. See README.
  wasmBase: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm',
  modelUrl:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  // Body pose (lite = lighter on CPU). Used for gestures like hands up.
  poseModelUrl:
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',

  // Temporal stabilizer (stops the hamster from flickering).
  enterThreshold: 0.6, // confidence needed to consider a new emotion
  framesToConfirm: 5, // it must hold for this many frames in a row
  cooldownMs: 400, // minimum time between emotion switches

  // Rendering.
  crossfadeMs: 150,

  // Emotion -> hamster PNG. Drop files into assets/hamster/ with these names.
  // Missing files fall back to an emoji placeholder so the app still runs.
  assets: {
    // face emotions
    idle: 'assets/hamster/idle.png',
    happy: 'assets/hamster/happy.png',
    laugh: 'assets/hamster/laugh.png',
    sad: 'assets/hamster/sad.png',
    angry: 'assets/hamster/angry.png',
    shock: 'assets/hamster/shock.png',
    duck: 'assets/hamster/duck.png', // duck lips (mouthPucker)
    // body pose gestures (take priority over face)
    hands_up: 'assets/hamster/hands_up.png',
    one_hand_up: 'assets/hamster/one_hand_up.png'
  }
}
