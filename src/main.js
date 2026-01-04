const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const IPC = require('../shared/ipc')
const backend = require('../backend/src/index')

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
const rendererDist = path.join(__dirname, '..', 'app-frontend', 'dist')

let mainWindow

async function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    await mainWindow.loadFile(path.join(rendererDist, 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers for data persistence
ipcMain.handle(IPC.SAVE_USER_DATA, async (event, data) => {
  return await backend.saveToJSON('userdata.json', data)
})

ipcMain.handle(IPC.LOAD_USER_DATA, async () => {
  return await backend.loadFromJSON('userdata.json', {})
})

ipcMain.handle(IPC.UPDATE_USER_DATA, async (event, updates) => {
  return await backend.updateJSON('userdata.json', updates, true)
})

ipcMain.handle(IPC.DELETE_USER_DATA, async () => {
  return await backend.saveToJSON('userdata.json', {})
})

ipcMain.handle(IPC.CHECK_DATA_EXISTS, async () => {
  const data = await backend.loadFromJSON('userdata.json', null)
  return data !== null
})

ipcMain.handle(IPC.SAVE_GAME_DATA, async (event, gameData) => {
  return await backend.saveToJSON('games.json', gameData)
})

ipcMain.handle(IPC.LOAD_GAME_DATA, async () => {
  return await backend.loadFromJSON('games.json', [])
})

ipcMain.handle(IPC.SAVE_SETTINGS, async (event, settings) => {
  return await backend.saveToJSON('settings.json', settings)
})

ipcMain.handle(IPC.LOAD_SETTINGS, async () => {
  return await backend.loadFromJSON('settings.json', {})
})

// IPC Handlers for user authentication
ipcMain.handle(IPC.CREATE_USER, async (event, { username, password, additionalData }) => {
  return await backend.createUser(username, password, additionalData)
})

ipcMain.handle(IPC.AUTHENTICATE_USER, async (event, { username, password }) => {
  return await backend.authenticateUser(username, password)
})

ipcMain.handle(IPC.UPDATE_USER_PROFILE, async (event, { username, updates }) => {
  return await backend.updateUser(username, updates)
})

ipcMain.handle(IPC.CHANGE_PASSWORD, async (event, { username, oldPassword, newPassword }) => {
  return await backend.changePassword(username, oldPassword, newPassword)
})

ipcMain.handle(IPC.DELETE_USER_ACCOUNT, async (event, { username, password }) => {
  return await backend.deleteUser(username, password)
})

ipcMain.handle(IPC.GET_USER_PROFILE, async (event, { username }) => {
  return await backend.getUser(username)
})