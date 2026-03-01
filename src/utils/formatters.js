export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') {
    return '$0.00'
  }

  const number = Number(value)

  if (isNaN(number)) return '$0.00'

  return number.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })
}