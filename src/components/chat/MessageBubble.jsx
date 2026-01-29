import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import ActionCard from './ActionCard';

const MessageBubble = memo(({ message, isUser, isError, onAction }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`
                    max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl relative shadow-lg
                    ${isUser
                        ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-none shadow-primary/20'
                        : isError
                            ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-bl-none'
                            : 'bg-themed-card border border-themed text-themed rounded-bl-none backdrop-blur-md shadow-lg'
                    }
                `}
            >
                <div className={`text-[15px] leading-relaxed prose prose-invert prose-p:my-1 prose-ul:my-1 max-w-none
                    ${isUser ? 'text-white/95' : 'text-themed'}
                `}>
                    {isUser ? (
                        <p className="m-0 whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-themed-secondary" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-themed-secondary" {...props} />,
                                li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-themed" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-2 text-themed" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2 text-themed" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1 text-themed" {...props} />,
                                code: ({ node, inline, ...props }) =>
                                    inline ? (
                                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-purple-300" {...props} />
                                    ) : (
                                        <code className="block bg-black/30 p-3 rounded-lg text-sm font-mono my-2 overflow-x-auto text-purple-200" {...props} />
                                    ),
                                a: ({ node, ...props }) => <a className="text-primary-light hover:underline hover:text-primary transition-colors" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/50 pl-4 py-1 italic bg-white/5 rounded-r" {...props} />,
                            }}
                        >
                            {message.content || ''}
                        </ReactMarkdown>
                    )}
                </div>

                {/* Status Indicator (Optional) */}
                {isUser && (
                    <div className="absolute -bottom-5 right-0 text-[10px] text-themed-muted font-medium opacity-60">
                        Just now
                    </div>
                )}

                {/* Action Cards inline with message */}
                {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-themed space-y-2">
                        {message.actions.map((action, i) => (
                            <ActionCard
                                key={i}
                                action={action}
                                onSendMessage={onAction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

export default MessageBubble;
