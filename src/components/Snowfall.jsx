import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Snowfall = () => {
    // Generate a fixed set of snowflakes for performance
    const snowflakes = useMemo(() => {
        return Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 8 + 3,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.6 + 0.2,
            drift: Math.random() * 100 - 50,
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {snowflakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    initial={{ y: -20, opacity: 0, x: 0 }}
                    animate={{
                        y: "110vh",
                        opacity: [0, flake.opacity, flake.opacity, 0],
                        x: flake.drift,
                    }}
                    transition={{
                        duration: flake.duration,
                        repeat: Infinity,
                        delay: flake.delay,
                        ease: "linear",
                    }}
                    style={{
                        position: "absolute",
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        filter: "blur(1px)",
                    }}
                />
            ))}
        </div>
    );
};

export default Snowfall;
