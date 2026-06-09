export const buildChronicIllnessOptions = (values, translate) => (
  (values || []).map(value => ({
    value,
    text: translate(`client.chronicIllnessOptions.${value}`),
  }))
)

export const formatChronicIllnesses = (values, translate, fallback) => {
  if (!Array.isArray(values) || !values.length) {
    return fallback
  }

  return values
    .map(value => translate(`client.chronicIllnessOptions.${value}`))
    .join(', ')
}