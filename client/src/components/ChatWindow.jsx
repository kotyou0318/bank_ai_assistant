import './ChatWindow.css'
import MessageBubble from './MessageBubble'

function ChatWindow({ messages, isLoading, messagesEndRef }) {
    return (
        <div className="chat-window">
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
                <div className="typing-indicator">
                    <div className="message-avatar">🏦</div>
                    <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    )
}

export default ChatWindow
