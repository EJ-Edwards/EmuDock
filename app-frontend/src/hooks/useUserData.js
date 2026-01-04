import { useState, useEffect } from 'react'

/**
 * React hook for managing user data with local persistence
 * @param {boolean} autoLoad - Automatically load data on mount
 * @returns {Object} User data state and operations
 */
export function useUserData(autoLoad = true) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load user data on mount
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [autoLoad])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await window.electronAPI.loadUserData()
      setUserData(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Failed to load user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const success = await window.electronAPI.saveUserData(data)
      if (success) {
        setUserData(data)
      }
      return success
    } catch (err) {
      setError(err.message)
      console.error('Failed to save user data:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateData = async (updates) => {
    setLoading(true)
    setError(null)
    try {
      const success = await window.electronAPI.updateUserData(updates)
      if (success) {
        setUserData(prev => ({ ...prev, ...updates }))
      }
      return success
    } catch (err) {
      setError(err.message)
      console.error('Failed to update user data:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteData = async () => {
    setLoading(true)
    setError(null)
    try {
      const success = await window.electronAPI.deleteUserData()
      if (success) {
        setUserData({})
      }
      return success
    } catch (err) {
      setError(err.message)
      console.error('Failed to delete user data:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    userData,
    loading,
    error,
    loadData,
    saveData,
    updateData,
    deleteData
  }
}

/**
 * Hook for managing game library data
 */
export function useGameData() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await window.electronAPI.loadGameData()
      setGames(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Failed to load games:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveGames = async (gameData) => {
    setLoading(true)
    setError(null)
    try {
      const success = await window.electronAPI.saveGameData(gameData)
      if (success) {
        setGames(gameData)
      }
      return success
    } catch (err) {
      setError(err.message)
      console.error('Failed to save games:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const addGame = async (game) => {
    const newGames = [...games, { ...game, id: Date.now() }]
    return await saveGames(newGames)
  }

  const removeGame = async (gameId) => {
    const newGames = games.filter(g => g.id !== gameId)
    return await saveGames(newGames)
  }

  return {
    games,
    loading,
    error,
    loadGames,
    saveGames,
    addGame,
    removeGame
  }
}

/**
 * Hook for managing app settings
 */
export function useSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await window.electronAPI.loadSettings()
      setSettings(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings) => {
    setLoading(true)
    setError(null)
    try {
      const success = await window.electronAPI.saveSettings(newSettings)
      if (success) {
        setSettings(newSettings)
      }
      return success
    } catch (err) {
      setError(err.message)
      console.error('Failed to save settings:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value }
    return await saveSettings(updated)
  }

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    updateSetting
  }
}
