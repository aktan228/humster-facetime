// Camera preview with the green MediaPipe face mesh drawn on top.
// Toggle with C. Video + mesh are drawn into one canvas (mirrored, selfie-style)
// so they always stay aligned.

import { DrawingUtils, FaceLandmarker } from 'https://esm.sh/@mediapipe/tasks-vision@0.10.17'

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

// landmarks: faceResult.faceLandmarks (array of point arrays), or null.
export function draw(landmarks) {
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

  if (landmarks) {
    for (const lm of landmarks) {
      drawer.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
        color: '#00ff88',
        lineWidth: 1
      })
    }
  }
  ctx.restore()
}
