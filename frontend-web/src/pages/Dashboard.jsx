import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import MoneyCircle from '../components/MoneyCircle';
import UserDropdown from '../components/UserDropdown';
import { api } from '../services/api';
import { User } from 'lucide-react';
import clsx from 'clsx';

const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCountersOpen, setIsCountersOpen] = useState(false);
    const [showOperations, setShowOperations] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const balanceData = await api.wallet.getBalance();
            const historyData = await api.transactions.getHistory();
            setBalance(balanceData.balance);
            setTransactions(historyData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const [activeTab, setActiveTab] = useState('RECHARGE'); // 'RECHARGE', 'PAYMENT', 'TRANSFER'

    const filteredTransactions = transactions.filter(tx => {
        if (activeTab === 'RECHARGE') return tx.type === 'RECHARGE';
        if (activeTab === 'PAYMENT') return tx.type === 'PAYMENT';
        if (activeTab === 'TRANSFER') return tx.type === 'TRANSFER';
        return true;
    });

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.abs(amount));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8">

                {/* LEFT SIDE: Blue Background (Balance & Operations) */}
                <div className="w-full md:w-1/2 bg-izly-blue-main relative flex flex-col items-center pt-0 md:pt-12 px-0 pb-0 min-h-screen md:min-h-screen overflow-y-auto">

                    {/* MOBILE HEADER: Logo & User Icon */}
                    <div className="md:hidden w-full flex justify-between items-center px-4 mb-0 relative z-30 py-1">
                        <img src="/logo_blanc.svg" alt="Izly" className="w-16 h-auto" />
                        <div className="relative z-50">
                            <UserDropdown />
                        </div>
                    </div>

                    {/* DESKTOP ONLY: User Dropdown */}
                    <div className="hidden md:block absolute top-12 right-8 z-50">
                        <UserDropdown />
                    </div>

                    {/* Decorative Circles Background */}
                    <div className="md:hidden absolute top-10 left-0 w-full h-96 pointer-events-none z-0">
                        <div className="absolute top-0 -left-10 w-72 h-72 rounded-full border-2 border-white/15"></div>
                        <div className="absolute top-20 left-0 w-56 h-56 rounded-full border-2 border-white/10"></div>
                    </div>

                    {/* Money Circle Area */}
                    <div className="-mt-10 md:mt-0 mb-0 md:mb-4 md:scale-100 relative z-20 w-full flex justify-center">
                        <MoneyCircle amount={balance} isLoading={loading} />
                    </div>

                    {/* Paper Plane Icon - Mobile Only */}
                    <div className="md:hidden absolute right-6 z-10" style={{ top: '28%' }}>
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-70">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </div>

                    {/* MOBILE ONLY: Vos Avantages (Black Section) */}
                    <div className="md:hidden w-full bg-[#1D1D1B] text-white py-1.5 px-4 flex flex-col items-center justify-center relative z-20 -mt-14">
                        <h2 className="text-base font-light mb-1 text-center tracking-wide">Vos avantages</h2>
                        <div className="w-14 h-0.5 bg-izly-blue-main mb-1.5"></div>
                        <div
                            className="w-full text-center cursor-pointer flex flex-col items-center py-0"
                            onClick={() => setIsCountersOpen(!isCountersOpen)}
                        >
                            <span className="text-[11px] font-bold text-izly-blue-main uppercase tracking-widest">VOIR MES COMPTEURS</span>
                            <div className={`mt-1 text-izly-blue-main transition-transform duration-300 text-sm ${isCountersOpen ? 'rotate-180' : ''}`}>▼</div>
                        </div>
                        <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${isCountersOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-4 px-8">
                                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                    <span className="text-xl font-bold text-izly-blue-main">0,00 €</span>
                                    <span className="text-gray-300 text-sm">Crédits Izly</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                    <span className="text-xl font-bold text-izly-blue-main">0</span>
                                    <span className="text-gray-300 text-sm">Repas sociaux</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                    <span className="text-xl font-bold text-izly-blue-main">0</span>
                                    <span className="text-gray-300 text-sm">Points fidélité</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Last Operations Header (Desktop) & Operations List (Mobile) */}
                    <div className="w-full md:max-w-xl mt-0 md:-mt-24 relative z-10 bg-white md:bg-transparent pb-24 md:pb-0">
                        <div
                            className="hidden md:flex items-center justify-between mb-4 pl-4 border-l-4 border-white cursor-pointer group"
                            onClick={() => setShowOperations(!showOperations)}
                        >
                            <h2 className="text-white text-xl font-medium">
                                Dernières opérations
                            </h2>
                            <div className={`text-white transition-transform duration-300 ${showOperations ? 'rotate-180' : ''}`}>▼</div>
                        </div>

                        {/* Operations Filter/Tabs - Always Visible */}
                        <div className="bg-white md:bg-white md:rounded-lg md:shadow-lg flex text-center text-sm font-bold text-gray-700 w-full border-b-2 border-izly-blue-main md:border-none">
                            <div
                                className={`flex-1 py-3 md:py-6 cursor-pointer hover:text-izly-blue-main flex flex-col items-center border-r-2 border-izly-blue-main md:border-r border-gray-200 group ${activeTab === 'RECHARGE' ? 'text-izly-blue-main' : ''}`}
                                onClick={() => { setActiveTab('RECHARGE'); setShowOperations(true); }}
                            >
                                <div className="relative mb-0">
                                    <img src="/icons/recharger-icon.svg" alt="Recharger" className={`w-12 h-12 md:w-20 md:h-20 transition-transform ${activeTab === 'RECHARGE' ? 'scale-110' : 'group-hover:scale-110'}`} />
                                </div>
                                <span className="mt-0.5 text-[11px] md:text-sm font-medium">Rechargements</span>
                            </div>
                            <div
                                className={`flex-1 py-3 md:py-6 cursor-pointer hover:text-izly-blue-main flex flex-col items-center border-r-2 border-izly-blue-main md:border-r border-gray-200 group ${activeTab === 'PAYMENT' ? 'text-izly-blue-main' : ''}`}
                                onClick={() => { setActiveTab('PAYMENT'); setShowOperations(true); }}
                            >
                                <div className="relative mb-0">
                                    <img src="/icons/payer-icon.svg" alt="Payer" className={`w-12 h-12 md:w-20 md:h-20 transition-transform ${activeTab === 'PAYMENT' ? 'scale-110' : 'group-hover:scale-110'}`} />
                                </div>
                                <span className="mt-0.5 text-[11px] md:text-sm font-medium">Paiements</span>
                            </div>
                            <div
                                className={`flex-1 py-3 md:py-6 cursor-pointer hover:text-izly-blue-main flex flex-col items-center group ${activeTab === 'TRANSFER' ? 'text-izly-blue-main' : ''}`}
                                onClick={() => { setActiveTab('TRANSFER'); setShowOperations(true); }}
                            >
                                <div className="relative mb-0">
                                    <img src="/icons/transfer-to-bank-account.svg" alt="Virement" className={`w-12 h-12 md:w-20 md:h-20 transition-transform ${activeTab === 'TRANSFER' ? 'scale-110' : 'group-hover:scale-110'}`} />
                                </div>
                                <span className="mt-0.5 text-[11px] md:text-sm leading-tight font-medium">Virements vers<br />ma banque</span>
                            </div>
                        </div>

                        {/* Legend - Scaled Up - Always Visible */}
                        <div className="flex justify-center space-x-3 md:space-x-8 text-[11px] md:text-base font-semibold text-gray-800 md:text-white my-2 md:mb-6 opacity-100 bg-white md:bg-transparent py-1.5">
                            <div className="flex items-center"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 mr-1"></span> Succès</div>
                            <div className="flex items-center"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-purple-500 mr-1"></span> En attente</div>
                            <div className="flex items-center"><span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-orange-500 mr-1"></span> Remboursé</div>
                        </div>

                        {/* Collapsible Section: Transactions Only */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showOperations ? 'max-h-[800px] opacity-100' : 'max-h-[800px] opacity-100 md:max-h-0 md:opacity-0'}`}>

                            {/* Transactions List */}
                            <div className="bg-white md:bg-white rounded-xl overflow-hidden shadow-sm mx-4 md:mx-0">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500 text-lg">Chargement...</div>
                                ) : filteredTransactions.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-lg">Aucune opération</div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {filteredTransactions.map((tx) => (
                                            <li key={tx.id} className="p-4 flex items-center justify-between text-gray-800 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    {/* Icon based on type */}
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full border border-izly-cyan flex items-center justify-center text-izly-cyan bg-white">
                                                            {tx.type === 'RECHARGE' && <span className="text-xl font-bold">€</span>}
                                                            {tx.type === 'PAYMENT' && <img src="/icons/payer-icon.svg" alt="Payer" className="w-6 h-6" />}
                                                            {tx.type === 'TRANSFER' && <span className="text-xl font-bold">🏦</span>}
                                                        </div>
                                                        {/* Small plus icon for recharge */}
                                                        {tx.type === 'RECHARGE' && (
                                                            <div className="absolute -top-1 -right-1 bg-white rounded-full">
                                                                <div className="w-4 h-4 rounded-full border border-izly-cyan flex items-center justify-center text-[10px] text-izly-cyan font-bold">+</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-sm md:text-base text-black">{tx.label}</p>
                                                        <p className="text-xs text-izly-cyan font-bold">{formatDate(tx.date)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-lg md:text-xl text-izly-cyan">
                                                        {tx.type === 'RECHARGE' ? '+' : ''}{formatAmount(tx.amount)}
                                                    </span>
                                                    {/* Status Dot (Assuming success for now as we don't have status in DB yet) */}
                                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Airplane Image (Decorative - Left Side) */}
                        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-20">
                            <div className="h-32 bg-gradient-to-t from-white/20 to-transparent"></div>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDE: Content (Vos Avantages) - DESKTOP ONLY */}
                <div className="hidden md:flex w-full md:w-1/2 flex-col">

                    {/* Top Section: Vos Avantages (Dark) */}
                    <div className="bg-izly-dark-counter text-white p-12 flex flex-col items-center justify-center flex-1 min-h-[400px]">
                        <h2 className="text-4xl font-light mb-12 text-center">Vos avantages</h2>

                        <div
                            className="w-full max-w-md border-t border-b border-gray-700 py-6 text-center cursor-pointer hover:bg-white/5 transition-colors group"
                            onClick={() => setIsCountersOpen(!isCountersOpen)}
                        >
                            <span className="text-xl font-light group-hover:text-izly-blue-main transition-colors">Voir mes compteurs</span>
                            <div className={`mt-2 text-izly-blue-main transition-transform duration-300 ${isCountersOpen ? 'rotate-180' : ''}`}>▼</div>
                        </div>

                        <div className={`w-full max-w-md overflow-hidden transition-all duration-500 ease-in-out ${isCountersOpen ? 'max-h-96 opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className="text-2xl font-bold text-izly-blue-main">0,00 €</span>
                                    <span className="text-gray-300">Crédits Izly</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className="text-2xl font-bold text-izly-blue-main">0</span>
                                    <span className="text-gray-300">Repas sociaux</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className="text-2xl font-bold text-izly-blue-main">0</span>
                                    <span className="text-gray-300">Points fidélité</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Crous Engagement (Blue/Image) */}
                    <div className="bg-[#788CB6] flex-1 min-h-[400px] relative overflow-hidden flex items-center justify-center p-12">
                        {/* Mock Content for Crous Engagement */}
                        <div className="text-center text-white z-10">
                            <div className="bg-white p-4 rounded-lg inline-block mb-6 shadow-lg">
                                <img src="/icons/payer-icon.svg" alt="" className="w-12 h-12 text-izly-black" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Les Crous s'engagent !</h3>
                            <p className="text-lg opacity-90 mb-8 max-w-md mx-auto">
                                Les Crous s'engagent pour une alimentation de qualité
                            </p>
                            <button className="border border-white text-white px-6 py-2 uppercase text-sm hover:bg-white hover:text-[#788CB6] transition-colors">
                                En savoir plus
                            </button>
                        </div>

                        {/* Background Overlay/Image Mock */}
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                </div>

            </div>
        </Layout >
    );
};

export default Dashboard;
