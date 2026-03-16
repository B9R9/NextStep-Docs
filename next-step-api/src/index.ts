import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { authRoutes } from './routes/auth'
import { companiesRoutes } from './routes/companies'
import { jobsRoutes } from './routes/jobs'
import { applicationsRoutes } from './routes/applications'
import { calendarRoutes } from './routes/calendar'
import { notificationsRoutes } from './routes/notifications'
import { locationsRoutes } from './routes/locations'
import { authMiddleware } from './middleware/auth'

const app = express()
const startedAt = new Date()

function getApiVersion(): string {
  try {
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: string
    }
    return packageJson.version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

const apiVersion = getApiVersion()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.use((req, res, next) => {
  const startedAtMs = Date.now()
  const { method, originalUrl } = req
  const ip = req.ip || req.socket.remoteAddress || '-'

  res.on('finish', () => {
    const durationMs = Date.now() - startedAtMs
    const status = res.statusCode
    const userId = (req as any).user?.id ?? 'anonymous'
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    const line =
      `[${new Date().toISOString()}] ${method} ${originalUrl} ` +
      `${status} ${durationMs}ms ip=${ip} user=${userId}`

    if (level === 'error') {
      console.error(line)
    } else if (level === 'warn') {
      console.warn(line)
    } else {
      console.info(line)
    }
  })

  next()
})

app.get('/', (_req, res) =>
  res.json({
    name: 'next-step-api',
    status: 'ok',
    health: '/health'
  })
)

app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    version: apiVersion,
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString()
  })
)

app.use('/auth', authRoutes)
app.use('/companies', authMiddleware, companiesRoutes)
app.use('/jobs', authMiddleware, jobsRoutes)
app.use('/applications', authMiddleware, applicationsRoutes)
app.use('/calendar', authMiddleware, calendarRoutes)
app.use('/notifications', authMiddleware, notificationsRoutes)
app.use('/locations', locationsRoutes)

const port = Number(process.env.PORT || 3001)
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${port}`)
})
