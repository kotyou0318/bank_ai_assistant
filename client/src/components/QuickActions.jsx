const quickActions = [
    { icon: '💳', text: '如何开户？' },
    { icon: '💸', text: '转账限额是多少？' },
    { icon: '🏠', text: '贷款利率查询' },
    { icon: '💰', text: '理财产品推荐' },
    { icon: '🔒', text: '密码修改' },
    { icon: '📱', text: '手机银行开通' },
]

function QuickActions({ onAction }) {
    return (
        <div className="quick-actions">
            {quickActions.map((action, index) => (
                <button
                    key={index}
                    className="quick-action-btn"
                    onClick={() => onAction(action.text)}
                >
                    <span className="icon">{action.icon}</span>
                    <span>{action.text}</span>
                </button>
            ))}
        </div>
    )
}

export default QuickActions
