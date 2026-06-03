export function formatNumberWithSpaces(value: number | string) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return String(value)
  }

  const [integerPart = '0', fractionPart] = number.toString().split('.')
  const sign = integerPart.startsWith('-') ? '-' : ''
  const digits = sign ? integerPart.slice(1) : integerPart
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return fractionPart ? `${sign}${grouped}.${fractionPart}` : `${sign}${grouped}`
}

export function formatKzt(value: number | string) {
  return `${formatNumberWithSpaces(value)} ₸`
}
