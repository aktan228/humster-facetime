// Stores recorded training samples (blendshape vectors + label) in localStorage.
// Each sample: { label, v: number[] }. `names` is the feature ordering.

const KEY = 'hamster-dataset'

function blank() {
  return { names: null, samples: [] }
}

let data = load()

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || blank()
  } catch {
    return blank()
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('dataset persist failed (storage full?):', e)
  }
}

export function setNames(names) {
  if (!data.names) {
    data.names = names
    persist()
  }
}
export function getNames() {
  return data.names
}
export function add(label, vector) {
  data.samples.push({ label, v: vector })
  persist()
}
export function counts() {
  const c = {}
  for (const s of data.samples) c[s.label] = (c[s.label] || 0) + 1
  return c
}
export function all() {
  return data.samples
}
export function total() {
  return data.samples.length
}
export function clear() {
  data = blank()
  persist()
}
export function exportJSON() {
  return JSON.stringify(data)
}
export function importJSON(json) {
  const parsed = JSON.parse(json)
  if (!parsed || !Array.isArray(parsed.samples)) throw new Error('bad dataset file')
  data = parsed
  persist()
}
