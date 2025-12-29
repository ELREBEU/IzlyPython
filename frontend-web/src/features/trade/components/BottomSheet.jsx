import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2Icon, UtensilsIcon, StarIcon, MapPinIcon, ClockIcon } from 'lucide-react';

const BottomSheet = ({ state, onClose, selectedSeller, onShare, onRequest }) => {
    const [shareTime, setShareTime] = useState(30);

    const variants = {
        hidden: { y: '100%' },
        visible: { y: 0 }
    };

    return (
        <AnimatePresence>
            {state !== 'idle' && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 z-20 backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={variants}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 z-30 bg-[#1c1c1c] rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto border-t border-gray-800"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-4 pb-3">
                            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
                        </div>

                        <div className="px-6 pb-8">
                            {/* STATE: SHARING */}
                            {state === 'sharing' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-green-500/20 p-3 rounded-full">
                                            <Share2Icon className="text-green-400" size={24} />
                                        </div>
                                        <h2 className="text-white text-2xl font-bold">Partager mon code</h2>
                                    </div>

                                    <p className="text-gray-400 mb-6">Combien de temps souhaitez-vous partager votre code ?</p>

                                    <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
                                        <input
                                            type="range"
                                            min="10"
                                            max="60"
                                            value={shareTime}
                                            onChange={(e) => setShareTime(e.target.value)}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>10 min</span>
                                            <span>60 min</span>
                                        </div>
                                        <p className="text-center text-white font-semibold text-3xl mt-6">{shareTime} min</p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onShare}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/30"
                                    >
                                        Mettre en ligne
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STATE: REQUESTING */}
                            {state === 'requesting' && selectedSeller && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {/* Seller Profile */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {selectedSeller.initial}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-white text-2xl font-bold mb-1">{selectedSeller.name}</h2>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        size={16}
                                                        fill={i < Math.floor(selectedSeller.rating) ? "currentColor" : "none"}
                                                    />
                                                ))}
                                                <span className="text-sm ml-1 text-gray-400">{selectedSeller.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                                            <p className="text-gray-400 text-sm mb-2">Prix</p>
                                            <p className="text-white text-3xl font-bold">{selectedSeller.price}€</p>
                                        </div>
                                        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                                            <p className="text-gray-400 text-sm mb-2">Distance</p>
                                            <p className="text-white text-xl font-semibold flex items-center gap-2">
                                                <MapPinIcon size={18} className="text-blue-400" />
                                                {selectedSeller.distance}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expiration Warning */}
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
                                        <ClockIcon className="text-orange-400" size={20} />
                                        <p className="text-orange-300 text-sm font-medium">Expire dans {selectedSeller.time_left}</p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onRequest}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30"
                                    >
                                        Commander le code
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
