import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircleIcon,
    InfoIcon,
    AlertCircleIcon,
    LockIcon,
    LoaderIcon,
    ArrowLeftIcon,
    ShieldCheckIcon
} from 'lucide-react';

const LiveTransactionFeed = ({ seller, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [qrRevealed, setQrRevealed] = useState(false);

    useEffect(() => {
        if (!seller) return;

        // Simulate the transaction flow with timed messages
        const timeline = [
            { delay: 0, message: { id: 1, type: 'info', text: `Mise en relation avec ${seller.name}...`, icon: 'loader' } },
            { delay: 1500, message: { id: 2, type: 'success', text: `${seller.name} a accepté la transaction.`, icon: 'check' } },
            { delay: 3000, message: { id: 3, type: 'info', text: 'Vérification du solde Izly...', icon: 'loader' } },
            { delay: 4500, message: { id: 4, type: 'success', text: 'Caution bancaire vérifiée.', icon: 'lock' } },
            { delay: 6000, message: { id: 5, type: 'qr_code', text: 'QR Code de paiement généré', qrData: 'MOCK_QR_CODE' } },
            { delay: 8000, message: { id: 6, type: 'success', text: `Bon appétit ! Transaction de ${seller.price}€ validée.`, icon: 'shield' } },
        ];

        timeline.forEach(({ delay, message }) => {
            setTimeout(() => {
                setMessages(prev => [...prev, message]);
                if (message.type === 'qr_code') {
                    // Reveal QR code after 2 seconds
                    setTimeout(() => setQrRevealed(true), 2000);
                }
            }, delay);
        });
    }, [seller]);

    const getIcon = (type, iconType) => {
        if (iconType === 'loader') {
            return <LoaderIcon className="text-[#2F80ED] animate-spin" size={20} />;
        }
        if (iconType === 'check') {
            return <CheckCircleIcon className="text-[#27C468]" size={20} />;
        }
        if (iconType === 'lock') {
            return <LockIcon className="text-[#2F80ED]" size={20} />;
        }
        if (iconType === 'shield') {
            return <ShieldCheckIcon className="text-[#27C468]" size={20} />;
        }

        switch (type) {
            case 'success':
                return <CheckCircleIcon className="text-[#27C468]" size={20} />;
            case 'warning':
                return <AlertCircleIcon className="text-orange-400" size={20} />;
            default:
                return <InfoIcon className="text-[#2F80ED]" size={20} />;
        }
    };

    if (!seller) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-50 bg-[#121212] flex flex-col"
        >
            {/* Header */}
            <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeftIcon size={20} className="text-white" />
                </motion.button>

                <div className="w-10 h-10 bg-gradient-to-br from-[#27C468] to-emerald-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {seller.initial}
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-white">Transaction en cours</h3>
                    <p className="text-xs text-gray-400">Code de {seller.name}</p>
                </div>

                <div className="text-right">
                    <p className="text-lg font-bold text-white">{seller.price}€</p>
                    <p className="text-xs text-gray-500">{seller.distance}</p>
                </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0A] dark-scrollbar">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 20,
                                stiffness: 300,
                                delay: 0.1
                            }}
                        >
                            {msg.type === 'qr_code' ? (
                                // QR Code Message
                                <div className="flex justify-center">
                                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 max-w-sm">
                                        <p className="text-white text-sm font-medium mb-4 text-center">
                                            {msg.text}
                                        </p>
                                        <div className={`relative bg-white p-4 rounded-xl transition-all duration-500 ${qrRevealed ? '' : 'blur-sm'
                                            }`}>
                                            {/* Mock QR Code */}
                                            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                                                <div className="text-white text-xs text-center p-4">
                                                    <div className="w-40 h-40 border-4 border-white rounded-lg mb-2" />
                                                    <p className="font-mono">MOCK QR CODE</p>
                                                    <p className="text-gray-400 mt-1">Izly Payment</p>
                                                </div>
                                            </div>
                                        </div>
                                        {!qrRevealed && (
                                            <p className="text-gray-400 text-xs text-center mt-3 animate-pulse">
                                                Génération en cours...
                                            </p>
                                        )}
                                        {qrRevealed && (
                                            <p className="text-[#27C468] text-xs text-center mt-3 font-medium">
                                                ✓ QR Code prêt à scanner
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // System Message
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-gray-900/80 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getIcon(msg.type, msg.icon)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm leading-relaxed">
                                                    {msg.text}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {new Date().toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Spacer to ensure last message is visible */}
                <div className="h-4" />
            </div>

            {/* Footer Info - No input field! */}
            <div className="bg-gray-900/50 border-t border-gray-800 px-4 py-3">
                <p className="text-gray-500 text-xs text-center">
                    🤖 Transaction automatisée • Système Izly Trading
                </p>
            </div>
        </motion.div>
    );
};

export default LiveTransactionFeed;
