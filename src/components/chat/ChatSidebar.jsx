import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSidebar = memo(({
    isOpen,
    setIsOpen,
    conversations,
    activeId,
    onSelect,
    onNewChat,
    onDelete
}) => {
    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Panel */}
            <div
                className={`
                    fixed md:relative inset-y-0 left-0 z-40 bg-themed border-r border-themed
                    flex flex-col w-72 backdrop-blur-xl
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-4 border-b border-themed">
                    <button
                        onClick={onNewChat}
                        className="w-full py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/20 rounded-xl flex items-center justify-center gap-2 transition-all group"
                    >
                        <span className="text-xl font-light group-hover:scale-110 transition-transform">+</span>
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="px-3 py-2 text-xs font-semibold text-themed-muted uppercase tracking-wider">
                        Recent
                    </div>

                    {conversations.map((conv, i) => (
                        <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onSelect(conv.id)}
                            className={`
                                group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border
                                ${activeId === conv.id
                                    ? 'bg-themed-card border-themed shadow-lg'
                                    : 'bg-transparent border-transparent hover:bg-themed-card'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm truncate flex-1 font-medium ${activeId === conv.id ? 'text-themed' : 'text-themed-secondary group-hover:text-themed'}`}>
                                    {conv.preview || 'New Conversation'}
                                </p>

                                <button
                                    onClick={(e) => onDelete(conv.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-themed-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete chat"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-[10px] text-themed-muted mt-1">
                                {new Date(conv.updated_at || Date.now()).toLocaleDateString()} • {conv.message_count} msgs
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="p-4 border-t border-themed">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-900/20">
                            AI
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-themed">AI Counsellor</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default ChatSidebar;
