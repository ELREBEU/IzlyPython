import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api.mock';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

const RechargeCard = () => {
    const navigate = useNavigate();
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saveCard, setSaveCard] = useState(false);

    const amounts = [10, 20, 30, 40];

    const handleRecharge = async () => {
        if (!selectedAmount) return;
        setLoading(true);
        try {
            await api.wallet.topup(selectedAmount);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white md:bg-white">

                {/* MOBILE VERSION */}
                <div className="md:hidden flex flex-col h-full min-h-screen bg-white relative overflow-hidden">
                    {/* Blue Background - Goes to middle of circle */}
                    {/* Circle is w-[58vw] max 260px, starts at pt-6 (24px) after header (~120px) */}
                    {/* So circle center is at: 120px + 24px + (29vw or 130px) = ~274px */}
                    <div className="absolute top-0 left-0 right-0 bg-izly-blue-main z-0" style={{ height: 'calc(144px + 29vw)' }}></div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="w-full pt-4 pb-8 flex flex-col items-center justify-start text-black">
                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/recharge')}
                                className="absolute left-4 top-4 bg-black/20 p-2 rounded-lg"
                            >
                                <ArrowLeft size={24} className="text-black" />
                            </button>

                            {/* Icon Circle */}
                            <div className="bg-white p-4 rounded-full mb-3 shadow-lg">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                                    <circle cx="12" cy="12" r="9"/>
                                    <path d="M12 7v5M12 16h.01"/>
                                    <text x="15" y="10" fontSize="10" fill="currentColor">€</text>
                                </svg>
                            </div>

                            {/* Title */}
                            <h1 className="text-base font-bold uppercase tracking-wide px-4 text-center leading-tight">
                                RECHARGEMENT PAR CARTE<br />BANCAIRE
                            </h1>
                        </div>

                        {/* Main Content - Circle with amount buttons */}
                        <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-24 px-4 relative">
                            {/* Container for circle and buttons */}
                            <div className="relative w-full max-w-md mb-12 min-h-[400px]">
                                {/* White Circle Display - Centered */}
                                <div className="w-[58vw] h-[58vw] max-w-[260px] max-h-[260px] mx-auto bg-white rounded-full shadow-2xl flex flex-col items-center justify-center relative z-20">
                                    <span className="text-4xl font-bold text-gray-700">
                                        {selectedAmount ? `${selectedAmount},00` : '0,00'} €
                                    </span>
                                    <span className="text-xs text-gray-600 mt-2 font-medium">Montant minimum de 10,00 €</span>
                                </div>

                                {/* Amount Buttons - Positioned around the circle - ALL SAME SIZE */}
                                {/* 10€ - Left - starts below "Montant minimum" */}
                                <button
                                    onClick={() => setSelectedAmount(10)}
                                    className={clsx(
                                        "absolute w-[22vw] h-[22vw] max-w-[100px] max-h-[100px] rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg z-10",
                                        selectedAmount === 10
                                            ? "bg-izly-blue-main text-white scale-110"
                                            : "bg-izly-blue-main text-white"
                                    )}
                                    style={{ left: 'calc(50% - 170px)', top: 'calc(50% + 10px)' }}
                                >
                                    10 €
                                </button>

                                {/* 40€ - Right - same height as 10€ */}
                                <button
                                    onClick={() => setSelectedAmount(40)}
                                    className={clsx(
                                        "absolute w-[22vw] h-[22vw] max-w-[100px] max-h-[100px] rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg z-10",
                                        selectedAmount === 40
                                            ? "bg-izly-blue-main text-white scale-110"
                                            : "bg-izly-blue-main text-white"
                                    )}
                                    style={{ left: 'calc(50% + 90px)', top: 'calc(50% + 10px)' }}
                                >
                                    40 €
                                </button>

                                {/* 20€ - Bottom Left */}
                                <button
                                    onClick={() => setSelectedAmount(20)}
                                    className={clsx(
                                        "absolute w-[22vw] h-[22vw] max-w-[100px] max-h-[100px] rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg z-10",
                                        selectedAmount === 20
                                            ? "bg-izly-blue-main text-white scale-110"
                                            : "bg-izly-blue-main text-white"
                                    )}
                                    style={{ left: 'calc(50% - 120px)', top: 'calc(50% + 90px)' }}
                                >
                                    20 €
                                </button>

                                {/* 30€ - Bottom Right */}
                                <button
                                    onClick={() => setSelectedAmount(30)}
                                    className={clsx(
                                        "absolute w-[22vw] h-[22vw] max-w-[100px] max-h-[100px] rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg z-10",
                                        selectedAmount === 30
                                            ? "bg-izly-blue-main text-white scale-110"
                                            : "bg-izly-blue-main text-white"
                                    )}
                                    style={{ left: 'calc(50% + 20px)', top: 'calc(50% + 90px)' }}
                                >
                                    30 €
                                </button>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-start mb-6 w-full max-w-md px-2">
                                <button
                                    onClick={() => setSaveCard(!saveCard)}
                                    className={clsx(
                                        "w-7 h-7 rounded border-2 flex items-center justify-center flex-shrink-0",
                                        saveCard ? "bg-izly-blue-main border-izly-blue-main" : "bg-white border-izly-blue-main"
                                    )}
                                >
                                    {saveCard && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>
                                <label className="ml-3 text-xs text-gray-800 leading-snug">
                                    Enregistrer cette carte pour mes prochains rechargements
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col space-y-3 w-full max-w-md px-4">
                                <button
                                    onClick={handleRecharge}
                                    disabled={loading || !selectedAmount}
                                    className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wide"
                                >
                                    {loading ? "Traitement..." : "Confirmer"}
                                </button>
                                <button
                                    onClick={() => navigate('/recharge')}
                                    className="w-full bg-izly-blue-main text-white font-bold py-4 rounded-full hover:bg-cyan-600 transition-colors uppercase text-sm shadow-lg tracking-wide"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESKTOP VERSION - Keep original */}
                <div className="hidden md:flex flex-col h-full">
                    {/* Blue Header Section */}
                    <div className="bg-izly-blue-main w-full py-12 flex flex-col items-center justify-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 rounded-full scale-150 transform translate-y-1/2"></div>

                        <div className="bg-white/20 p-4 rounded-full mb-4 relative z-10">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="9"/>
                                <path d="M12 7v5M12 16h.01"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-medium uppercase tracking-wide relative z-10">Rechargement par carte bancaire</h1>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center pt-12 relative z-20 px-4">
                        {/* White Circle Display */}
                        <div className="w-96 h-96 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center mb-16 border-[12px] border-white">
                            <span className="text-7xl font-bold text-gray-600">
                                {selectedAmount ? `${selectedAmount},00` : '0,00'} €
                            </span>
                            <span className="text-lg text-gray-400 mt-4 font-medium">Montant minimum de 10 €</span>
                        </div>

                        {/* Bubbles */}
                        <div className="flex flex-wrap justify-center gap-8 mb-20 max-w-3xl">
                            {amounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setSelectedAmount(amt)}
                                    className={clsx(
                                        "w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold transition-all transform hover:scale-110 shadow-xl",
                                        selectedAmount === amt
                                            ? "bg-izly-blue-main text-white ring-8 ring-blue-200 scale-110"
                                            : "bg-izly-blue-main text-white hover:bg-cyan-600"
                                    )}
                                >
                                    {amt} €
                                </button>
                            ))}
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center mb-12">
                            <input type="checkbox" id="save-card" className="w-4 h-4 text-izly-blue-main border-gray-300 rounded focus:ring-izly-blue-main" />
                            <label htmlFor="save-card" className="ml-2 text-sm text-gray-600">
                                Je souhaite que ma carte soit enregistrée pour mes prochains rechargements
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-4 w-full max-w-md">
                            <button
                                onClick={() => navigate('/recharge')}
                                className="flex-1 bg-gray-200 text-gray-600 font-bold py-3 rounded-full hover:bg-gray-300 transition-colors uppercase text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRecharge}
                                disabled={loading || !selectedAmount}
                                className="flex-1 bg-izly-blue-main text-white font-bold py-3 rounded-full hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm shadow-lg"
                            >
                                {loading ? "Traitement..." : "Valider"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RechargeCard;
