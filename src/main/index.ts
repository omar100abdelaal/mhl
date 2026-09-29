import { app, shell, BrowserWindow, protocol } from 'electron'
import { join } from 'path'
import { net } from 'electron'
import { pathToFileURL } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initDb } from './db'
import { setupIpcHandlers } from './ipcHandlers'

// Register privileged schemes
protocol.registerSchemesAsPrivileged([
  { scheme: 'app-img', privileges: { secure: true, standard: true, supportFetchAPI: true } }
])

// Initialize database and IPC handlers
initDb()
setupIpcHandlers()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.handle('app-img', (request) => {
    try {
      // For app-img:///C:/path, url is "app-img:///C:/path"
      // Replace protocol and handle leading slashes
      let path = decodeURIComponent(request.url.replace(/^app-img:\/+/i, ''))
      
      // On Windows, if we have "C/Users" instead of "C:/Users", fix it
      if (/^[a-zA-Z]\//.test(path)) {
        path = path[0] + ':' + path.slice(1)
      }
      
      console.log('Fetching image from path:', path)
      const fileUrl = pathToFileURL(path).toString()
      return net.fetch(fileUrl)
    } catch (err) {
      console.error('Protocol error:', err)
      return new Response('Image not found', { status: 404 })
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
