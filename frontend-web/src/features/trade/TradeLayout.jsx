import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    UserCircleIcon,
    ShoppingBagIcon,
    StoreIcon,
    SwitchCameraIcon,
    HomeIcon
} from 'lucide-react';
import TradeMap from './TradeMap';
import TradeHome from './TradeHome';
import SellerDashboard from './components/SellerDashboard';
import MealDetailSheet from './components/MealDetailSheet';
import TradeChat from './components/TradeChat';
import { api } from '../../services/api';
import { ActivityIcon } from 'lucide-react';

const TradeLayout = () => {
    const navigate = useNavigate();

    // Views: 'home' | 'map' | 'seller' | 'transaction'
    const [view, setView] = useState('home');

    // Data State
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Transaction state
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showMealDetail, setShowMealDetail] = useState(false);
    const [transactionSeller, setTransactionSeller] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [sellerActive, setSellerActive] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Profile & Balance
                const profile = await api.profile.getProfile();
                const wallet = await api.wallet.getBalance();

                if (profile) {
                    setUser({
                        ...profile,
                        // Mock location for now if not in profile, centered on Paris or user address
                        lat: 48.8566,
                        lng: 2.3522
                    });
                }
                setBalance(wallet.balance || 0);

                // 2. Get Offers
                const marketOffers = await api.market.listOffers();
                // Transform API offers to Map format
                const formattedOffers = marketOffers.map(offer => ({
                    id: offer.id,
                    name: offer.seller_name || "Vendeur",
                    price: 1.50, // Mock price until API provides it
                    lat: 48.8566 + (Math.random() - 0.5) * 0.01, // Mock location variation
                    lng: 2.3522 + (Math.random() - 0.5) * 0.01,
                    time_left: "15 min",
                    distance: "250m",
                    rating: offer.seller_rating || 5.0,
                    trades_count: 0,
                    initial: (offer.seller_name || "V")[0],
                    tariff_code: offer.seller_tariff_code
                }));
                setOffers(formattedOffers);

                // 3. Check Active Session
                const credentials = JSON.parse(localStorage.getItem('izly_credentials') || '{}');
                if (credentials.userId) {
                    const history = await api.trade.getHistory(credentials.userId);
                    const active = history.find(s => ['CREATED', 'QR_SENT'].includes(s.status));
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

        fetchData();
    }, []);

    // Navigation Handlers
    const handleNavigate = (targetView) => {
        setView(targetView);
        if (targetView === 'map') {
            setShowMealDetail(false);
        }
    };

    const handleOpenActiveSession = () => {
        if (activeSession) {
            setTransactionSeller({ sessionId: activeSession.id });
            setView('transaction');
        }
    };

    const handleMarkerClick = (seller) => {
        setSelectedSeller(seller);
        setShowMealDetail(true);
    };

    const handleCommand = (sessionData) => {
        setTransactionSeller(sessionData);
        setShowMealDetail(false);
        setView('transaction');
    };

    const handleCloseTransaction = () => {
        setView('home');
        setTransactionSeller(null);
        setSelectedSeller(null);
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#121212] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="trade-app relative h-screen w-screen bg-[#121212] overflow-hidden">

            {/* VIEW: HOME (Dashboard) */}
            {view === 'home' && (
                <TradeHome
                    user={user}
                    balance={balance}
                    onNavigate={handleNavigate}
                />
            )}

            {/* VIEW: MAP (Buyer) */}
            {view === 'map' && (
                <div className="absolute inset-0 z-0">
                    <TradeMap
                        user={user}
                        offers={offers}
                        onMarkerClick={handleMarkerClick}
                    />

                    {/* Map Header Overlay */}
                    <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                        <div className="flex justify-between items-center pointer-events-auto">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('home')}
                                className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white shadow-lg"
                            >
                                <ArrowLeftIcon size={24} />
                            </motion.button>
                            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
                                <span className="text-white font-bold text-sm">Mode Carte</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: SELLER (Dashboard) */}
            {view === 'seller' && (
                <div className="absolute inset-0 z-0 bg-[#121212]">
                    <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('home')}
                            className="p-3 bg-white/10 rounded-full text-white"
                        >
                            <ArrowLeftIcon size={24} />
                        </motion.button>
                    </div>
                    <SellerDashboard
                        isActive={sellerActive}
                        onActivate={() => setSellerActive(true)}
                        onDeactivate={() => setSellerActive(false)}
                    />
                </div>
            )}

            {/* OVERLAYS & SHEETS */}

            {/* Meal Detail Sheet (Map Mode) */}
            <AnimatePresence>
                {view === 'map' && showMealDetail && selectedSeller && (
                    <MealDetailSheet
                        seller={selectedSeller}
                        onCommand={handleCommand}
                        onClose={() => setShowMealDetail(false)}
                    />
                )}
            </AnimatePresence>

            {/* Transaction Chat (Fullscreen) */}
            <AnimatePresence>
                {view === 'transaction' && transactionSeller && (
                    <TradeChat
                        sessionId={transactionSeller.sessionId}
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
        </div>
    );
};

export default TradeLayout;
