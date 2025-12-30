import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsIcon, QrCodeIcon, HistoryIcon, ChevronRightIcon, WalletIcon } from 'lucide-react';

const TradeHome = ({ user, balance, onNavigate }) => {
    // Get time of day for greeting
    const hour = new Date().getHours();
    const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';
    const firstName = user?.full_name?.split(' ')[0] || 'Étudiant';

    return (
        <div className="trade-app min-h-screen bg-[#0f0f11] text-white pb-20 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="p-6 pt-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            {greeting}, {firstName}
                        </h1>
                        <p className="text-gray-400 text-sm">Prêt pour votre prochain repas ?</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                        {firstName[0]}
                    </div>
                </div>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-3xl p-6 relative overflow-hidden mb-8"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <WalletIcon size={16} />
                            <span>Solde Izly</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">{balance.toFixed(2)}</span>
                            <span className="text-xl font-medium text-gray-400">€</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                                Recharger
                            </button>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium text-gray-400 transition-colors">
                                Historique
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Actions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('map')}
                        className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center gap-4 aspect-square group hover:bg-white/5 transition-colors"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <UtensilsIcon size={32} className="text-blue-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-1">Manger</h3>
                            <p className="text-xs text-gray-400">Trouver un code</p>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('seller')}
                        className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center gap-4 aspect-square group hover:bg-white/5 transition-colors"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <QrCodeIcon size={32} className="text-green-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-1">Vendre</h3>
                            <p className="text-xs text-gray-400">Libérer un repas</p>
                        </div>
                    </motion.button>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Activité récente</h3>
                        <button className="text-blue-400 text-sm font-medium hover:text-blue-300">Voir tout</button>
                    </div>

                    <div className="space-y-3">
                        {/* Placeholder for recent activity - to be connected to real data later */}
                        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <HistoryIcon size={20} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Aucune activité récente</p>
                                    <p className="text-xs text-gray-500">Vos transactions apparaîtront ici</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeHome;
