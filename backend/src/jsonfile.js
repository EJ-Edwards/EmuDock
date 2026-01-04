const fs = require('fs').promises
const path = require('path')

/**
 * Save data to a JSON file locally
 * @param {string} filePath - Path where the JSON file should be saved
 * @param {any} data - Data to save (object, array, or any JSON-serializable data)
 * @param {number} indent - Number of spaces for indentation (default: 2)
 * @returns {Promise<boolean>} True if save was successful
 */
async function saveToJsonFile(filePath, data, indent = 2) {
  if (!filePath.endsWith('.json')) {
    throw new Error('File path must end with .json')
  }

  try {
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath)
    if (directory) {
      await fs.mkdir(directory, { recursive: true })
    }

    // Write data to JSON file
    await fs.writeFile(filePath, JSON.stringify(data, null, indent), 'utf-8')
    return true
  } catch (error) {
    console.error(`Error saving to JSON file: ${error.message}`)
    return false
  }
}

/**
 * Load data from a JSON file
 * @param {string} filePath - Path to the JSON file to load
 * @param {any} defaultValue - Default value to return if file doesn't exist
 * @returns {Promise<any>} Loaded data from JSON file, or default value
 */
async function loadFromJsonFile(filePath, defaultValue = null) {
  if (!filePath.endsWith('.json')) {
    throw new Error('File path must end with .json')
  }

  try {
    // Check if file exists
    await fs.access(filePath)
    
    // Read and parse JSON file
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return default value
      return defaultValue
    }
    console.error(`Error loading JSON file: ${error.message}`)
    return defaultValue
  }
}

/**
 * Update an existing JSON file with new data
 * @param {string} filePath - Path to the JSON file to update
 * @param {object} updates - Object with updates to apply
 * @param {boolean} merge - If true, merge with existing data; if false, replace
 * @returns {Promise<boolean>} True if update was successful
 */
async function updateJsonFile(filePath, updates, merge = true) {
  try {
    let data = updates

    if (merge) {
      const existing = await loadFromJsonFile(filePath, {})
      if (typeof existing === 'object' && !Array.isArray(existing) && typeof updates === 'object' && !Array.isArray(updates)) {
        data = { ...existing, ...updates }
      }
    }

    return await saveToJsonFile(filePath, data)
  } catch (error) {
    console.error(`Error updating JSON file: ${error.message}`)
    return false
  }
}

/**
 * Delete a JSON file if it exists
 * @param {string} filePath - Path to the JSON file to delete
 * @returns {Promise<boolean>} True if deletion was successful or file didn't exist
 */
async function deleteJsonFile(filePath) {
  try {
    await fs.unlink(filePath)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, consider it successful
      return true
    }
    console.error(`Error deleting JSON file: ${error.message}`)
    return false
  }
}

/**
 * Check if a JSON file exists
 * @param {string} filePath - Path to the JSON file to check
 * @returns {Promise<boolean>} True if file exists
 */
async function jsonFileExists(filePath) {
  try {
    await fs.access(filePath)
    return filePath.endsWith('.json')
  } catch {
    return false
  }
}

module.exports = {
  saveToJsonFile,
  loadFromJsonFile,
  updateJsonFile,
  deleteJsonFile,
  jsonFileExists
}
