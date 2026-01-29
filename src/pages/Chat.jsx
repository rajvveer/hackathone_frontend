import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageBubble from '../components/chat/MessageBubble';
import InputBar from '../components/chat/InputBar';
import TypingIndicator from '../components/chat/TypingIndicator';
import ActionBadge from '../components/chat/ActionBadge';

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

    // Auto-scroll ref
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Persist active conversation
    useEffect(() => {
        if (conversationId) {
            localStorage.setItem('lastActiveConversationId', conversationId);
        }
    }, [conversationId]);

    // Load conversations and restore session on mount
    useEffect(() => {
        const initChat = async () => {
            try {
                const response = await chatAPI.getConversations();
                const convs = response.data.conversations || [];
                setConversations(convs);

                // Try to restore last conversation
                const lastId = localStorage.getItem('lastActiveConversationId');

                if (lastId && convs.some(c => c.id === lastId)) {
                    loadChat(lastId);
                } else if (convs.length > 0) {
                    // Default to most recent if no history
                    loadChat(convs[0].id);
                } else {
                    // New/Empty state handled by initial state
                    setMessages([{
                        role: 'assistant',
                        content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your AI Study Abroad Counsellor.\n\n**I can help you with:**\n- 🎓 University recommendations tailored to your profile\n- ⭐ Shortlisting universities (Dream, Target, Safe)\n- ✅ Adding tasks to your to-do list\n- 📋 Application strategy and preparation tips\n\n**Try saying:**\n- "Add a task to prepare my SOP"\n- "Shortlist MIT for me"\n- "What should I do next?"\n\nHow can I assist you today?`,
                    }]);
                }
            } catch (err) {
                console.error('Failed to load conversations');
            }
        };

        if (user) {
            initChat();
        }
    }, [user]); // Depend on user to ensure we re-init if auth changes

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
        <div className="flex h-[calc(100vh-130px)] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden bg-themed relative rounded-xl border border-themed">
            {/* Sidebar - Conversations */}
            <ChatSidebar
                isOpen={showSidebar}
                setIsOpen={setShowSidebar}
                conversations={conversations}
                activeId={conversationId}
                onSelect={loadChat}
                onNewChat={startNewChat}
                onDelete={deleteChat}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-themed bg-themed-card">
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
                            <p className="text-xs text-themed-muted">
                                {isStreaming ? '✨ Acting...' : loading ? '🤔 Thinking...' : '🟢 Online'}
                            </p>
                        </div>
                    </div>
                    {/* <button onClick={startNewChat} className="btn btn-ghost text-sm">
                        + New Chat
                    </button> */}
                </div>

                {/* Action Notifications (real-time) */}
                {actions.length > 0 && (
                    <div className="px-4 md:px-6 py-2 bg-themed-card border-b border-themed">
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
                        <MessageBubble
                            key={idx}
                            message={msg}
                            isUser={msg.role === 'user'}
                            isError={msg.isError}
                            onAction={(text) => {
                                setInput(text);
                                setTimeout(() => document.getElementById('send-btn')?.click(), 0);
                            }}
                        />
                    ))}

                    {/* Typing indicator */}
                    {loading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && messages[messages.length - 1]?.role === 'user' && (
                        <TypingIndicator />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts (show when no user messages) */}
                {messages.filter(m => m.role === 'user').length === 0 && !loading && (
                    <div className="px-4 md:px-6 pb-4">
                        <p className="text-sm text-themed-muted mb-2">Try these:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(prompt)}
                                    className="px-3 py-1.5 text-sm bg-themed-card border border-themed rounded-full hover:bg-themed-card transition"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <InputBar
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Chat;
