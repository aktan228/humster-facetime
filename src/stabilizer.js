// Temporal filter: keeps the displayed emotion steady so the hamster doesn't flicker.
// A new emotion must clear the enter threshold AND hold for N frames AND respect a
// cooldown before we actually switch to it.

import { CONFIG } from './config.js'

let current = 'idle'
let candidate = 'idle'
let count = 0
let lastSwitch = 0

export function update(raw, now = performance.now()) {
  // Only non-idle emotions with enough confidence are eligible.
  const proposed = raw.confidence >= CONFIG.enterThreshold ? raw.emotion : 'idle'

  if (proposed === current) {
    candidate = current
    count = 0
    return current
  }

  if (proposed === candidate) {
    count++
  } else {
    candidate = proposed
    count = 1
  }

  const held = count >= CONFIG.framesToConfirm
  const cooledDown = now - lastSwitch >= CONFIG.cooldownMs
  if (held && cooledDown) {
    current = candidate
    lastSwitch = now
    count = 0
  }

  return current
}
