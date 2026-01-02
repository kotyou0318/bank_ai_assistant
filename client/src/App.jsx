import { useState, useRef, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import QuickActions from './components/QuickActions'

function App() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: '您好！欢迎使用智能银行客服助手 🏦\n\n我可以为您提供以下服务：\n• 账户查询与开户指导\n• 转账汇款操作说明\n• 贷款产品咨询\n• 信用卡业务\n• 理财产品介绍\n\n请问有什么可以帮助您的？',
            timestamp: new Date()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (content) => {
        if (!content.trim() || isLoading) return

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content.trim(),
                    history: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            })

            const data = await response.json()

            if (data.success) {
                const assistantMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, assistantMessage])
            } else {
                throw new Error(data.error || '服务暂时不可用')
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '抱歉，服务暂时出现问题，请稍后再试。如有紧急业务，请拨打客服热线：95588',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuickAction = (question) => {
        sendMessage(question)
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">🏦</div>
                        <div className="logo-text">
                            <h1>智能银行客服</h1>
                            <span className="status-badge">
                                <span className="status-dot"></span>
                                在线服务中
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="chat-container">
                    <QuickActions onAction={handleQuickAction} />
                    <ChatWindow
                        messages={messages}
                        isLoading={isLoading}
                        messagesEndRef={messagesEndRef}
                    />
                    <div className="input-container">
                        <MessageInput onSend={sendMessage} isLoading={isLoading} />
                    </div>
                </div>
            </main>

            <footer className="app-footer">
                <p>© 2026 智能银行客服助手 | 7×24小时为您服务</p>
            </footer>
        </div>
    )
}

function MessageInput({ onSend, isLoading }) {
    const [input, setInput] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (input.trim() && !isLoading) {
            onSend(input)
            setInput('')
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <form className="message-input-form" onSubmit={handleSubmit}>
            <textarea
                className="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入您的问题..."
                rows={1}
                disabled={isLoading}
            />
            <button
                type="submit"
                className="send-button"
                disabled={!input.trim() || isLoading}
            >
                {isLoading ? (
                    <span className="loading-spinner"></span>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                )}
            </button>
        </form>
    )
}

export default App
