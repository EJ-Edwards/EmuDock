const crypto = require('crypto')
const { saveToJsonFile, loadFromJsonFile } = require('./jsonfile')
const path = require('path')

/**
 * Hash a password using PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Salt for hashing (generated if not provided)
 * @returns {object} Object containing hash and salt
 */
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex')
  }
  
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  
  return { hash, salt }
}

/**
 * Verify a password against a stored hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored password hash
 * @param {string} salt - Salt used for the hash
 * @returns {boolean} True if password matches
 */
function verifyPassword(password, hash, salt) {
  const { hash: newHash } = hashPassword(password, salt)
  return hash === newHash
}

/**
 * Create a new user account
 * @param {string} userDataPath - Path to user data directory
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @param {object} additionalData - Additional user data
 * @returns {Promise<object>} Result with success status and message
 */
async function createUser(userDataPath, username, password, additionalData = {}) {
  try {
    const usersFile = path.join(userDataPath, 'users.json')
    const users = await loadFromJsonFile(usersFile, {})

    // Check if user already exists
    if (users[username]) {
      return { success: false, message: 'User already exists' }
    }

    // Hash the password
    const { hash, salt } = hashPassword(password)

    // Create user record
    users[username] = {
      username,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      ...additionalData
    }

    // Save to file
    const saved = await saveToJsonFile(usersFile, users)
    
    if (saved) {
      return { success: true, message: 'User created successfully', user: { username } }
    } else {
      return { success: false, message: 'Failed to save user data' }
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Authenticate a user
 * @param {string} userDataPath - Path to user data directory
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Promise<object>} Result with success status and user data
 */
async function authenticateUser(userDataPath, username, password) {
  try {
    const usersFile = path.join(userDataPath, 'users.json')
    const users = await loadFromJsonFile(usersFile, {})

    // Check if user exists
    if (!users[username]) {
      return { success: false, message: 'User not found' }
    }

    const user = users[username]

    // Verify password
    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt)

    if (isValid) {
      // Update last login
      user.lastLogin = new Date().toISOString()
      users[username] = user
      await saveToJsonFile(usersFile, users)

      // Return user data without sensitive info
      const { passwordHash, passwordSalt, ...safeUserData } = user
      
      return { 
        success: true, 
        message: 'Authentication successful', 
        user: safeUserData 
      }
    } else {
      return { success: false, message: 'Invalid password' }
    }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update user profile data
 * @param {string} userDataPath - Path to user data directory
 * @param {string} username - Username
 * @param {object} updates - Data to update
 * @returns {Promise<object>} Result with success status
 */
async function updateUser(userDataPath, username, updates) {
  try {
    const usersFile = path.join(userDataPath, 'users.json')
    const users = await loadFromJsonFile(usersFile, {})

    if (!users[username]) {
      return { success: false, message: 'User not found' }
    }

    // Prevent updating sensitive fields
    const { passwordHash, passwordSalt, username: _, ...safeUpdates } = updates

    users[username] = {
      ...users[username],
      ...safeUpdates,
      updatedAt: new Date().toISOString()
    }

    const saved = await saveToJsonFile(usersFile, users)
    
    if (saved) {
      const { passwordHash, passwordSalt, ...safeUserData } = users[username]
      return { success: true, message: 'User updated successfully', user: safeUserData }
    } else {
      return { success: false, message: 'Failed to update user' }
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Change user password
 * @param {string} userDataPath - Path to user data directory
 * @param {string} username - Username
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Result with success status
 */
async function changePassword(userDataPath, username, oldPassword, newPassword) {
  try {
    const usersFile = path.join(userDataPath, 'users.json')
    const users = await loadFromJsonFile(usersFile, {})

    if (!users[username]) {
      return { success: false, message: 'User not found' }
    }

    const user = users[username]

    // Verify old password
    const isValid = verifyPassword(oldPassword, user.passwordHash, user.passwordSalt)

    if (!isValid) {
      return { success: false, message: 'Current password is incorrect' }
    }

    // Hash new password
    const { hash, salt } = hashPassword(newPassword)

    users[username] = {
      ...user,
      passwordHash: hash,
      passwordSalt: salt,
      passwordChangedAt: new Date().toISOString()
    }

    const saved = await saveToJsonFile(usersFile, users)
    
    return saved 
      ? { success: true, message: 'Password changed successfully' }
      : { success: false, message: 'Failed to change password' }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Delete a user account
 * @param {string} userDataPath - Path to user data directory
 * @param {string} username - Username
 * @param {string} password - Password for confirmation
 * @returns {Promise<object>} Result with success status
 */
async function deleteUser(userDataPath, username, password) {
  try {
    const usersFile = path.join(userDataPath, 'users.json')
    const users = await loadFromJsonFile(usersFile, {})

    if (!users[username]) {
      return { success: false, message: 'User not found' }
    }

    const user = users[username]

    // Verify password
    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt)

    if (!isValid) {
      return { success: false, message: 'Invalid password' }
    }

    // Delete user
    delete users[username]

    const saved = await saveToJsonFile(usersFile, users)
    
    return saved 
      ? { success: true, message: 'User deleted successfully' }
      : { success: false, message: 'Failed to delete user' }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get user profile (without sensitive data)
 * @param {string} userDataPath - Path to user data directory
 * @param {string} username - Username
 * @returns {Promise<object>} User data or null
 */
async function getUser(userDataPath, username) {
  try {
    const usersFile = path.join(userDataPath, 'users.json')
    const users = await loadFromJsonFile(usersFile, {})

    if (!users[username]) {
      return null
    }

    const { passwordHash, passwordSalt, ...safeUserData } = users[username]
    return safeUserData
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  createUser,
  authenticateUser,
  updateUser,
  changePassword,
  deleteUser,
  getUser
}
