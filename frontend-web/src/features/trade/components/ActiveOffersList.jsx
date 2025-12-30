import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, MapPinIcon, StarIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';
import { api } from '../../../services/api';

const ActiveOffersList = ({ onSelectOffer, onClose }) => {
    const [filter, setFilter] = useState('all'); // all, favorites, nearby
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await api.market.listOffers();
                // Transform data to match UI expectations if needed
                // The API returns: { id, seller_name, seller_rating, seller_tariff_code, price, ... }
                // We need to map it to the UI format
                const formattedOffers = data.map(offer => ({
                    id: offer.id,
                    name: offer.seller_name || "Vendeur Inconnu",
                    initial: (offer.seller_name || "V")[0],
                    rating: offer.seller_rating || 5.0,
                    trades_count: 0, // Not in API yet
                    price: 1.50, // Fixed price for now or from API? API doesn't return price yet, let's assume 1.50
                    izly_cost: offer.seller_tariff_code === '98' ? 1.00 : 0.30, // Estimate based on tariff
                    distance: "250m", // Mock distance
                    time_left: "15 min", // Mock time
                    tariff_code: offer.seller_tariff_code,
                    payout: offer.seller_tariff_code === '98' ? 0.20 : 0.20 // Mock payout
                }));
                setOffers(formattedOffers);
            } catch (error) {
                console.error("Error fetching offers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const filteredSellers = offers.filter(seller => {
        if (filter === 'favorites') return false; // No favorites yet
        if (filter === 'nearby') return true; // All are nearby for now
        return true;
    });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-panel rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-white/5 border-b border-white/10 px-6 py-5 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-white font-bold text-2xl tracking-tight">Offres disponibles</h3>
                            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {filteredSellers.length} vendeurs actifs
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <XIcon className="text-white" size={20} />
                        </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 px-6 py-4 border-b border-white/5 overflow-x-auto shrink-0">
                        {[
                            { id: 'all', label: 'Tous' },
                            { id: 'nearby', label: 'À proximité' },
                            { id: 'favorites', label: 'Favoris' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`
                                    px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border
                                    ${filter === f.id
                                        ? 'bg-gradient-primary border-transparent text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Offers List */}
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                <p className="text-gray-400 text-sm">Recherche des meilleures offres...</p>
                            </div>
                        ) : (
                            <>
                                {filteredSellers.map((seller, index) => (
                                    <motion.div
                                        key={seller.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onSelectOffer(seller)}
                                        className="glass-card rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
                                    >
                                        {/* Hover Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="flex items-start gap-5 relative z-10">
                                            {/* Avatar */}
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-0.5 shadow-lg">
                                                <div className="w-full h-full rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white text-2xl font-bold">
                                                    {seller.initial}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{seller.name}</h4>
                                                        <div className="flex items-center gap-1 text-yellow-400 text-sm mt-0.5">
                                                            <StarIcon size={14} fill="currentColor" />
                                                            <span className="font-medium">{seller.rating}</span>
                                                            <span className="text-gray-500 ml-1">({seller.trades_count} ventes)</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="bg-green-500/20 px-3 py-1 rounded-lg">
                                                            <p className="text-green-400 text-xl font-bold">{seller.price}€</p>
                                                        </div>
                                                        <p className="text-gray-500 text-[10px] mt-1">Coût réel: {seller.izly_cost}€</p>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex items-center gap-4 text-sm mt-3">
                                                    <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-2.5 py-1 rounded-md">
                                                        <MapPinIcon size={14} className="text-blue-400" />
                                                        <span>{seller.distance}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-2.5 py-1 rounded-md">
                                                        <ClockIcon size={14} className="text-orange-400" />
                                                        <span>{seller.time_left}</span>
                                                    </div>
                                                    {seller.tariff_code === '98' && (
                                                        <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
                                                            <TrendingUpIcon size={14} />
                                                            <span className="font-medium">Boursier</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {filteredSellers.length === 0 && (
                                    <div className="text-center py-16 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <MapPinIcon size={32} className="text-gray-600" />
                                        </div>
                                        <p className="text-white font-medium text-lg">Aucune offre disponible</p>
                                        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                                            Essayez de modifier vos filtres ou revenez plus tard.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ActiveOffersList;
