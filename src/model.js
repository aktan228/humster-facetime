// Small MLP over blendshape vectors, trained and run in-browser with TensorFlow.js.
// TF.js is imported lazily so the app still starts if it can't be fetched.

const MODEL_URL = 'localstorage://hamster-face-model'
const META_KEY = 'hamster-model-meta'

let tf = null
let model = null
let meta = null // { labels: string[], names: string[] }

async function getTf() {
  if (!tf) tf = await import('https://esm.sh/@tensorflow/tfjs@4.22.0')
  return tf
}

export function isReady() {
  return !!model
}
export function getMeta() {
  return meta
}

// Try to restore a previously trained model from localStorage.
export async function loadSaved() {
  try {
    const savedMeta = JSON.parse(localStorage.getItem(META_KEY))
    if (!savedMeta) return false
    const t = await getTf()
    model = await t.loadLayersModel(MODEL_URL)
    meta = savedMeta
    return true
  } catch (e) {
    model = null
    meta = null
    return false
  }
}

export async function train(samples, names, opts = {}) {
  const t = await getTf()
  const labels = [...new Set(samples.map((s) => s.label))].sort()
  const labelIndex = Object.fromEntries(labels.map((l, i) => [l, i]))

  const xs = t.tensor2d(samples.map((s) => s.v))
  const ys = t.oneHot(
    t.tensor1d(
      samples.map((s) => labelIndex[s.label]),
      'int32'
    ),
    labels.length
  )

  const m = t.sequential()
  m.add(t.layers.dense({ inputShape: [names.length], units: 32, activation: 'relu' }))
  m.add(t.layers.dropout({ rate: 0.2 }))
  m.add(t.layers.dense({ units: 16, activation: 'relu' }))
  m.add(t.layers.dense({ units: labels.length, activation: 'softmax' }))
  m.compile({
    optimizer: t.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  })

  await m.fit(xs, ys, {
    epochs: opts.epochs || 60,
    batchSize: opts.batchSize || 16,
    shuffle: true,
    validationSplit: 0.15,
    callbacks: opts.onEpoch ? { onEpochEnd: opts.onEpoch } : undefined
  })

  xs.dispose()
  ys.dispose()

  model = m
  meta = { labels, names }
  await model.save(MODEL_URL)
  localStorage.setItem(META_KEY, JSON.stringify(meta))
  return meta
}

// vector must be built with meta.names ordering (same as training).
export function predict(vector) {
  if (!model || !meta || !tf) return { label: 'idle', confidence: 0 }
  return tf.tidy(() => {
    const probs = model.predict(tf.tensor2d([vector])).dataSync()
    let best = 0
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i
    return { label: meta.labels[best], confidence: probs[best] }
  })
}

export function clearModel() {
  model = null
  meta = null
  localStorage.removeItem(META_KEY)
  if (tf) tf.io.removeModel(MODEL_URL).catch(() => {})
}
