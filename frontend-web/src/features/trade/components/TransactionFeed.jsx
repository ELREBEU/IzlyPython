import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, ShieldCheckIcon, ClockIcon, XIcon, RefreshCwIcon, BotIcon, SparklesIcon } from 'lucide-react';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const TransactionFeed = ({ session, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [qrExpiration, setQrExpiration] = useState(null);
    const [isTyping, setIsTyping] = useState(true); // Simulate bot typing
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);
    const navigate = useNavigate();

    // Determine other user name
    // Assuming session has seller and buyer expanded objects or we use generic name
    const otherUserName = session.seller?.full_name || session.buyer?.full_name || "le correspondant";

    // Initial Load & Polling
    useEffect(() => {
        loadData();
        // Always poll to check for updates (Regeneration, Status change)
        pollingInterval.current = setInterval(loadData, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [session.id]); // Removed qrCode dependency so it doesn't reset interval unnecessarily

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, qrCode]);

    const loadData = async () => {
        try {
            // 1. Load Chat Messages
            const msgs = await api.trade.getChat(session.id);
            setMessages(msgs);

            // 2. Check Session Status for QR Code (More reliable than chat msg)
            const history = await api.trade.getHistory(session.buyer_id);
            const currentSession = history.as_buyer.find(s => s.id === session.id);

            if (currentSession) {
                // Update QR Code if it changed (e.g. regeneration) or if it's new
                if (currentSession.qr_code_token && currentSession.qr_code_token !== qrCode) {
                    setQrCode(currentSession.qr_code_token);
                    setQrExpiration(currentSession.qr_expiration);
                    setIsTyping(false);
                    // We don't stop polling here anymore because we might need to check for status changes (COMPLETED)
                    // But maybe we slow it down? For now, keep it simple.
                }

                if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(currentSession.status)) {
                    setIsTyping(false);
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                }
            }

            // Logic to stop typing if last message is error or success
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg && (lastMsg.type === 'QR' || lastMsg.type === 'ERROR' || lastMsg.type === 'WARNING')) {
                setIsTyping(false);
            } else if (!qrCode) {
                setIsTyping(true); // Keep typing if still processing
            }

        } catch (error) {
            console.error("Data load error", error);
            setIsTyping(false);
        }
    };

    const handleRegenerate = async () => {
        try {
            setIsTyping(true);
            await api.trade.regenerateQR(session.id);
        } catch (error) {
            console.error("Regenerate error", error);
            setIsTyping(false);
        }
    };

    const handleOpenPaymentPage = () => {
        if (qrCode) {
            // Find expiration from session data if available, or pass null
            // We need to store it in state or ref if it's not in 'session' prop
            // But we fetch 'currentSession' in loadData.
            // Let's store it in a state variable.
            navigate('/trade/payment', { state: { qrCode, expiration: qrExpiration } });
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-[#0f0f11] flex flex-col font-sans">
            {/* Header (Minimalist) */}
            <div className="p-4 bg-[#0f0f11]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <SparklesIcon size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Assistant Izly</h3>
                        <p className="text-[10px] text-gray-400">Transaction sécurisée</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                    <XIcon size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                {/* Welcome Message */}
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <BotIcon size={16} className="text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 mb-1">Izly AI</div>
                        <div className="text-gray-200 text-sm leading-relaxed max-w-2xl">
                            Bonjour ! Je m'occupe de votre transaction avec <span className="font-bold text-white">{session.seller_name}</span>.
                            Je vérifie les soldes et je sécurise l'échange. Un instant...
                        </div>
                    </div>
                </div>

                {/* Dynamic Messages */}
                {messages.map((msg, index) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            {msg.type === 'ERROR' || msg.type === 'WARNING' ? (
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                            ) : (
                                <BotIcon size={16} className="text-indigo-400" />
                            )}
                        </div>
                        <div className="space-y-1 max-w-2xl">
                            <div className="text-xs font-bold text-gray-400 mb-1">Izly AI</div>
                            <div className="text-gray-200 text-sm leading-relaxed bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                                {msg.content}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <BotIcon size={16} className="text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-1 h-8">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}

                {/* QR Code Display (Premium Style) */}
                {qrCode && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex justify-center py-8"
                    >
                        <div
                            onClick={handleOpenPaymentPage}
                            className="relative w-72 bg-[#1a3b5c] rounded-[3rem] p-8 shadow-2xl shadow-blue-900/40 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                        >
                            {/* Decorative Circles */}
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-xl" />

                            {/* Header */}
                            <div className="text-center mb-6 relative z-10">
                                <h3 className="text-white font-bold text-xl tracking-wide">Paiement</h3>
                                <p className="text-blue-200 text-xs mt-1">Toucher pour agrandir</p>
                            </div>

                            {/* QR Container */}
                            <div className="bg-white rounded-3xl p-4 shadow-lg relative z-10 aspect-square flex items-center justify-center">
                                <img
                                    src={`data:image/png;base64,${qrCode}`}
                                    alt="QR Code Izly"
                                    className="w-full h-full object-contain mix-blend-multiply"
                                />
                            </div>

                            {/* Timer */}
                            <div className="mt-6 flex justify-center relative z-10">
                                <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2 text-blue-100 text-xs font-mono border border-white/10">
                                    <ClockIcon size={12} />
                                    <span>VALIDE 15:00</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#0f0f11] border-t border-white/5 space-y-3">
                {qrCode ? (
                    <>
                        <button
                            onClick={handleOpenPaymentPage}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <ShieldCheckIcon size={18} />
                            Afficher en plein écran (Izly)
                        </button>
                        <button
                            onClick={handleRegenerate}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-white/5"
                        >
                            <RefreshCwIcon size={18} />
                            Régénérer le code
                        </button>
                    </>
                ) : (
                    <div className="text-center text-xs text-gray-600">
                        Traitement sécurisé par Izly Trading
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionFeed;
