const path = require('path')
const { app } = require('electron')
const { saveToJsonFile, loadFromJsonFile, updateJsonFile } = require('./jsonfile')

/**
 * Get the user data directory for storing JSON files
 */
function getUserDataPath(filename = '') {
  return filename ? path.join(app.getPath('userData'), filename) : app.getPath('userData')
}

/**
 * Save data to JSON file
 */
async function saveToJSON(filename, data) {
  try {
    const filePath = getUserDataPath(filename)
    return await saveToJsonFile(filePath, data)
  } catch (error) {
    console.error('Error saving to JSON:', error)
    return false
  }
}

/**
 * Load data from JSON file
 */
async function loadFromJSON(filename, defaultValue = null) {
  try {
    const filePath = getUserDataPath(filename)
    return await loadFromJsonFile(filePath, defaultValue)
  } catch (error) {
    console.error('Error loading from JSON:', error)
    return defaultValue
  }
}

/**
 * Update JSON file with new data
 */
async function updateJSON(filename, updates, merge = true) {
  try {
    const filePath = getUserDataPath(filename)
    return await updateJsonFile(filePath, updates, merge)
  } catch (error) {
    console.error('Error updating JSON:', error)
    return false
  }
}

// Note: User authentication now handled by Firebase Auth in frontend
// These functions are deprecated but kept for backwards compatibility
async function createUser(username, password, additionalData) {
  console.warn('createUser: Use Firebase Auth instead')
  return { success: false, message: 'Use Firebase Auth' }
}

async function authenticateUser(username, password) {
  console.warn('authenticateUser: Use Firebase Auth instead')
  return { success: false, message: 'Use Firebase Auth' }
}

async function updateUser(username, updates) {
  console.warn('updateUser: Use Firebase Auth instead')
  return { success: false, message: 'Use Firebase Auth' }
}

async function changePassword(username, oldPassword, newPassword) {
  console.warn('changePassword: Use Firebase Auth instead')
  return { success: false, message: 'Use Firebase Auth' }
}

async function deleteUser(username, password) {
  console.warn('deleteUser: Use Firebase Auth instead')
  return { success: false, message: 'Use Firebase Auth' }
}

async function getUser(username) {
  console.warn('getUser: Use Firebase Auth instead')
  return { success: false, message: 'Use Firebase Auth' }
}

module.exports = {
  getUserDataPath,
  saveToJSON,
  loadFromJSON,
  updateJSON,
  createUser,
  authenticateUser,
  updateUser,
  changePassword,
  deleteUser,
  getUser
}
