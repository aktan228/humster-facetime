const { app, BrowserWindow, screen, session, ipcMain } = require('electron')
const path = require('path')

// Some Windows webcams spam "Failed to reserve output capture buffer" through the
// Media Foundation capturer. Fall back to the older DirectShow capturer, which
// clears the error and stabilizes the stream. Must run before app is ready.
app.commandLine.appendSwitch('disable-features', 'MediaFoundationVideoCapture')

const WIN_SIZE = 320
const PREVIEW = { w: 640, h: 520 }
const MARGIN = 20

let win = null

// keep the window anchored to the bottom-right corner at the given size
function anchor(w, h) {
  const { workArea } = screen.getPrimaryDisplay()
  win.setSize(w, h)
  win.setPosition(workArea.x + workArea.width - w - MARGIN, workArea.y + workArea.height - h - MARGIN)
}

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay()

  win = new BrowserWindow({
    width: WIN_SIZE,
    height: WIN_SIZE,
    x: workArea.x + workArea.width - WIN_SIZE - MARGIN,
    y: workArea.y + workArea.height - WIN_SIZE - MARGIN,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // stay above fullscreen apps too
  win.setAlwaysOnTop(true, 'screen-saver')
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'))

  // uncomment to debug the renderer
  // win.webContents.openDevTools({ mode: 'detach' })
}

app.whenReady().then(() => {
  // allow the renderer to use the webcam (getUserMedia)
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'media')
  })

  ipcMain.on('hamster:quit', () => app.quit())
  ipcMain.on('hamster:preview', (_e, on) =>
    anchor(on ? PREVIEW.w : WIN_SIZE, on ? PREVIEW.h : WIN_SIZE)
  )

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
