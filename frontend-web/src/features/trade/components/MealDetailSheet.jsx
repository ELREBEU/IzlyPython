import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon, AwardIcon } from 'lucide-react';
import axios from 'axios'; // Direct axios usage for now or import api
import { api } from '../../../services/api'; // Assuming api service is available

const MealDetailSheet = ({ seller, onCommand, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleCommand = async () => {
        setLoading(true);
        try {
            // Get current user ID from localStorage
            const credentials = JSON.parse(localStorage.getItem('izly_credentials') || '{}');
            const buyerId = credentials.userId;

            if (!buyerId) {
                alert("Erreur: Vous devez être connecté pour commander");
                return;
            }

            // Call API to book
            // We use direct axios call here or add a method to api.js
            // Let's assume we use a direct call for quick implementation or better yet, add to api.js
            // But wait, we didn't add book to api.js yet? Let's check.
            // We added getChat and regenerateQR. We missed book!
            // Let's add it here directly for now to save a step, or better, use axios directly.

            const API_URL = 'http://127.0.0.1:8000/api';
            const response = await axios.post(`${API_URL}/trade/book/${seller.id}`, {
                buyer_id: buyerId
            });

            // Success! Pass the session ID to parent
            onCommand({ ...seller, sessionId: response.data.id });

        } catch (error) {
            console.error("Booking error:", error);
            alert(`Erreur lors de la commande: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!seller) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end"
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full glass-panel rounded-t-3xl border-t border-white/10 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
                {/* Handle Bar */}
                <div className="flex justify-center pt-4 pb-3">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                <div className="px-6 pb-8 space-y-6">
                    {/* Seller Profile */}
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#27C468] to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-green-500/20">
                            {seller.initial}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white text-2xl font-bold mb-1 tracking-tight">{seller.name}</h2>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        size={16}
                                        className={i < Math.floor(seller.rating) ? "fill-[#FCD34D] stroke-[#FCD34D]" : "stroke-gray-600"}
                                    />
                                ))}
                                <span className="text-gray-400 text-sm ml-1 font-medium">
                                    {seller.rating} ({seller.trades_count} ventes)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Price Card */}
                        <div className="glass-card p-5 rounded-2xl">
                            <p className="text-gray-400 text-sm mb-2 font-medium">Prix du code</p>
                            <p className="text-white text-3xl font-bold tracking-tight">{seller.price}€</p>
                            <p className="text-green-400 text-xs mt-1 font-medium bg-green-500/10 inline-block px-2 py-0.5 rounded">
                                Économie: {(3.30 - seller.price).toFixed(2)}€
                            </p>
                        </div>

                        {/* Distance Card */}
                        <div className="glass-card p-5 rounded-2xl">
                            <p className="text-gray-400 text-sm mb-2 font-medium">Distance</p>
                            <div className="flex items-center gap-2">
                                <MapPinIcon size={20} className="text-[#2F80ED]" />
                                <p className="text-white text-xl font-semibold">{seller.distance}</p>
                            </div>
                            <p className="text-gray-500 text-xs mt-1">~3 min à pied</p>
                        </div>
                    </div>

                    {/* Tariff Badge */}
                    {seller.tariff_code === '98' && (
                        <div className="bg-gradient-to-r from-[#27C468]/10 to-emerald-500/10 border border-[#27C468]/30 rounded-2xl p-4 flex items-center gap-3">
                            <div className="bg-[#27C468]/20 p-2 rounded-full">
                                <AwardIcon className="text-[#27C468]" size={20} />
                            </div>
                            <div>
                                <p className="text-[#27C468] font-bold text-sm">Code Boursier Étudiant</p>
                                <p className="text-gray-400 text-xs">Tarif préférentiel Crous</p>
                            </div>
                        </div>
                    )}

                    {/* Expiration Warning */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-3">
                        <div className="bg-orange-500/20 p-2 rounded-full">
                            <ClockIcon className="text-orange-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-orange-300 text-sm font-medium">Offre expire dans</p>
                            <p className="text-orange-400 text-lg font-bold">{seller.time_left}</p>
                        </div>
                    </div>

                    {/* Command Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCommand}
                        disabled={loading}
                        className={`w-full bg-gradient-primary hover:brightness-110 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-blue-500/30 text-lg flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                TRAITEMENT...
                            </>
                        ) : (
                            <>
                                <span>PAYER & RÉSERVER</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">({seller.price}€)</span>
                            </>
                        )}
                    </motion.button>

                    {/* Info Footer */}
                    <p className="text-gray-500 text-xs text-center flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Paiement sécurisé • Code valable 1 repas
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MealDetailSheet;
