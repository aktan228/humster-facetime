// Orchestrates the pipeline: camera -> face/pose -> classify (rules OR model) ->
// stabilize -> draw. Also drives the training panel (record / train / infer).

import { startCamera } from './camera.js'
import { createLandmarker } from './landmarker.js'
import { createPose, classifyPose } from './pose.js'
import { classify } from './emotions.js'
import { update as stabilize } from './stabilizer.js'
import { initDisplay, show } from './display.js'
import { featureNamesFrom, toVector } from './features.js'
import * as dataset from './dataset.js'
import * as model from './model.js'
import { initUI } from './ui.js'
import { initPreview, draw as drawPreview, toggle as togglePreview } from './preview.js'

const video = document.getElementById('cam')
const stage = document.getElementById('stage')
const hud = document.getElementById('hud')

let landmarker = null
let pose = null
let lastVideoTime = -1

let mode = 'rules' // 'rules' | 'model'
let recording = false
let recLabel = null

async function main() {
  initDisplay(stage)
  show('idle')
  initPreview(video)

  initUI({
    getMode: () => mode,
    setMode: (m) => {
      if (m === 'model' && !model.isReady()) return false
      mode = m
      return true
    },
    modelReady: () => model.isReady(),
    startRec: (label) => {
      recLabel = label
      recording = true
    },
    stopRec: () => {
      recording = false
    },
    counts: () => dataset.counts(),
    train: async (onEpoch) => {
      const samples = dataset.all()
      if (samples.length < 20) throw new Error('нужно больше данных')
      const meta = await model.train(samples, dataset.getNames(), { onEpoch })
      mode = 'model'
      return meta
    },
    exportData: () => dataset.exportJSON(),
    importData: (json) => dataset.importJSON(json),
    clearData: () => dataset.clear()
  })

  try {
    await startCamera(video)
  } catch (e) {
    hud.textContent = 'Нет доступа к камере: ' + e.message
    return
  }

  try {
    hud.textContent = 'Загрузка моделей…'
    landmarker = await createLandmarker()
  } catch (e) {
    hud.textContent = 'Ошибка загрузки модели лица: ' + e.message
    return
  }

  try {
    pose = await createPose()
  } catch (e) {
    pose = null
    console.warn('Pose model unavailable, running face-only:', e)
  }

  // restore a trained face model if one exists
  try {
    if (await model.loadSaved()) mode = 'model'
  } catch {
    /* keep rules mode */
  }

  hud.textContent = ''
  loop()
}

function loop() {
  if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
    lastVideoTime = video.currentTime
    const now = performance.now()

    // Face -> feature vector -> emotion (rules or trained model)
    const faceResult = landmarker.detectForVideo(video, now)
    const categories =
      faceResult.faceBlendshapes && faceResult.faceBlendshapes[0]
        ? faceResult.faceBlendshapes[0].categories
        : null

    // detect body pose (also used for the preview skeleton)
    const poseResult = pose ? pose.detectForVideo(video, now) : null

    // preview: green face mesh + thin pose sticks (no-op unless toggled with C)
    drawPreview(faceResult.faceLandmarks, poseResult ? poseResult.landmarks : null)

    let faceState = 'idle'
    let faceConf = 0

    if (categories) {
      let names = dataset.getNames()
      if (!names) {
        names = featureNamesFrom(categories)
        dataset.setNames(names)
      }
      const vector = toVector(categories, names)

      if (recording && recLabel) dataset.add(recLabel, vector)

      if (mode === 'model' && model.isReady()) {
        const p = model.predict(vector)
        faceState = p.label
        faceConf = p.confidence
      } else {
        const r = classify(categories)
        faceState = r.emotion
        faceConf = r.confidence
      }
    }

    // Body -> gesture (optional). A detected gesture overrides the face.
    let poseRaw = { gesture: null, confidence: 0 }
    if (poseResult) {
      poseRaw = classifyPose(poseResult.landmarks)
    }

    const raw = poseRaw.gesture
      ? { emotion: poseRaw.gesture, confidence: poseRaw.confidence }
      : { emotion: faceState, confidence: faceConf }

    const stable = stabilize(raw)
    show(stable)

    hud.textContent =
      `[${mode}] ${stable} · ${raw.emotion} ${raw.confidence.toFixed(2)}` +
      (recording ? '  ● REC ' + recLabel : '')
  }
  requestAnimationFrame(loop)
}

// Esc quits (frameless window has no close button). C toggles the camera preview.
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.hamster?.quit()
  else if (e.key.toLowerCase() === 'c') togglePreview()
})

main()
