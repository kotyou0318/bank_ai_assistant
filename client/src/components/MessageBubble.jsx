function MessageBubble({ message }) {
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatContent = (content) => {
        return content.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
            </span>
        ))
    }

    return (
        <div className={`message ${message.role}`}>
            <div className="message-avatar">
                {message.role === 'user' ? '👤' : '🏦'}
            </div>
            <div className="message-bubble">
                <div className="message-content">
                    {formatContent(message.content)}
                </div>
                <div className="message-time">
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    )
}

export default MessageBubble
