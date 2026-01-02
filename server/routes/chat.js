import express from 'express'
import { getAIResponse } from '../services/aiService.js'

const router = express.Router()

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body

        if (!message) {
            return res.status(400).json({
                success: false,
                error: '消息内容不能为空'
            })
        }

        const reply = await getAIResponse(message, history || [])

        res.json({
            success: true,
            reply
        })
    } catch (error) {
        console.error('Chat API Error:', error)
        res.status(500).json({
            success: false,
            error: '服务暂时不可用，请稍后再试'
        })
    }
})

export default router
