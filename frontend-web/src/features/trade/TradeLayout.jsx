import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, MenuIcon, StarIcon, MapPinIcon, ClockIcon, SendIcon } from 'lucide-react';
import TradeMap from './TradeMap';
import { AVAILABLE_SELLERS, CURRENT_USER } from './data/dummyUsers';

const TradeLayout = () => {
    const navigate = useNavigate();
    const [sheetOpen, setSheetOpen] = useState(true);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [chatMessage, setChatMessage] = useState('');

    const handleSelectSeller = (seller) => {
        setSelectedSeller(seller);
        setSheetOpen(false);

        // Conversation avec le BOT
        setActiveChat({
            seller: seller,
            messages: [
                { id: 1, from: 'bot', text: `🤖 Izly Trading Bot`, time: new Date(), isSystem: true },
                { id: 2, from: 'bot', text: `Vous avez sélectionné le code de ${seller.name}`, time: new Date() },
                { id: 3, from: 'bot', text: `Prix : ${seller.price}€ • Distance : ${seller.distance}`, time: new Date() },
                { id: 4, from: 'bot', text: `Confirmez-vous l'utilisation de ce code ?`, time: new Date() }
            ]
        });
    };

    const sendMessage = () => {
        if (!chatMessage.trim()) return;
        setActiveChat({
            ...activeChat,
            messages: [
                ...activeChat.messages,
                { id: Date.now(), from: CURRENT_USER.id, text: chatMessage, time: new Date() }
            ]
        });
        setChatMessage('');
    };

    return (
        <div className="relative h-screen w-screen bg-white overflow-hidden">
            {/* Fullscreen Map */}
            <div className="absolute inset-0">
                <TradeMap onMarkerClick={(seller) => {
                    setSelectedSeller(seller);
                    setSheetOpen(true);
                }} />
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeftIcon size={24} className="text-gray-800" />
                    </motion.button>

                    <h1 className="text-lg font-semibold text-gray-900">Izly Trading</h1>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MenuIcon size={24} className="text-gray-800" />
                    </motion.button>
                </div>
            </div>

            {/* Bottom Sheet - Sellers List */}
            <AnimatePresence>
                {sheetOpen && !activeChat && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(e, info) => {
                            if (info.offset.y > 100) setSheetOpen(false);
                        }}
                        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="px-6 pt-4 pb-3 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Vendeurs disponibles</h2>
                            <p className="text-sm text-gray-500 mt-1">{AVAILABLE_SELLERS.length} codes près de vous</p>
                        </div>

                        {/* Sellers List */}
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] px-4 py-3 space-y-3">
                            {AVAILABLE_SELLERS.map((seller, index) => (
                                <motion.div
                                    key={seller.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-start gap-4 mb-3">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xl font-bold flex-shrink-0">
                                            {seller.initial}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-base font-semibold text-gray-900">{seller.name}</h3>
                                                <span className="text-2xl font-bold text-gray-900">{seller.price}€</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <StarIcon size={14} fill="#FCD34D" stroke="#FCD34D" />
                                                    <span>{seller.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPinIcon size={14} />
                                                    <span>{seller.distance}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ClockIcon size={14} />
                                                    <span>{seller.time_left}</span>
                                                </div>
                                            </div>

                                            {seller.tariff_code === '98' && (
                                                <div className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    Boursier
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* USE CODE BUTTON */}
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectSeller(seller)}
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md"
                                    >
                                        Utiliser ce code
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Panel - BOT */}
            <AnimatePresence>
                {activeChat && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-0 z-40 bg-white flex flex-col"
                    >
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setActiveChat(null);
                                    setSheetOpen(true);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeftIcon size={20} className="text-gray-700" />
                            </motion.button>

                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl">
                                🤖
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Izly Trading Bot</h3>
                                <p className="text-xs text-green-600">Code de {activeChat.seller.name}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{activeChat.seller.price}€</p>
                                <p className="text-xs text-gray-500">{activeChat.seller.distance}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {activeChat.messages.map((msg) => {
                                const isMe = msg.from === CURRENT_USER.id;
                                const isBot = msg.from === 'bot';

                                if (msg.isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center">
                                            <div className="bg-green-100 px-4 py-2 rounded-full">
                                                <p className="text-sm font-semibold text-green-800">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-3xl ${isMe
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                                            }`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className="text-xs mt-1 opacity-60">
                                                {msg.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Bar */}
                        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Message..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={sendMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 transition-colors shadow-md"
                            >
                                <SendIcon size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TradeLayout;
