const localStorageUtils = {
    set(key, value) {
      try {
        const stringValue = JSON.stringify(value)
        localStorage.setItem(key, stringValue)
      } catch (error) {
        console.error(`Error saving to localStorage with key "${key}"`, error)
      }
    },
  
    get(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key)
        if (value === null) return defaultValue
        return JSON.parse(value)
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
    }
  }
  
  export default localStorageUtils
  