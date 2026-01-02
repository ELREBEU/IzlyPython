import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    ActivityIcon,
    RefreshCwIcon,
    MessageCircleIcon
} from 'lucide-react';
import TradeHome from './TradeHome';
import OfferCard from './components/OfferCard';
import TransactionFeed from './components/TransactionFeed';
import SellerDashboard from './components/SellerDashboard';
import TradeHistory from './components/TradeHistory';
import { api } from '../../services/api';

import PasswordModal from './components/PasswordModal';

import Layout from '../../components/Layout';

const TradeLayout = () => {
    const navigate = useNavigate();

    // Views: 'home' | 'marketplace' | 'seller' | 'transaction' | 'history'
    const [view, setView] = useState('home');

    // Data State
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Transaction state
    const [activeSession, setActiveSession] = useState(null);
    const [sellerActive, setSellerActive] = useState(false);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null); // 'BOOK' or 'SELL'
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [sellerDuration, setSellerDuration] = useState(30);

    // Initial Data Fetch
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // 1. Get Profile & Balance
            const profile = await api.profile.getProfile();
            const wallet = await api.wallet.getBalance();

            if (profile) setUser(profile);
            setBalance(wallet.balance || 0);

            // 2. Get Offers
            const marketOffers = await api.market.listOffers();
            setOffers(marketOffers);

            // 3. Check Active Session
            const credentials = JSON.parse(localStorage.getItem('izly_credentials') || '{}');
            if (credentials.userId) {
                const history = await api.trade.getHistory(credentials.userId);
                // Find active session (CREATED or QR_SENT)
                const active = history.as_buyer.find(s => ['CREATED', 'QR_SENT'].includes(s.status));
                if (active) {
                    setActiveSession(active);
                }
            }
        } catch (error) {
            console.error("Error loading trade data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Navigation Handlers
    const handleNavigate = (targetView) => {
        setView(targetView);
        if (targetView === 'marketplace') {
            loadData(); // Refresh offers
        }
    };

    // --- Actions Triggered by UI ---

    const onBookClick = (offer) => {
        setSelectedOffer(offer);
        setModalAction('BOOK');
        setModalOpen(true);
    };

    const onSellClick = (duration) => {
        setSellerDuration(duration);
        setModalAction('SELL');
        setModalOpen(true);
    };

    // --- Modal Submit Handler ---

    const handleModalSubmit = async (password) => {
        try {
            if (modalAction === 'BOOK' && selectedOffer) {
                const session = await api.trade.bookOffer(selectedOffer.id, password);
                setActiveSession(session);
                setView('transaction');
            } else if (modalAction === 'SELL') {
                await api.market.shareCode(password);
                setSellerActive(true);
                setView('home'); // Go back to home, dashboard will minimize
                alert("Votre offre est en ligne !");
            }
        } catch (error) {
            const msg = error.response?.data?.detail || error.message;
            alert(`Erreur : ${msg}`);
            if (modalAction === 'SELL') setSellerActive(false);
            throw error; // Propagate to modal to stop loading if needed, though modal handles it
        }
    };

    const handleOpenActiveSession = () => {
        if (activeSession) {
            setView('transaction');
        }
    };

    const handleCloseTransaction = () => {
        setView('home');
        loadData(); // Refresh state
    };

    if (loading) {
        return (
            <Layout fullWidth={true}>
                <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
                    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout fullWidth={true}>
            <div className="trade-app relative w-full h-full min-h-[calc(100vh-64px)] bg-[#121212] overflow-hidden">

                {/* VIEW: HOME (Dashboard) */}
                {view === 'home' && (
                    <>
                        <TradeHome
                            user={user}
                            balance={balance}
                            onNavigate={handleNavigate}
                        />

                    </>
                )}

                {/* VIEW: HISTORY */}
                {view === 'history' && (
                    <TradeHistory
                        onClose={() => setView('home')}
                        onSelectSession={(session) => {
                            setActiveSession(session);
                            setView('transaction');
                        }}
                    />
                )}

                {/* VIEW: MARKETPLACE (List of Offers) */}
                {view === 'marketplace' && (
                    <div className="absolute inset-0 z-0 bg-[#121212] flex flex-col">
                        {/* Header */}
                        <div className="p-4 flex items-center gap-4 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('home')}
                                className="p-2 bg-white/10 rounded-full text-white"
                            >
                                <ArrowLeftIcon size={20} />
                            </motion.button>
                            <h2 className="text-xl font-bold text-white">Offres disponibles</h2>
                            <button onClick={loadData} className="ml-auto p-2 text-gray-400 hover:text-white">
                                <RefreshCwIcon size={20} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 pb-24">
                            {offers.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    <p>Aucune offre pour le moment.</p>
                                    <p className="text-sm">Revenez plus tard !</p>
                                </div>
                            ) : (
                                offers.map(offer => (
                                    <OfferCard
                                        key={offer.id}
                                        offer={offer}
                                        onBook={onBookClick}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* SELLER DASHBOARD (Global or View) */}
                {(view === 'seller' || sellerActive) && (
                    <div className="absolute inset-0 z-[1000] pointer-events-none">
                        {/* Back Button only in full view */}
                        {view === 'seller' && !sellerActive && (
                            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setView('home')}
                                    className="p-3 bg-white/10 rounded-full text-white"
                                >
                                    <ArrowLeftIcon size={24} />
                                </motion.button>
                            </div>
                        )}

                        <div className="pointer-events-auto">
                            <SellerDashboard
                                isActive={sellerActive}
                                onActivate={onSellClick}
                                onDeactivate={() => setSellerActive(false)}
                                user={user}
                            />
                        </div>
                    </div>
                )}

                {/* TRANSACTION ROOM */}
                <AnimatePresence>
                    {view === 'transaction' && activeSession && (
                        <TransactionFeed
                            session={activeSession}
                            onClose={handleCloseTransaction}
                        />
                    )}
                </AnimatePresence>

                {/* Active Session Button (Global) */}
                {activeSession && view !== 'transaction' && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenActiveSession}
                        className="absolute bottom-6 right-6 z-[900] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-2 font-bold animate-pulse"
                    >
                        <ActivityIcon size={20} />
                        Transaction en cours
                    </motion.button>
                )}

                {/* Password Modal */}
                <PasswordModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    title={modalAction === 'SELL' ? "Mettre en vente" : "Confirmer la réservation"}
                />
            </div>
        </Layout>
    );
};

export default TradeLayout;
