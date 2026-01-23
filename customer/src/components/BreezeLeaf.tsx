import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import leafImg from '../assets/r_leaf.png';

const BreezeLeaf: React.FC = () => {
    // Initial random position
    const [target, setTarget] = useState({
        x: '50vw',
        y: '50vh',
        rotate: 0
    });

    useEffect(() => {
        const updatePosition = () => {
            // Generate random positions within the screen (10% to 90% range to feel "trapped" but safe)
            const randomX = Math.floor(Math.random() * 80) + 10;
            const randomY = Math.floor(Math.random() * 80) + 10;
            const randomRotate = Math.floor(Math.random() * 720) - 360;

            setTarget({
                x: `${randomX}vw`,
                y: `${randomY}vh`,
                rotate: randomRotate
            });
        };

        // Set an initial target after mount
        updatePosition();

        // Update every 7 seconds
        const interval = setInterval(updatePosition, 7000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            <motion.img
                src={leafImg}
                alt=""
                animate={{
                    left: target.x,
                    top: target.y,
                    rotate: target.rotate,
                }}
                transition={{
                    duration: 5.5, // Slower movement (5.5s out of 7s interval)
                    ease: [0.45, 0, 0.55, 1], // Pronounced slow-fast-slow (easeInOutQuad-ish)
                }}
                className="fixed w-10 h-auto mix-blend-multiply opacity-25 filter blur-[0.4px]"
                style={{
                    position: 'absolute',
                }}
            />
        </div>
    );
};

export default BreezeLeaf;
