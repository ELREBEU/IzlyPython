import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import { BOT_LOGS } from '../data/dummyUsers';

const BotFeed = ({ onClose }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="text-green-400" size={18} />;
            case 'warning':
                return <AlertCircleIcon className="text-orange-400" size={18} />;
            default:
                return <InfoIcon className="text-blue-400" size={18} />;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1c1c1c] rounded-3xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl border border-gray-800"
                >
                    {/* Header */}
                    <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold text-lg">Historique</h3>
                            <p className="text-gray-400 text-sm">Messages système</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="bg-gray-800 p-2 rounded-full"
                        >
                            <XIcon className="text-gray-400" size={20} />
                        </motion.button>
                    </div>

                    {/* Messages */}
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(70vh-80px)]">
                        {BOT_LOGS.map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getIcon(log.type)}</div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm leading-relaxed">{log.text}</p>
                                        <p className="text-gray-500 text-xs mt-2">{log.time}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BotFeed;
