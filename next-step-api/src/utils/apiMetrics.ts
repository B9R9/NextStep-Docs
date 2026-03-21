interface RouteMetric {
  count: number
  errors4xx: number
  errors5xx: number
  totalMs: number
  maxMs: number
}

const metrics: Record<string, RouteMetric> = {}
let since = new Date()

export function recordRequest(method: string, path: string, status: number, durationMs: number) {
  const normalized = `${method} ${path.replace(/\/\d+/g, '/:id')}`
  if (!metrics[normalized]) {
    metrics[normalized] = { count: 0, errors4xx: 0, errors5xx: 0, totalMs: 0, maxMs: 0 }
  }
  const m = metrics[normalized]
  m.count++
  m.totalMs += durationMs
  if (durationMs > m.maxMs) m.maxMs = durationMs
  if (status >= 400 && status < 500) m.errors4xx++
  if (status >= 500) m.errors5xx++
}

export function getMetrics() {
  return {
    since: since.toISOString(),
    routes: Object.entries(metrics).map(([route, m]) => ({
      route,
      count: m.count,
      errors4xx: m.errors4xx,
      errors5xx: m.errors5xx,
      avgMs: m.count > 0 ? Math.round(m.totalMs / m.count) : 0,
      maxMs: m.maxMs,
      errorRate: m.count > 0 ? parseFloat(((m.errors4xx + m.errors5xx) / m.count).toFixed(4)) : 0,
    })).sort((a, b) => b.count - a.count),
  }
}

export function resetMetrics() {
  Object.keys(metrics).forEach((k) => delete metrics[k])
  since = new Date()
}
