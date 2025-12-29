import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, MapPinIcon, StarIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';
import { AVAILABLE_SELLERS, USER_FAVORITES } from '../data/dummyUsers';

const ActiveOffersList = ({ onSelectOffer, onClose }) => {
    const [filter, setFilter] = useState('all'); // all, favorites, nearby

    const filteredSellers = AVAILABLE_SELLERS.filter(seller => {
        if (filter === 'favorites') return USER_FAVORITES.includes(seller.id);
        if (filter === 'nearby') return parseInt(seller.distance) < 300;
        return true;
    });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1c1c1c] rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-gray-800"
                >
                    {/* Header */}
                    <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold text-xl">Offres disponibles</h3>
                            <p className="text-gray-400 text-sm">{filteredSellers.length} vendeurs actifs</p>
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

                    {/* Filters */}
                    <div className="flex gap-2 px-6 py-4 border-b border-gray-800 overflow-x-auto">
                        {[
                            { id: 'all', label: 'Tous' },
                            { id: 'nearby', label: 'À proximité' },
                            { id: 'favorites', label: 'Favoris' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${filter === f.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }
                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Offers List */}
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-180px)]">
                        {filteredSellers.map((seller, index) => (
                            <motion.div
                                key={seller.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelectOffer(seller)}
                                className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800 hover:border-green-500/50 transition-all cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                                        {seller.initial}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-white font-bold text-lg">{seller.name}</h4>
                                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                                    <StarIcon size={14} fill="currentColor" />
                                                    <span>{seller.rating}</span>
                                                    <span className="text-gray-500 ml-1">({seller.trades_count} ventes)</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-green-400 text-2xl font-bold">{seller.price}€</p>
                                                <p className="text-gray-500 text-xs">Coût réel: {seller.izly_cost}€</p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-blue-400">
                                                <MapPinIcon size={14} />
                                                <span>{seller.distance}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-400">
                                                <ClockIcon size={14} />
                                                <span>{seller.time_left}</span>
                                            </div>
                                            {seller.tariff_code === '98' && (
                                                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                                    Boursier ⭐
                                                </div>
                                            )}
                                        </div>

                                        {/* Profit Info */}
                                        <div className="mt-2 bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-2">
                                            <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                                <TrendingUpIcon size={12} />
                                                <span>Le vendeur gagne {seller.payout}€</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredSellers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-400">Aucune offre disponible</p>
                                <p className="text-gray-600 text-sm mt-2">Changez de filtre ou attendez</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ActiveOffersList;
