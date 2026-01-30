import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InputBar = ({ input, setInput, handleSend, loading }) => {
    const textareaRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const recognitionRef = useRef(null);

    // Check for speech recognition support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSpeechSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [setInput]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setInput('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 md:p-6 pb-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent sticky bottom-0 z-20"
        >
            <div className="max-w-4xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="relative flex items-end gap-2 bg-themed-card backdrop-blur-xl border border-themed rounded-2xl p-2 shadow-2xl transition-all focus-within:border-primary ring-1 ring-[var(--border-color)]">
                    {/* Voice Input Button */}
                    {speechSupported && (
                        <button
                            onClick={toggleListening}
                            disabled={loading}
                            className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0 ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'text-themed-muted hover:text-themed hover:bg-themed-card'
                                }`}
                            title={isListening ? 'Stop listening' : 'Voice input'}
                        >
                            {isListening ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "Listening..." : "Ask me anything..."}
                        disabled={loading}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-themed placeholder-[var(--text-placeholder)] resize-none py-3 max-h-[120px] min-h-[44px] leading-relaxed scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)]"
                        rows={1}
                    />

                    <button
                        id="send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={`
                            h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0
                            ${!input.trim() || loading
                                ? 'bg-themed-card text-themed-muted'
                                : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                            }
                        `}
                    >
                        {loading ? (
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Voice listening indicator */}
                {isListening && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                        Listening...
                    </div>
                )}

                <div className="text-center mt-2">
                    <p className="text-[10px] text-themed-muted">
                        {speechSupported ? 'Press the mic button or type • ' : ''}AI Counsellor can make mistakes.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default InputBar;
