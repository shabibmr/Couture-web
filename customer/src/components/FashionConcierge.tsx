import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import fashionChar from '../assets/fashion-character.png';

const FashionConcierge: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    // Magnetic Effect Logic
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const buttonElement = buttonRef.current;
        if (!buttonElement) return;

        const { left, top, width, height } = buttonElement.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (dist < 150) {
            const x = (clientX - centerX) * 0.3;
            const y = (clientY - centerY) * 0.3;
            setPosition({ x, y });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed bottom-10 right-10 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute bottom-24 right-0 w-[calc(100vw-40px)] xs:w-[320px] sm:w-96 bg-white/80 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 rounded-3xl overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="bg-midnight backdrop-blur-md p-6 text-white border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-stone-800 rounded-full relative overflow-hidden group">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-tr from-ruvera-gold to-transparent opacity-20"
                                    />
                                    <Sparkles size={18} className="text-ruvera-gold relative z-10" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 mb-1">Ruvera Assistant</p>
                                    <h4 className="text-lg font-light tracking-wide font-serif italic">Fashion Concierge</h4>
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="h-96 p-6 flex flex-col justify-end gap-4 bg-gradient-to-b from-stone-50/50 to-white/50">
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none max-w-[85%] shadow-sm border border-stone-100">
                                <p className="text-sm text-stone-600 font-light leading-relaxed">
                                    Bonjour. I see you're admiring the Winter Collection. Would you like a personal curation based on your preferences?
                                </p>
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white/50 border-t border-stone-100 backdrop-blur-sm flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Inquire about a piece..."
                                className="flex-1 bg-transparent text-sm font-light outline-none text-stone-800 placeholder:text-stone-400"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-stone-400 hover:text-stone-800 transition-colors"
                            >
                                <Send size={18} strokeWidth={1.5} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                ref={buttonRef}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-white text-midnight rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-50 relative group border border-stone-100 overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={24} strokeWidth={1} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full p-2"
                        >
                            <img
                                src={fashionChar}
                                alt="Concierge"
                                className="w-full h-full object-cover scale-150 translate-y-2 mix-blend-multiply"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default FashionConcierge;
