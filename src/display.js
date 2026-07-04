// Draws the hamster. Uses PNGs from assets/hamster/ when present, and falls back
// to an emoji placeholder so the app is usable before you add any art.

import { CONFIG } from './config.js'

// Fallback shown only when a state's .jpg is missing.
const EMOJI = {
  idle: '🐹',
  'very-angry': '😡',
  gloomy: '😔',
  goofy: '😜',
  'showing-teeth': '😁',
  'duck-like lips': '😗',
  'an-open-tongue': '😛',
  'funny-with-an-open-tongue': '😝',
  'raised an eyebrow': '🤨',
  questioned: '❓',
  suspect: '🧐',
  'plotting-smt': '😏',
  'stone-faced': '😐',
  scary: '😨',
  'i-dont-know': '🤷',
  'happy-raised-urms': '🙌',
  'strong-showing-arm': '💪',
  'strict-staring-crossed-his-arms': '🙅'
}

let emojiEl = null
let imgEl = null
let current = null

export function initDisplay(container) {
  emojiEl = document.createElement('div')
  emojiEl.className = 'hamster-emoji'

  imgEl = document.createElement('img')
  imgEl.className = 'hamster-img'
  imgEl.draggable = false
  imgEl.style.opacity = '0'
  imgEl.onload = () => (imgEl.style.opacity = '1') // real art covers the emoji
  imgEl.onerror = () => (imgEl.style.opacity = '0') // no file -> show emoji

  container.appendChild(emojiEl)
  container.appendChild(imgEl)
}

export function show(emotion) {
  if (emotion === current) return
  current = emotion

  emojiEl.textContent = EMOJI[emotion] || EMOJI.idle

  const src = CONFIG.assets[emotion]
  imgEl.style.opacity = '0'
  if (src) {
    imgEl.src = src // onload flips opacity back to 1 if the file exists
  } else {
    imgEl.removeAttribute('src')
  }
}
