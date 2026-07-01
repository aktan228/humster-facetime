// Rule-based classifier: turns MediaPipe blendshapes into an emotion + confidence.
// No ML training needed — just thresholds over the 0..1 facial signals.

function toMap(categories) {
  const m = {}
  for (const c of categories) m[c.categoryName] = c.score
  return m
}

// categories: result.faceBlendshapes[0].categories, or undefined when no face.
export function classify(categories) {
  if (!categories || categories.length === 0) {
    return { emotion: 'idle', confidence: 0 }
  }

  const b = toMap(categories)
  const g = (k) => b[k] || 0

  const smile = g('mouthSmileLeft') + g('mouthSmileRight') // 0..2
  const browDown = g('browDownLeft') + g('browDownRight') // 0..2
  const frown = g('mouthFrownLeft') + g('mouthFrownRight') // 0..2
  const squint = g('eyeSquintLeft') + g('eyeSquintRight') // 0..2
  const jaw = g('jawOpen') // 0..1
  const browInner = g('browInnerUp') // 0..1

  // Each candidate returns 0 when its rule doesn't fire, else a rough confidence.
  const candidates = [
    { emotion: 'laugh', confidence: smile > 0.8 && squint > 0.4 ? (smile + squint) / 3 : 0 },
    { emotion: 'happy', confidence: smile > 0.8 ? smile / 2 : 0 },
    { emotion: 'shock', confidence: jaw > 0.5 && browInner > 0.4 ? (jaw + browInner) / 2 : 0 },
    { emotion: 'angry', confidence: browDown > 0.8 && frown > 0.3 ? (browDown + frown) / 3 : 0 },
    { emotion: 'sad', confidence: browInner > 0.5 && frown > 0.3 ? (browInner + frown) / 2 : 0 }
  ]

  let best = { emotion: 'idle', confidence: 0 }
  for (const c of candidates) {
    if (c.confidence > best.confidence) best = c
  }
  return best
}
