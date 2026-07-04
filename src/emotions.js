// Rule-based classifier: turns MediaPipe blendshapes into a face state + confidence.
// No ML training needed — just thresholds over the 0..1 facial signals.
//
// These 14 states overlap a lot, so this is a best-effort mapping: it WILL need
// per-user threshold tuning. Reliability notes are on each rule.

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

  // Derived signals.
  const smileL = g('mouthSmileLeft')
  const smileR = g('mouthSmileRight')
  const smile = smileL + smileR // 0..2
  const smileAsym = Math.abs(smileL - smileR) // 0..1 (smirk)
  const browDown = g('browDownLeft') + g('browDownRight') // 0..2
  const browOuterAsym = Math.abs(g('browOuterUpLeft') - g('browOuterUpRight')) // 0..1
  const browInner = g('browInnerUp') // 0..1
  const frown = g('mouthFrownLeft') + g('mouthFrownRight') // 0..2
  const squint = g('eyeSquintLeft') + g('eyeSquintRight') // 0..2
  const eyeWide = g('eyeWideLeft') + g('eyeWideRight') // 0..2
  const jaw = g('jawOpen') // 0..1
  const pucker = g('mouthPucker') // 0..1 (duck lips)
  const shrug = g('mouthShrugUpper') + g('mouthShrugLower') // 0..2 ("dunno")
  const press = g('mouthPressLeft') + g('mouthPressRight') // 0..2 (lips pressed)
  const sneer = g('noseSneerLeft') + g('noseSneerRight') // 0..2

  // Each candidate returns 0 when its rule doesn't fire, else a rough confidence.
  const candidates = [
    // reliable
    { emotion: 'duck-like lips', confidence: pucker > 0.5 ? pucker : 0 },
    { emotion: 'very-angry', confidence: browDown > 1.0 && (frown > 0.3 || sneer > 0.3) ? (browDown + sneer) / 2.5 : 0 },
    { emotion: 'showing-teeth', confidence: smile > 1.0 && jaw > 0.15 ? (smile + jaw) / 3 : 0 },
    { emotion: 'raised an eyebrow', confidence: browOuterAsym > 0.35 ? browOuterAsym * 1.6 : 0 },
    { emotion: 'gloomy', confidence: browInner > 0.4 && frown > 0.3 ? (browInner + frown) / 2 : 0 },
    { emotion: 'i-dont-know', confidence: shrug > 0.6 && smile < 0.4 ? shrug / 1.5 : 0 },

    // approximate (overlapping signals)
    { emotion: 'goofy', confidence: smile > 0.9 && eyeWide > 0.4 ? (smile + eyeWide) / 3 : 0 },
    { emotion: 'scary', confidence: eyeWide > 0.8 && jaw > 0.3 ? (eyeWide + jaw) / 2.5 : 0 },
    { emotion: 'plotting-smt', confidence: smileAsym > 0.3 && squint > 0.2 ? smileAsym + squint / 2 : 0 },
    { emotion: 'questioned', confidence: browInner > 0.5 && frown < 0.2 && smile < 0.3 ? browInner : 0 },
    { emotion: 'suspect', confidence: squint > 0.7 && browDown > 0.4 && smile < 0.3 ? (squint + browDown) / 3 : 0 },
    { emotion: 'stone-faced', confidence: press > 0.5 && smile < 0.2 && jaw < 0.15 ? press / 1.5 : 0 },

    // tongue is NOT detectable → approximated by open mouth
    { emotion: 'funny-with-an-open-tongue', confidence: jaw > 0.5 && smile > 0.6 ? (jaw + smile) / 3 : 0 },
    { emotion: 'an-open-tongue', confidence: jaw > 0.6 && smile < 0.3 && eyeWide < 0.6 ? jaw : 0 }
  ]

  let best = { emotion: 'idle', confidence: 0 }
  for (const c of candidates) {
    if (c.confidence > best.confidence) best = c
  }
  return best
}
