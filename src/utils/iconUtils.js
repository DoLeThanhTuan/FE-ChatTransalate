import { Icons } from '@/config/icon'

const getIconById = (id) => {
  const icon = Icons.find((i) => i.id === id)
  if (icon) {
    return icon
  }
  return null
}

const getIconsByCategory = (category) => {
  const icons = Icons.filter((i) => i.category === category)
  return icons
}

const getIcons = () => {
  return Icons
}

const getIconsPriority = () => {
  return Icons.filter((i) => i.priority == true)
}

const searchByLikeKey = (keyWord) => {
  return Icons.filter((i) =>
    i.key.toLowerCase().includes(keyWord.toLowerCase())
  )
}

const searchByCategoryAndLikeKey = (category, keyWord) => {
  return Icons.filter(
    (i) =>
      i.key.toLowerCase().includes(keyWord.toLowerCase()) &&
      i.category == category
  )
}

export {
  getIconById,
  getIconsByCategory,
  getIcons,
  getIconsPriority,
  searchByLikeKey,
  searchByCategoryAndLikeKey,
}
