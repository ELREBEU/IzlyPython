import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, PlaneIcon, ArrowRightIcon, ShieldCheckIcon } from 'lucide-react';

const OfferCard = ({ offer, onBook }) => {
    // Determine badge color based on tariff
    const getTariffInfo = (code) => {
        switch (code) {
            case '98': return { label: 'BOURSIER', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', price: '1.50 €' };
            case '100': return { label: 'ALTERNANT', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', price: '1.00 €' };
            case '97': return { label: 'NON-BOURSIER', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', price: '3.30 €' };
            default: return { label: 'STANDARD', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20', price: '3.30 €' };
        }
    };

    const tariff = getTariffInfo(offer.seller_tariff_code);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="relative w-full mb-4 group"
        >
            {/* Main Ticket Container */}
            <div className="relative bg-[#1E1E24] rounded-2xl overflow-hidden border border-white/5 shadow-xl">

                {/* Left Side: Flight Info (Seller) */}
                <div className="flex">
                    {/* Decorative Left Strip */}
                    <div className={`w-2 ${tariff.bg.replace('/10', '')} h-auto`} />

                    <div className="flex-1 p-5">
                        {/* Header: Route */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-1">
                                    <span className="uppercase">Vendeur</span>
                                    <ArrowRightIcon size={10} />
                                    <span className="uppercase">Acheteur</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-white">{offer.seller_name || "Vendeur"}</h3>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tariff.border} ${tariff.color} ${tariff.bg}`}>
                                        {tariff.label}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Départ</p>
                                <p className="text-white font-mono font-bold">MAINTENANT</p>
                            </div>
                        </div>

                        {/* Dashed Line */}
                        <div className="w-full h-px border-t border-dashed border-gray-700 my-4 relative">
                            <div className="absolute -left-6 -top-2 w-4 h-4 bg-[#121212] rounded-full" />
                            <div className="absolute -right-6 -top-2 w-4 h-4 bg-[#121212] rounded-full" />
                            <PlaneIcon className="absolute left-1/2 -top-3 -translate-x-1/2 text-gray-600 rotate-90 bg-[#1E1E24] px-1" size={20} />
                        </div>

                        {/* Footer: Price & Action */}
                        <div className="flex justify-between items-end mt-2">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Prix du billet</p>
                                <p className="text-2xl font-bold text-white">{tariff.price}</p>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onBook(offer)}
                                className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm shadow-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                Réserver
                                <ArrowRightIcon size={16} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-0 right-0 p-2">
                    {offer.seller_rating >= 4.5 && (
                        <div className="bg-green-500/20 text-green-400 p-1.5 rounded-full" title="Vendeur fiable">
                            <ShieldCheckIcon size={14} />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default OfferCard;
