const { contextBridge, ipcRenderer } = require('electron')
const IPC = require('../shared/ipc')

/**
 * Expose a safe API to the renderer via contextBridge
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // User data operations
  saveUserData: (data) => ipcRenderer.invoke(IPC.SAVE_USER_DATA, data),
  loadUserData: () => ipcRenderer.invoke(IPC.LOAD_USER_DATA),
  updateUserData: (updates) => ipcRenderer.invoke(IPC.UPDATE_USER_DATA, updates),
  deleteUserData: () => ipcRenderer.invoke(IPC.DELETE_USER_DATA),
  checkDataExists: () => ipcRenderer.invoke(IPC.CHECK_DATA_EXISTS),
  
  // Game library operations
  saveGameData: (gameData) => ipcRenderer.invoke(IPC.SAVE_GAME_DATA, gameData),
  loadGameData: () => ipcRenderer.invoke(IPC.LOAD_GAME_DATA),
  
  // Settings operations
  saveSettings: (settings) => ipcRenderer.invoke(IPC.SAVE_SETTINGS, settings),
  loadSettings: () => ipcRenderer.invoke(IPC.LOAD_SETTINGS),
  
  // User authentication operations
  createUser: (username, password, additionalData) => 
    ipcRenderer.invoke(IPC.CREATE_USER, { username, password, additionalData }),
  authenticateUser: (username, password) => 
    ipcRenderer.invoke(IPC.AUTHENTICATE_USER, { username, password }),
  updateUserProfile: (username, updates) => 
    ipcRenderer.invoke(IPC.UPDATE_USER_PROFILE, { username, updates }),
  changePassword: (username, oldPassword, newPassword) => 
    ipcRenderer.invoke(IPC.CHANGE_PASSWORD, { username, oldPassword, newPassword }),
  deleteUserAccount: (username, password) => 
    ipcRenderer.invoke(IPC.DELETE_USER_ACCOUNT, { username, password }),
  getUserProfile: (username) => 
    ipcRenderer.invoke(IPC.GET_USER_PROFILE, { username }),
})
