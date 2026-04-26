export const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yy = d.getFullYear().toString().slice(2)
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}
