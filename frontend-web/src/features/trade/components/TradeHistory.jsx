import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, MessageCircleIcon, CalendarIcon, ChevronRightIcon, ShoppingBagIcon, TagIcon } from 'lucide-react';
import { api } from '../../../services/api';

const TradeHistory = ({ onClose, onSelectSession }) => {
    const [history, setHistory] = useState({ as_buyer: [], as_seller: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bought'); // 'bought' | 'sold'

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const credentials = JSON.parse(localStorage.getItem('izly_credentials') || '{}');
            if (credentials.userId) {
                const data = await api.trade.getHistory(credentials.userId);
                setHistory(data);
            }
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-400';
            case 'CANCELLED': return 'text-red-400';
            case 'EXPIRED': return 'text-gray-400';
            default: return 'text-blue-400';
        }
    };

    const currentList = activeTab === 'bought' ? history.as_buyer : history.as_seller;

    // Sort by date desc
    const sortedList = [...currentList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="absolute inset-0 z-0 bg-[#121212] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeftIcon size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-white">Historique</h2>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl">
                    <button
                        onClick={() => setActiveTab('bought')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'bought'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <ShoppingBagIcon size={16} />
                        Achats
                    </button>
                    <button
                        onClick={() => setActiveTab('sold')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'sold'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <TagIcon size={16} />
                        Ventes
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : sortedList.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <MessageCircleIcon size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Aucune transaction {activeTab === 'bought' ? 'achetée' : 'vendue'}.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedList.map((session, index) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelectSession(session)}
                                className="bg-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors border border-white/5"
                            >
                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${activeTab === 'bought' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {activeTab === 'bought'
                                        ? (session.seller_name?.[0] || "S")
                                        : (session.buyer_name?.[0] || "B")
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white truncate">
                                            {activeTab === 'bought'
                                                ? (session.seller_name || "Vendeur")
                                                : (session.buyer_name || "Acheteur")
                                            }
                                        </h3>
                                        <span className={`text-xs font-medium ${getStatusColor(session.status)}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <CalendarIcon size={12} />
                                        {formatDate(session.created_at)}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">
                                            {activeTab === 'bought' ? 'Acheté' : 'Vendu'}
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            {session.agreed_price} €
                                        </p>
                                    </div>
                                </div>

                                <ChevronRightIcon size={16} className="text-gray-600" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TradeHistory;
