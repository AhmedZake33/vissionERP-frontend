const pad = value => String(value).padStart(2, '0')

export const formatDate = value => {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return `${pad(date.getDate())} / ${pad(date.getMonth() + 1)} / ${date.getFullYear()}`
}

export const formatDateTime = value => {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
