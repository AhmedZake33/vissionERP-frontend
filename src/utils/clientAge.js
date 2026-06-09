export const calculateAgeFromBirthDate = (value, fallback = null) => {
  if (!value) {
    return fallback
  }

  const birthDate = new Date(value)

  if (Number.isNaN(birthDate.getTime())) {
    return fallback
  }

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age >= 0 ? age : fallback
}

export const formatAgeFromBirthDate = (value, translate, fallback = null) => {
  const age = calculateAgeFromBirthDate(value, null)

  if (age === null) {
    return fallback
  }

  return `${age} ${translate('client.ageUnit')}`
}