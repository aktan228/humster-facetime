// Training panel: record blendshape samples per state, train the model, switch modes.
// Toggle with T. Hold R to record the selected state. M toggles rules/model.

import { STATES } from './config.js'

const FACE_STATES = STATES.filter((s) => s.kind === 'face').map((s) => s.key)

export function initUI(h) {
  const panel = document.createElement('div')
  panel.id = 'panel'
  panel.innerHTML = `
    <div class="p-row"><b>🐹 trainer</b><span id="p-mode" class="p-badge"></span></div>
    <select id="p-label">${FACE_STATES.map((s) => `<option value="${s}">${s}</option>`).join('')}</select>
    <button id="p-rec" class="p-btn p-rec">● держи, чтобы записать</button>
    <div id="p-counts" class="p-counts"></div>
    <div class="p-row">
      <button id="p-train" class="p-btn">Обучить</button>
      <button id="p-toggle" class="p-btn">Режим</button>
    </div>
    <div class="p-row">
      <button id="p-export" class="p-btn">Экспорт</button>
      <button id="p-import-btn" class="p-btn">Импорт</button>
      <button id="p-clear" class="p-btn">Очистить</button>
    </div>
    <input id="p-import" type="file" accept="application/json" hidden>
    <div id="p-status" class="p-status"></div>
    <div class="p-hint">T панель · R запись · M режим · Esc выход</div>`
  document.body.appendChild(panel)

  const $ = (id) => panel.querySelector(id)
  const labelSel = $('#p-label')
  const status = $('#p-status')
  const modeBadge = $('#p-mode')
  const recBtn = $('#p-rec')

  let visible = false
  const show = (v) => {
    visible = v
    panel.style.display = v ? 'block' : 'none'
    if (v) refresh()
  }

  function refresh() {
    modeBadge.textContent = h.getMode() + (h.modelReady() ? '' : ' (нет модели)')
    const c = h.counts()
    $('#p-counts').innerHTML = FACE_STATES.map(
      (s) => `<span class="p-c${c[s] ? ' has' : ''}">${s}:${c[s] || 0}</span>`
    ).join('')
  }

  const setStatus = (t) => (status.textContent = t)

  // record while holding the button or the R key
  let recording = false
  const startRec = () => {
    if (recording) return
    recording = true
    recBtn.classList.add('on')
    h.startRec(labelSel.value)
  }
  const stopRec = () => {
    if (!recording) return
    recording = false
    recBtn.classList.remove('on')
    h.stopRec()
    refresh()
  }
  recBtn.addEventListener('pointerdown', startRec)
  window.addEventListener('pointerup', stopRec)

  $('#p-train').addEventListener('click', async () => {
    setStatus('обучение…')
    try {
      const meta = await h.train((epoch, logs) => {
        setStatus(`эпоха ${epoch + 1} · acc ${(logs.acc ?? logs.accuracy ?? 0).toFixed(2)}`)
      })
      setStatus(`готово: ${meta.labels.length} классов`)
      refresh()
    } catch (e) {
      setStatus('ошибка: ' + e.message)
    }
  })

  $('#p-toggle').addEventListener('click', () => {
    const next = h.getMode() === 'model' ? 'rules' : 'model'
    if (!h.setMode(next)) setStatus('сначала обучи модель')
    refresh()
  })

  $('#p-export').addEventListener('click', () => {
    const blob = new Blob([h.exportData()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'hamster-dataset.json'
    a.click()
    URL.revokeObjectURL(a.href)
  })

  $('#p-import-btn').addEventListener('click', () => $('#p-import').click())
  $('#p-import').addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      h.importData(await file.text())
      setStatus('датасет загружен')
      refresh()
    } catch (err) {
      setStatus('плохой файл: ' + err.message)
    }
  })

  $('#p-clear').addEventListener('click', () => {
    h.clearData()
    setStatus('датасет очищен')
    refresh()
  })

  // keyboard
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase()
    if (k === 't') show(!visible)
    else if (k === 'm') {
      const next = h.getMode() === 'model' ? 'rules' : 'model'
      h.setMode(next)
      refresh()
    } else if (k === 'r' && !e.repeat && visible) startRec()
  })
  window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'r') stopRec()
  })

  setInterval(() => {
    if (visible) refresh()
  }, 400)

  return { refresh, setStatus }
}
