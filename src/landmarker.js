// Wraps MediaPipe FaceLandmarker. Emits 52 facial blendshapes per frame.

import { FaceLandmarker, FilesetResolver } from 'https://esm.sh/@mediapipe/tasks-vision@0.10.17'
import { CONFIG } from './config.js'

export async function createLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks(CONFIG.wasmBase)

  const options = (delegate) => ({
    baseOptions: { modelAssetPath: CONFIG.modelUrl, delegate },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 1
  })

  // Prefer GPU; fall back to CPU if the GPU delegate is unavailable.
  try {
    return await FaceLandmarker.createFromOptions(fileset, options('GPU'))
  } catch {
    return await FaceLandmarker.createFromOptions(fileset, options('CPU'))
  }
}
