import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
    const { user, fetchProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [actions, setActions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Initial welcome message
    useEffect(() => {
        setMessages([{
            role: 'assistant',
            content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your AI Study Abroad Counsellor.\n\n**I can help you with:**\n- 🎓 University recommendations tailored to your profile\n- ⭐ Shortlisting universities (Dream, Target, Safe)\n- ✅ Adding tasks to your to-do list\n- 📋 Application strategy and preparation tips\n\n**Try saying:**\n- "Add a task to prepare my SOP"\n- "Shortlist MIT for me"\n- "What should I do next?"\n\nHow can I assist you today?`,
        }]);
    }, [user]);

    const loadConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response.data.conversations || []);
        } catch (err) {
            console.error('Failed to load conversations');
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);
        setActions([]);

        // Add empty assistant message that will be filled via streaming
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '',
            isStreaming: true
        }]);
        setIsStreaming(true);

        try {
            await chatAPI.sendMessageStream(
                userMessage,
                conversationId,
                // onChunk - called for each text chunk
                (chunk, convId) => {
                    if (convId) setConversationId(convId);
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMsg = updated[updated.length - 1];
                        if (lastMsg && lastMsg.isStreaming) {
                            lastMsg.content += chunk;
                        }
                        return updated;
                    });
                },
                // onDone - called when streaming is complete
                (fullContent, convId, responseActions) => {
                    if (convId) setConversationId(convId);
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMsg = updated[updated.length - 1];
                        if (lastMsg && lastMsg.isStreaming) {
                            lastMsg.isStreaming = false;
                            lastMsg.content = fullContent;
                            lastMsg.actions = responseActions;
                        }
                        return updated;
                    });
                    setIsStreaming(false);
                    setLoading(false);
                    loadConversations(); // Refresh conversation list
                },
                // onError
                (error) => {
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMsg = updated[updated.length - 1];
                        if (lastMsg && lastMsg.isStreaming) {
                            lastMsg.isStreaming = false;
                            lastMsg.content = 'Sorry, I encountered an error. Please try again.';
                            lastMsg.isError = true;
                        }
                        return updated;
                    });
                    setIsStreaming(false);
                    setLoading(false);
                },
                // onAction - called when AI executes an action
                (actionData) => {
                    setActions(prev => [...prev, actionData]);
                    // Refresh user context if profile was updated
                    if (actionData.action === 'profile_updated' && actionData.success) {
                        fetchProfile();
                    }
                }
            );
        } catch (err) {
            setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                    lastMsg.isStreaming = false;
                    lastMsg.content = 'Sorry, I encountered an error. Please try again.';
                    lastMsg.isError = true;
                }
                return updated;
            });
            setIsStreaming(false);
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startNewChat = async () => {
        // Optimistic UI update - instant response
        const tempId = Date.now();
        setConversationId(tempId);
        setMessages([{
            role: 'assistant',
            content: `Starting a new conversation! How can I help you today, ${user?.name?.split(' ')[0]}?`,
        }]);
        setActions([]);
        setShowSidebar(false);

        // Background API call
        try {
            const response = await chatAPI.createConversation();
            setConversationId(response.data.conversation_id);
            loadConversations();
        } catch (err) {
            console.error('Failed to create conversation');
        }
    };

    const loadChat = async (convId) => {
        // Optimistic: switch immediately, show loading state in messages
        setConversationId(convId);
        setActions([]);
        setShowSidebar(false);

        try {
            const response = await chatAPI.loadConversation(convId);
            const history = response.data.messages || [];
            if (history.length > 0) {
                setMessages(history.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })));
            } else {
                setMessages([{
                    role: 'assistant',
                    content: 'Continuing our conversation. How can I help?'
                }]);
            }
        } catch (err) {
            console.error('Failed to load conversation');
            setMessages([{
                role: 'assistant',
                content: 'Failed to load conversation. Please try again.'
            }]);
        }
    };

    const deleteChat = async (convId, e) => {
        e.stopPropagation();

        // Optimistic UI - remove immediately
        setConversations(prev => prev.filter(c => c.id !== convId));

        if (conversationId === convId) {
            // Start new chat optimistically
            const tempId = Date.now();
            setConversationId(tempId);
            setMessages([{
                role: 'assistant',
                content: `Starting fresh! How can I help you, ${user?.name?.split(' ')[0]}?`,
            }]);
            setActions([]);
        }

        // Background API call
        try {
            await chatAPI.deleteConversation(convId);
            loadConversations(); // Sync with server
        } catch (err) {
            console.error('Failed to delete conversation');
            loadConversations(); // Restore from server on error
        }
    };

    const quickPrompts = [
        "Recommend universities for me",
        "Add a task to prepare my SOP",
        "Shortlist Harvard for me",
        "What should I do next?",
    ];

    return (
        <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] -mx-4 md:-mx-6 lg:-mx-8">
            {/* Sidebar - Conversations */}
            <div className={`
                fixed md:relative inset-y-0 left-0 z-40 w-72 bg-dark-900 border-r border-white/10
                transform transition-transform duration-300 ease-in-out
                ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                md:flex flex-col
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-white/10">
                    <button
                        onClick={startNewChat}
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">+</span>
                        New Chat
                    </button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => loadChat(conv.id)}
                            className={`
                                group p-3 rounded-lg cursor-pointer transition
                                ${conversationId === conv.id
                                    ? 'bg-primary/20 border border-primary/30'
                                    : 'hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm truncate flex-1">
                                    {conv.preview || 'New chat'}
                                </p>
                                <button
                                    onClick={(e) => deleteChat(conv.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition p-1"
                                >
                                    🗑️
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {conv.message_count} messages
                            </p>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No conversations yet
                        </p>
                    )}
                </div>
            </div>

            {/* Mobile sidebar backdrop */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-dark-800/50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
                        >
                            ☰
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xl">
                            🤖
                        </div>
                        <div>
                            <h2 className="font-semibold">AI Counsellor</h2>
                            <p className="text-xs text-gray-500">
                                {isStreaming ? '✨ Acting...' : loading ? '🤔 Thinking...' : '🟢 Online'}
                            </p>
                        </div>
                    </div>
                    <button onClick={startNewChat} className="btn btn-ghost text-sm">
                        + New Chat
                    </button>
                </div>

                {/* Action Notifications (real-time) */}
                {actions.length > 0 && (
                    <div className="px-4 md:px-6 py-2 bg-dark-800/80 border-b border-white/10">
                        <div className="flex flex-wrap gap-2">
                            {actions.map((action, idx) => (
                                <ActionBadge key={idx} action={action} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[75%] animate-slide-up ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-br-md'
                                : msg.isError
                                    ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl rounded-bl-md'
                                    : 'bg-white/5 border border-white/10 rounded-2xl rounded-bl-md'
                                } px-4 py-3`}>
                                <div className="text-sm md:text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                                    {msg.role === 'user' ? (
                                        <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                                    ) : (
                                        <>
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                                    code: ({ node, inline, ...props }) =>
                                                        inline ? (
                                                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props} />
                                                        ) : (
                                                            <code className="block bg-white/10 p-3 rounded-lg text-sm overflow-x-auto" {...props} />
                                                        ),
                                                    a: ({ node, ...props }) => <a className="text-primary-light hover:underline" {...props} />,
                                                }}
                                            >
                                                {msg.content || ''}
                                            </ReactMarkdown>
                                            {/* Blinking cursor while streaming */}
                                            {msg.isStreaming && (
                                                <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Action Cards inline with message */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                        {msg.actions.map((action, i) => (
                                            <ActionCard key={i} action={action} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator before streaming starts */}
                    {loading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts (show when no user messages) */}
                {messages.filter(m => m.role === 'user').length === 0 && !loading && (
                    <div className="px-4 md:px-6 pb-4">
                        <p className="text-sm text-gray-500 mb-2">Try these:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(prompt)}
                                    className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-white/10 bg-dark-800/80 backdrop-blur-xl p-4 md:p-6">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything or tell me to do something..."
                            className="flex-1 input resize-none min-h-[48px] max-h-[120px] py-3"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="btn btn-primary h-12 w-12 p-0 rounded-full shrink-0"
                        >
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Real-time action badge (shows during streaming)
const ActionBadge = ({ action }) => {
    const configs = {
        shortlist_added: { icon: '⭐', text: `Added ${action.university}`, bg: 'bg-amber-500/20 border-amber-500/30' },
        task_added: { icon: '✅', text: `Created: ${action.task}`, bg: 'bg-emerald-500/20 border-emerald-500/30' },
        recommendations_generated: { icon: '🎓', text: 'Generating recommendations...', bg: 'bg-blue-500/20 border-blue-500/30' },
        profile_updated: { icon: '📝', text: `Updated ${action.field?.replace(/_/g, ' ')}`, bg: 'bg-purple-500/20 border-purple-500/30' },
        university_locked: { icon: '🔒', text: `Locked ${action.university}`, bg: 'bg-emerald-500/20 border-emerald-500/30' }
    };

    const config = configs[action.action] || { icon: '✨', text: 'Action taken', bg: 'bg-white/10 border-white/20' };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${config.bg} animate-slide-up`}>
            <span>{config.icon}</span>
            <span>{config.text}</span>
        </div>
    );
};

// Action Card Component (shows in message)
const ActionCard = ({ action }) => {
    const icons = {
        shortlist_added: '⭐',
        task_added: '✅',
        recommendations_generated: '🎓',
        profile_updated: '📝',
        university_locked: '🔒',
    };

    const colors = {
        shortlist_added: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
        task_added: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        recommendations_generated: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
        profile_updated: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
        university_locked: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    };

    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r ${colors[action.action] || 'from-white/10 to-white/5 border-white/20'} border`}>
            <span className="text-lg">{icons[action.action] || '✨'}</span>
            <div className="flex-1 text-sm">
                {action.action === 'shortlist_added' && (
                    <p>Added <strong>{action.university}</strong> to your <span className="capitalize">{action.category}</span> list</p>
                )}
                {action.action === 'task_added' && (
                    <p>Created task: <strong>{action.task}</strong></p>
                )}
                {action.action === 'recommendations_generated' && (
                    <p>Generated fresh university recommendations</p>
                )}
                {action.action === 'profile_updated' && (
                    <p>Updated <strong>{action.field?.replace(/_/g, ' ')}</strong> to <strong>{action.value}</strong></p>
                )}
                {action.action === 'university_locked' && (
                    <p>Locked <strong>{action.university}</strong> as your primary choice</p>
                )}
            </div>
            {action.success && <span className="text-emerald-400">✓</span>}
        </div>
    );
};

export default Chat;
