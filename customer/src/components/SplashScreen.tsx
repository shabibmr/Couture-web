import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo_ruvera11.png';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        // Start exit animation after 2.5 seconds
        const timer = setTimeout(() => {
            setExit(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={exit ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onAnimationComplete={() => {
                if (exit) onComplete();
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7]"
        >
            <div className="flex flex-col items-center">
                <motion.img
                    src={logo}
                    alt="Ruvéra Couture"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="w-48 md:w-64 h-auto mix-blend-multiply"
                />
            </div>
        </motion.div>
    );
};

export default SplashScreen;
