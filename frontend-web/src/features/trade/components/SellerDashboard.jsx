import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUpIcon, ClockIcon, CoinsIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import ActionSlider from './ActionSlider';

const TARIFF_CONFIG = {
    '98': { label: 'Boursier', cost: 1.00, payout: 1.50, profit: 0.50, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    '100': { label: 'Alternant', cost: 0.30, payout: 1.00, profit: 0.70, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    '97': { label: 'Non-Boursier', cost: 3.30, payout: 3.30, profit: 0.00, color: 'text-blue-400', bg: 'bg-blue-400/10' }
};

const SellerDashboard = ({ isActive, onActivate, onDeactivate, user }) => {
    const [duration, setDuration] = useState(30);
    const [tariff, setTariff] = useState(TARIFF_CONFIG['97']); // Default to Standard

    useEffect(() => {
        if (user && user.tariff_code) {
            const t = TARIFF_CONFIG[user.tariff_code] || TARIFF_CONFIG['97'];
            setTariff(t);
        }
    }, [user]);

    const handleActivation = () => {
        onActivate(15); // Fixed 15 min
    };

    return (
        <AnimatePresence>
            {isActive ? (
                // Status Bar Mode (minimized)
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="absolute bottom-0 left-0 right-0 z-30 bg-[#1e1e24] border-t border-white/10 px-6 py-6 pb-10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                                <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-50" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Offre en ligne</p>
                                <p className="text-gray-400 text-sm">En attente d'un acheteur...</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onDeactivate}
                            className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors"
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
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-x-0 bottom-0 z-30 bg-[#121212] rounded-t-[2.5rem] shadow-2xl border-t border-white/10 h-[85vh] flex flex-col"
                >
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-6 pb-2 cursor-grab active:cursor-grabbing">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pt-4 pb-8 space-y-8">

                        {/* Header */}
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Vendre un repas</h2>
                            <p className="text-gray-400 text-sm">Transformez votre solde Izly en cash</p>
                        </div>

                        {/* Profit Simulator Card */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                            {/* Background Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${tariff.bg} blur-3xl rounded-full -mr-10 -mt-10`} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Votre Statut</p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tariff.bg} border border-white/5`}>
                                            <span className={`font-bold text-sm ${tariff.color}`}>{tariff.label}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Gain Net</p>
                                        <p className={`text-3xl font-bold ${tariff.profit > 0 ? 'text-green-400' : 'text-gray-300'}`}>
                                            +{tariff.profit.toFixed(2)} €
                                        </p>
                                    </div>
                                </div>

                                {/* Breakdown */}
                                <div className="space-y-3 bg-black/20 rounded-xl p-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Prix payé par l'acheteur</span>
                                        <span className="text-white font-medium">{tariff.payout.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Coût réel pour vous</span>
                                        <span className="text-gray-400 font-medium">-{tariff.cost.toFixed(2)} €</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300 font-medium">Bénéfice</span>
                                        <span className={`font-bold ${tariff.profit > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                            {tariff.profit > 0 ? `+${tariff.profit.toFixed(2)} €` : '0.00 €'}
                                        </span>
                                    </div>
                                </div>

                                {tariff.profit === 0 && (
                                    <div className="mt-4 flex items-start gap-3 text-xs text-blue-300 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                        <AlertCircleIcon size={16} className="flex-shrink-0 mt-0.5" />
                                        <p>En tant que non-boursier, vous ne faites pas de bénéfice, mais vous aidez un étudiant à manger moins cher (il paie 3.30€ au lieu du tarif visiteur).</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Duration Slider */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-white font-bold flex items-center gap-2">
                                    <ClockIcon size={18} className="text-indigo-400" />
                                    Durée de validité
                                </label>
                                <span className="text-indigo-400 font-bold text-xl">{duration} min</span>
                            </div>

                            <div className="relative h-12 flex items-center">
                                <div className="absolute inset-x-0 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-200"
                                        style={{ width: `${((duration - 10) / 50) * 100}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="60"
                                    step="5"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-indigo-500 transition-all duration-200 pointer-events-none"
                                    style={{ left: `calc(${((duration - 10) / 50) * 100}% - 12px)` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                                <span>10 min</span>
                                <span>30 min</span>
                                <span>60 min</span>
                            </div>
                        </div>

                        {/* Action Button (Replaces Slider for better UX) */}
                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleActivation}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
                            >
                                <CoinsIcon size={24} />
                                Mettre en vente
                            </motion.button>
                            <p className="text-center text-gray-500 text-xs mt-3">
                                Votre offre sera visible par les acheteurs immédiatement.
                            </p>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SellerDashboard;
