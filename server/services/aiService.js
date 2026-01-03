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

// Greeting patterns and responses
const greetings = {
    patterns: ['你好', '您好', '嗨', 'hi', 'hello', '早上好', '下午好', '晚上好', '在吗', '在不在'],
    response: '👋 您好！欢迎使用智能银行客服！\n\n我可以帮您解答以下问题：\n📋 账户服务（开户、销户、密码）\n💸 转账汇款（转账、限额、手续费）\n🏠 贷款服务（利率、房贷）\n💳 信用卡（申请、提额）\n💰 理财服务（理财产品、存款）\n📱 电子银行（手机银行）\n\n请问有什么可以帮您的？'
}

const helpPatterns = {
    patterns: ['帮助', '功能', '能做什么', '有什么功能', '怎么用', '问题', '咨询'],
    response: '🏦 **智能银行客服助手**\n\n我可以帮您解答以下问题：\n\n1️⃣ **账户服务** - 开户、销户、修改密码\n2️⃣ **转账汇款** - 转账方式、限额、手续费\n3️⃣ **贷款服务** - 贷款利率、房贷办理\n4️⃣ **信用卡** - 申请信用卡、提升额度\n5️⃣ **理财服务** - 理财产品、定期存款\n6️⃣ **电子银行** - 手机银行开通\n7️⃣ **安全提醒** - 防范金融诈骗\n\n💡 您可以直接输入关键词，如"开户"、"转账"、"贷款"等'
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
    const lowerMessage = message.toLowerCase()

    // Check for greetings first
    for (const pattern of greetings.patterns) {
        if (lowerMessage.includes(pattern)) {
            return greetings.response
        }
    }

    // Check for help requests
    for (const pattern of helpPatterns.patterns) {
        if (lowerMessage.includes(pattern)) {
            return helpPatterns.response
        }
    }

    // Try to find answer in local knowledge base
    const fallbackResponse = findFallbackAnswer(message)

    // If no OpenAI API key, use local knowledge base only
    if (!openai) {
        if (fallbackResponse) {
            return fallbackResponse
        }
        return getDefaultResponse()
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
        console.error('OpenAI API Error:', error.message || error)

        // Fallback to knowledge base for common questions
        if (fallbackResponse) {
            return fallbackResponse
        }

        return getDefaultResponse()
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

function getDefaultResponse() {
    return `🤔 抱歉，我暂时无法理解您的问题。

**您可以尝试以下方式：**

1️⃣ 输入关键词查询，例如：
   • 输入"开户"了解开户流程
   • 输入"转账"了解转账方式
   • 输入"贷款"了解贷款信息
   • 输入"信用卡"了解信用卡服务

2️⃣ 联系人工客服：
   📞 客服热线：95588
   🏦 前往就近网点咨询

💡 输入"帮助"查看更多功能`
}
