// Orchestrates the pipeline: camera -> landmarker -> classify -> stabilize -> draw.

import { startCamera } from './camera.js'
import { createLandmarker } from './landmarker.js'
import { classify } from './emotions.js'
import { update as stabilize } from './stabilizer.js'
import { initDisplay, show } from './display.js'

const video = document.getElementById('cam')
const stage = document.getElementById('stage')
const hud = document.getElementById('hud')

let landmarker = null
let lastVideoTime = -1

async function main() {
  initDisplay(stage)
  show('idle')

  try {
    await startCamera(video)
  } catch (e) {
    hud.textContent = 'Нет доступа к камере: ' + e.message
    return
  }

  try {
    hud.textContent = 'Загрузка модели…'
    landmarker = await createLandmarker()
    hud.textContent = ''
  } catch (e) {
    hud.textContent = 'Ошибка загрузки модели: ' + e.message
    return
  }

  loop()
}

function loop() {
  if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
    lastVideoTime = video.currentTime

    const result = landmarker.detectForVideo(video, performance.now())
    const categories =
      result.faceBlendshapes && result.faceBlendshapes[0]
        ? result.faceBlendshapes[0].categories
        : null

    const raw = classify(categories)
    const stable = stabilize(raw)
    show(stable)

    hud.textContent = `${stable}  ·  raw: ${raw.emotion} ${raw.confidence.toFixed(2)}`
  }
  requestAnimationFrame(loop)
}

// Esc quits (the window is frameless, so there's no close button).
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.hamster?.quit()
})

main()
