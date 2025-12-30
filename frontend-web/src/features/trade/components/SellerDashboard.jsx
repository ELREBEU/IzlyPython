import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUpIcon, ClockIcon, CoinsIcon } from 'lucide-react';
import ActionSlider from './ActionSlider';

const SellerDashboard = ({ isActive, onActivate, onDeactivate }) => {
    const [duration, setDuration] = useState(30); // minutes

    // Calculate estimated earnings based on tariff
    const calculateEarnings = () => {
        // Boursier: Coût 1€, vend 1.50€, récupère 1.20€ = gain 0.20€
        return 1.20;
    };

    const handleActivation = () => {
        onActivate(duration);
    };

    return (
        <AnimatePresence>
            {isActive ? (
                // Status Bar Mode (minimized)
                <motion.div
                    initial={{ y: 0, height: 'auto' }}
                    animate={{ y: 0, height: 'auto' }}
                    exit={{ y: '100%' }}
                    className="absolute bottom-0 left-0 right-0 z-30 bg-[#121212] border-t-2 border-[#27C468] px-6 py-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-[#27C468] rounded-full animate-pulse" />
                                <div className="absolute inset-0 w-3 h-3 bg-[#27C468] rounded-full animate-ping" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">En ligne</p>
                                <p className="text-gray-400 text-xs">En recherche d'un preneur...</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onDeactivate}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm font-medium"
                        >
                            Arrêter
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                // Full Dashboard Mode
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.1}
                    className="absolute bottom-0 left-0 right-0 z-30 bg-[#121212] rounded-t-3xl shadow-2xl border-t border-gray-800 max-h-[40vh] overflow-hidden"
                >
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
                    </div>

                    <div className="px-6 pb-8 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="bg-[#27C468]/20 p-3 rounded-full">
                                <CoinsIcon className="text-[#27C468]" size={24} />
                            </div>
                            <div>
                                <h2 className="text-white text-xl font-bold">Mode Vendeur</h2>
                                <p className="text-gray-400 text-sm">Partager mon code repas</p>
                            </div>
                        </div>

                        {/* Time Slider */}
                        <div className="bg-gray-900/50 rounded-2xl p-5 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="text-[#27C468]" size={18} />
                                    <span className="text-white font-medium text-sm">Disponibilité</span>
                                </div>
                                <span className="text-[#27C468] font-bold text-2xl">{duration} min</span>
                            </div>

                            <input
                                type="range"
                                min="10"
                                max="60"
                                step="5"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full"
                            />

                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>10 min</span>
                                <span>60 min</span>
                            </div>
                        </div>

                        {/* Earnings Preview */}
                        <div className="bg-gradient-to-br from-[#27C468]/20 to-[#27C468]/5 rounded-2xl p-5 border border-[#27C468]/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUpIcon className="text-[#27C468]" size={20} />
                                    <div>
                                        <p className="text-gray-400 text-xs">Estimation gain</p>
                                        <p className="text-white text-2xl font-bold">+{calculateEarnings().toFixed(2)} €</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-xs">Par transaction</p>
                                    <p className="text-[#27C468] text-sm font-semibold">Code Boursier</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Slider */}
                        <ActionSlider onActivate={handleActivation} isActive={false} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SellerDashboard;
