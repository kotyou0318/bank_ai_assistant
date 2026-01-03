import OpenAI from 'openai'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load bank knowledge base
const knowledgePath = path.join(__dirname, '../data/bankKnowledge.json')
const bankKnowledge = JSON.parse(readFileSync(knowledgePath, 'utf-8'))

// Check if OpenAI API key is available
const hasOpenAIKey = !!process.env.OPENAI_API_KEY

// Initialize OpenAI client only if API key is available
let openai = null
if (hasOpenAIKey) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    console.log('✅ OpenAI API initialized')
} else {
    console.log('⚠️ OPENAI_API_KEY not set, using local knowledge base only')
}

const SYSTEM_PROMPT = `你是一位专业、友好的智能银行客服助手。你的职责是帮助客户解答银行业务相关问题。

## 你的特点：
- 专业：熟悉各类银行业务，包括开户、转账、贷款、信用卡、理财等
- 友好：使用亲切的语气与客户交流
- 耐心：详细解答客户疑问，必要时分步骤说明
- 安全意识：提醒客户注意账户安全，不要泄露密码等敏感信息

## 银行业务知识库：
${JSON.stringify(bankKnowledge, null, 2)}

## 回复规范：
1. 使用中文回复
2. 回答要简洁明了，重点突出
3. 如涉及具体操作，请分步骤说明
4. 如果问题超出你的知识范围，请建议客户拨打客服热线95588或前往网点咨询
5. 适当使用emoji让对话更加亲切
6. 涉及资金安全时，务必提醒客户注意防骗

请根据以上要求，回答客户的问题。`

export async function getAIResponse(message, history = []) {
    // First, try to find answer in local knowledge base
    const fallbackResponse = findFallbackAnswer(message)

    // If no OpenAI API key, use local knowledge base only
    if (!openai) {
        if (fallbackResponse) {
            return fallbackResponse
        }
        return "😊 感谢您的咨询！目前AI助手正在升级中，暂时无法回答您的问题。\n\n您可以：\n1. 尝试询问常见问题（如：开户、转账、贷款、信用卡等）\n2. 拨打客服热线 95588 获取人工服务\n3. 前往就近网点咨询"
    }

    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map(h => ({
                role: h.role,
                content: h.content
            })),
            { role: 'user', content: message }
        ]

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 800,
        })

        return completion.choices[0].message.content
    } catch (error) {
        console.error('OpenAI API Error:', error)

        // Fallback to knowledge base for common questions
        if (fallbackResponse) {
            return fallbackResponse
        }

        return "😊 抱歉，AI助手暂时遇到了一些问题。\n\n您可以：\n1. 稍后再试\n2. 拨打客服热线 95588\n3. 前往就近网点咨询"
    }
}

function findFallbackAnswer(message) {
    const lowerMessage = message.toLowerCase()

    for (const category of Object.values(bankKnowledge)) {
        for (const item of category.items) {
            for (const keyword of item.keywords) {
                if (lowerMessage.includes(keyword)) {
                    return item.answer
                }
            }
        }
    }

    return null
}
