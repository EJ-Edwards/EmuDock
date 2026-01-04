const path = require('path')
const { app } = require('electron')
const { saveToJsonFile, loadFromJsonFile, updateJsonFile } = require('./jsonfile')
const userAuth = require('./userauth')

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

// User authentication functions
async function createUser(username, password, additionalData) {
  return await userAuth.createUser(getUserDataPath(), username, password, additionalData)
}

async function authenticateUser(username, password) {
  return await userAuth.authenticateUser(getUserDataPath(), username, password)
}

async function updateUser(username, updates) {
  return await userAuth.updateUser(getUserDataPath(), username, updates)
}

async function changePassword(username, oldPassword, newPassword) {
  return await userAuth.changePassword(getUserDataPath(), username, oldPassword, newPassword)
}

async function deleteUser(username, password) {
  return await userAuth.deleteUser(getUserDataPath(), username, password)
}

async function getUser(username) {
  return await userAuth.getUser(getUserDataPath(), username)
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
