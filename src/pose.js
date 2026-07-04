// Wraps MediaPipe PoseLandmarker (33 body points) and turns it into a gesture.
// Runs in parallel with the face model on the same video frame.

import { PoseLandmarker, FilesetResolver } from 'https://esm.sh/@mediapipe/tasks-vision@0.10.17'
import { CONFIG } from './config.js'

export async function createPose() {
  const fileset = await FilesetResolver.forVisionTasks(CONFIG.wasmBase)

  const options = (delegate) => ({
    baseOptions: { modelAssetPath: CONFIG.poseModelUrl, delegate },
    runningMode: 'VIDEO',
    numPoses: 1
  })

  try {
    return await PoseLandmarker.createFromOptions(fileset, options('GPU'))
  } catch {
    return await PoseLandmarker.createFromOptions(fileset, options('CPU'))
  }
}

// Landmark indices (MediaPipe Pose topology).
// Note: normalized image coords, y grows DOWNWARD (0 = top, 1 = bottom).
const LSHOULDER = 11
const RSHOULDER = 12
const LWRIST = 15
const RWRIST = 16
const LHIP = 23
const RHIP = 24

// landmarksArr: result.landmarks (array of poses), or undefined when no body.
export function classifyPose(landmarksArr) {
  if (!landmarksArr || landmarksArr.length === 0) {
    return { gesture: null, confidence: 0 }
  }

  const lm = landmarksArr[0]
  const visible = (i) => lm[i] && (lm[i].visibility === undefined || lm[i].visibility > 0.5)

  if (!visible(LSHOULDER) || !visible(RSHOULDER)) {
    return { gesture: null, confidence: 0 }
  }

  const shoulderY = (lm[LSHOULDER].y + lm[RSHOULDER].y) / 2
  const hipY = visible(LHIP) && visible(RHIP) ? (lm[LHIP].y + lm[RHIP].y) / 2 : shoulderY + 0.3

  // A wrist is "up" when it sits higher on screen (smaller y) than the shoulders.
  const leftUp = visible(LWRIST) && lm[LWRIST].y < shoulderY
  const rightUp = visible(RWRIST) && lm[RWRIST].y < shoulderY

  if (leftUp && rightUp) return { gesture: 'happy-raised-urms', confidence: 1 }
  if (leftUp || rightUp) return { gesture: 'strong-showing-arm', confidence: 1 }

  // Arms crossed: both wrists at chest height AND left/right wrists swapped sides.
  if (visible(LWRIST) && visible(RWRIST)) {
    const bothAtChest =
      lm[LWRIST].y > shoulderY && lm[LWRIST].y < hipY && lm[RWRIST].y > shoulderY && lm[RWRIST].y < hipY
    const crossed = lm[LWRIST].x > lm[RWRIST].x // swapped from the natural side
    if (bothAtChest && crossed) {
      return { gesture: 'strict-staring-crossed-his-arms', confidence: 1 }
    }
  }

  return { gesture: null, confidence: 0 }
}
