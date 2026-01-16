const localStorageUtils = {
  set(key, value) {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error saving to localStorage with key "${key}"`, error)
    }
  },

  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return defaultValue

      try {
        return JSON.parse(value)
      } catch {
        // value là string thường
        return value
      }
    } catch (error) {
      console.error(`Error reading from localStorage with key "${key}"`, error)
      return defaultValue
    }
  },

  remove(key) {
    localStorage.removeItem(key)
  },

  clear() {
    localStorage.clear()
  },

  has(key) {
    return localStorage.getItem(key) !== null
  },
}

export default localStorageUtils
