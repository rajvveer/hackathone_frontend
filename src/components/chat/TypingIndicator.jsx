import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start w-full my-2"
        >
            <div className="bg-themed-card border border-themed rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-sm self-start shadow-lg">
                <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-gradient-to-tr from-primary/80 to-secondary/80 rounded-full"
                            animate={{
                                y: [0, -6, 0],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
