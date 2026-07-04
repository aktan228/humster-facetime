const { contextBridge, ipcRenderer } = require('electron')

// minimal, safe bridge exposed to the renderer as window.hamster
contextBridge.exposeInMainWorld('hamster', {
  quit: () => ipcRenderer.send('hamster:quit'),
  setPreview: (on) => ipcRenderer.send('hamster:preview', on)
})
