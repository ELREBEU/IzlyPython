import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { LockIcon, UnlockIcon } from 'lucide-react';

const ActionSlider = ({ onActivate, isActive }) => {
    const [isDragging, setIsDragging] = useState(false);
    const constraintsRef = useRef(null);
    const x = useMotionValue(0);

    // Calculate progress (0 to 1)
    const progress = useTransform(x, [0, 220], [0, 1]);

    // Background color based on progress
    const backgroundColor = useTransform(
        progress,
        [0, 1],
        ['rgba(39, 196, 104, 0.2)', 'rgba(39, 196, 104, 0.8)']
    );

    const handleDragEnd = (_, info) => {
        setIsDragging(false);

        // If dragged more than 80% of the way, activate
        if (info.point.x > 200) {
            onActivate();
            x.set(220); // Snap to end
        } else {
            x.set(0); // Snap back to start
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    if (isActive) {
        return null; // Hide when active
    }

    return (
        <div className="w-full px-1 py-1">
            <motion.div
                ref={constraintsRef}
                style={{ backgroundColor }}
                className="relative h-16 rounded-2xl overflow-hidden border-2 border-[#27C468]/30"
            >
                {/* Background text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white/60 font-semibold text-sm tracking-wide">
                        Glisser pour activer
                    </span>
                </div>

                {/* Arrow hints */}
                <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none">
                    <div className="flex gap-1 opacity-40">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>

                {/* Draggable handle */}
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 220 }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    style={{ x }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="absolute left-1 top-1 bottom-1 w-14 bg-white rounded-xl shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isDragging ? (
                        <UnlockIcon size={24} className="text-[#27C468]" />
                    ) : (
                        <LockIcon size={24} className="text-gray-700" />
                    )}
                </motion.div>

                {/* Glow effect when dragging */}
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at left, rgba(39, 196, 104, 0.3), transparent 70%)'
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default ActionSlider;
