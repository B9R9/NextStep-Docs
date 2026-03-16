const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
}

export const toISODate = (value: string) => {
  if (!value) return ''
  const trimmed = value.trim()

  const isoDay = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDay) {
    const year = isoDay[1]
    const month = isoDay[2]
    const day = isoDay[3]
    if (!year || !month || !day) return ''
    return `${year}-${month}-${day}`
  }

  const isoDateTime = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/)
  if (isoDateTime) {
    const year = isoDateTime[1]
    const month = isoDateTime[2]
    const day = isoDateTime[3]
    if (!year || !month || !day) return ''
    return `${year}-${month}-${day}`
  }

  const named = trimmed.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})$/)
  if (named) {
    const dayRaw = named[1]
    const monthRaw = named[2]
    const year = named[3]
    if (!dayRaw || !monthRaw || !year) return ''
    const day = dayRaw.padStart(2, '0')
    const month = MONTH_MAP[monthRaw]
    if (!month) return ''
    return `${year}-${month}-${day}`
  }

  const dotted = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (dotted) {
    const day = dotted[1]
    const month = dotted[2]
    const year = dotted[3]
    if (!day || !month || !year) return ''
    return `${year}-${month}-${day}`
  }

  return ''
}

export const formatDateDDMMYYYY = (value: string) => {
  const iso = toISODate(value)
  if (!iso) return value ? value : '-'
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return '-'
  return `${day}.${month}.${year}`
}
