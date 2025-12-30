import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon, QrCodeIcon, RefreshCw, DollarSign } from 'lucide-react';
import { api } from '../../../services/api';

const TradeChat = ({ sessionId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for messages
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const data = await api.trade.getChat(sessionId);
                setMessages(data);

                // Check for QR Code in messages or session status
                // In a real app, we might want to fetch the session status separately
                // But here we can infer from the "QR" type message or just fetch session details if needed.
                // For now, let's assume the last QR message contains the code if we stored it there, 
                // OR we fetch the session details. 
                // Actually, the /book response gave us the QR. 
                // If we are re-opening the chat, we might need to fetch the session to get the QR.
                // Let's rely on the parent passing the initial QR or fetching it.
                // For this POC, let's assume the QR is passed or we fetch it via a new endpoint if needed.
                // WAIT: The chat messages don't contain the QR base64. 
                // We need to fetch the session details to get the QR token.
                // Let's add a quick fetch for session details here if we see a QR message but have no QR.
            } catch (error) {
                console.error("Error fetching chat:", error);
            }
        };

        fetchChat();
        pollingInterval.current = setInterval(fetchChat, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [sessionId]);

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const res = await api.trade.regenerateQR(sessionId);
            if (res.qr_code_base64) {
                setQrCode(res.qr_code_base64);
            }
        } catch (error) {
            console.error("Regenerate failed:", error);
        } finally {
            setRegenerating(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircleIcon className="text-green-400" size={20} />;
            case 'WARNING': return <AlertCircleIcon className="text-orange-400" size={20} />;
            case 'MONEY': return <DollarSign className="text-yellow-400" size={20} />;
            case 'QR': return <QrCodeIcon className="text-purple-400" size={20} />;
            default: return <InfoIcon className="text-blue-400" size={20} />;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-panel rounded-3xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Transaction en cours
                            </h3>
                            <p className="text-gray-400 text-xs ml-5">Mise à jour en temps réel</p>
                        </div>
                        <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <XIcon className="text-white" size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={msg.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.sender === 'SYSTEM' ? '' : 'flex-row-reverse'}`}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.icon_type === 'WARNING' ? 'bg-orange-500/20 text-orange-400' :
                                    msg.icon_type === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
                                        msg.icon_type === 'QR' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {getIcon(msg.icon_type)}
                                </div>
                                <div className={`rounded-2xl p-3.5 max-w-[85%] shadow-sm backdrop-blur-sm ${msg.icon_type === 'QR' ? 'bg-purple-500/10 border border-purple-500/30' :
                                    'bg-white/5 border border-white/10'
                                    }`}>
                                    <p className="text-gray-100 text-sm leading-relaxed font-medium">{msg.content}</p>
                                    <p className="text-gray-500 text-[10px] mt-1.5 text-right font-medium opacity-70">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* QR Code Card (Special Display) */}
                        {(qrCode || messages.some(m => m.icon_type === 'QR')) && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white p-6 rounded-3xl shadow-2xl mx-2 mt-6 mb-2 flex flex-col items-center gap-5 relative overflow-hidden"
                            >
                                {/* Decorative background elements */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                                <div className="text-center z-10">
                                    <h4 className="text-gray-900 font-bold text-xl tracking-tight">Votre QR Code</h4>
                                    <p className="text-gray-500 text-sm font-medium">Présentez ce code à la borne</p>
                                </div>

                                <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100 z-10">
                                    {qrCode ? (
                                        <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-48 h-48 object-contain" />
                                    ) : (
                                        <div className="w-48 h-48 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4 border-2 border-dashed border-gray-200">
                                            <QrCodeIcon size={32} className="mb-2 opacity-50" />
                                            <span>QR Code initial<br />(voir historique)</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="z-10 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-full transition-all active:scale-95"
                                >
                                    <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />
                                    {regenerating ? "Génération..." : "Régénérer le code"}
                                </button>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TradeChat;
