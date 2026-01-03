import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import chatRouter from './routes/chat.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api', chatRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, 'public')
    console.log(`📁 Static files path: ${staticPath}`)

    app.use(express.static(staticPath))

    app.get('*', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'))
    })
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏦 Bank Customer Service API running on port ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

