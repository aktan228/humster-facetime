// Camera preview with the green MediaPipe face mesh drawn on top.
// Toggle with C. Video + mesh are drawn into one canvas (mirrored, selfie-style)
// so they always stay aligned.

import { DrawingUtils, FaceLandmarker, PoseLandmarker } from 'https://esm.sh/@mediapipe/tasks-vision@0.10.17'

let canvas = null
let ctx = null
let drawer = null
let video = null
let on = false

export function initPreview(videoEl) {
  video = videoEl
  canvas = document.createElement('canvas')
  canvas.id = 'overlay'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  drawer = new DrawingUtils(ctx)
}

export function isOn() {
  return on
}

export function toggle() {
  setPreview(!on)
}

export function setPreview(v) {
  on = v
  document.body.classList.toggle('preview', v)
  // ask the main process to grow/shrink the window for a proper camera view
  window.hamster?.setPreview?.(v)
}

// faceLandmarks: faceResult.faceLandmarks; poseLandmarks: poseResult.landmarks.
// Either may be null.
export function draw(faceLandmarks, poseLandmarks) {
  if (!on) return
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w) return

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }

  ctx.save()
  ctx.translate(w, 0)
  ctx.scale(-1, 1) // mirror so it reads like a selfie
  ctx.drawImage(video, 0, 0, w, h)

  // green face mesh
  if (faceLandmarks) {
    for (const lm of faceLandmarks) {
      drawer.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
        color: '#00ff88',
        lineWidth: 1
      })
    }
  }

  // thin body/arm skeleton sticks
  if (poseLandmarks) {
    for (const lm of poseLandmarks) {
      drawer.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, {
        color: '#00d0ff',
        lineWidth: 2
      })
      drawer.drawLandmarks(lm, { color: '#ffcc00', radius: 3 })
    }
  }
  ctx.restore()
}
