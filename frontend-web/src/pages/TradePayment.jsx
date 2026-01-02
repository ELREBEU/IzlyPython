import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeftIcon } from 'lucide-react';

const TradePayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { qrCode, expiration } = location.state || {};

    if (!qrCode) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
                    <p className="text-gray-500 mb-4">Aucun QR Code disponible.</p>
                    <button onClick={() => navigate('/trade')} className="text-blue-600 font-bold">
                        Retour au Trading
                    </button>
                </div>
            </Layout>
        );
    }

    const qrImage = `data:image/png;base64,${qrCode}`;

    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white md:bg-white">

                {/* MOBILE VERSION */}
                <div className="md:hidden flex flex-col h-full min-h-screen bg-gray-50">
                    {/* Blue Header Section */}
                    {/* Increased padding-bottom to extend blue background lower */}
                    <div className="bg-izly-blue-main w-full pt-4 pb-80 flex flex-col items-center justify-start text-black relative overflow-hidden">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute top-4 left-4 z-50 p-2 bg-white/20 rounded-full text-white"
                        >
                            <ArrowLeftIcon size={24} />
                        </button>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                            <div className="absolute top-10 -left-10 w-80 h-80 rounded-full border-2 border-white/10"></div>
                            <div className="absolute top-20 -right-20 w-96 h-96 rounded-full border-2 border-white/15"></div>
                            <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full border-2 border-white/5"></div>
                        </div>

                        {/* Icon Circle */}
                        <div className="bg-white p-5 rounded-full mb-4 shadow-lg relative z-10">
                            <img src="/icons/payer-icon.svg" alt="Payer" className="w-12 h-12" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold uppercase tracking-wider relative z-10">PAYER</h1>
                    </div>

                    {/* QR Code Section */}
                    {/* Adjusted negative margin to position circle correctly over the blue/white boundary */}
                    <div className="flex-1 flex flex-col items-center bg-gray-50 -mt-64 pt-0 pb-24 px-4 relative z-20">
                        <div className="flex flex-col items-center w-full animate-fade-in">
                            {/* Large QR Code Circle */}
                            <div className="w-[90vw] h-[90vw] max-w-[420px] max-h-[420px] bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl flex items-center justify-center p-12 mb-8 overflow-hidden border-4 border-white relative animate-scale-in">
                                <img src={qrImage} alt="QR Code Izly" className="w-full h-full object-contain relative z-10" />
                            </div>

                            {/* Expiry Text */}
                            <p className="text-gray-900 text-xs font-bold mb-6 text-center px-4">
                                {expiration ? (
                                    <>Code utilisable jusqu'au {expiration}</>
                                ) : (
                                    <>Code utilisable pendant 15 minutes</>
                                )}
                            </p>

                            {/* Instruction Text */}
                            <p className="text-gray-500 text-sm text-center mb-8 max-w-xs leading-relaxed">
                                Présenter le QR code au lecteur du point d'encaissement
                            </p>
                        </div>
                    </div>
                </div>

                {/* DESKTOP VERSION */}
                <div className="hidden md:flex flex-col h-full">
                    <div className="bg-izly-blue-main w-full py-16 flex flex-col items-center justify-center text-white relative">
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute top-8 left-8 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon size={24} />
                        </button>
                        <div className="bg-white/20 p-5 rounded-full mb-6">
                            <img src="/icons/payer-icon.svg" alt="Payer" className="w-14 h-14" />
                        </div>
                        <h1 className="text-3xl font-medium uppercase tracking-wide mb-8">GÉNÉRER DES QR CODES</h1>
                    </div>

                    <div className="flex-1 flex flex-col items-center pt-24 px-4 bg-white">
                        <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl">
                            <div className="w-[500px] h-[500px] bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl flex items-center justify-center border-4 border-white mb-12 p-14 overflow-hidden relative">
                                <img src={qrImage} alt="QR Code Izly" className="w-full h-full object-contain relative z-10" />
                            </div>

                            <p className="text-gray-900 text-base font-bold mb-4 text-center">
                                {expiration ? (
                                    <>Code utilisable jusqu'au {expiration}</>
                                ) : (
                                    <>Code utilisable pendant 15 minutes</>
                                )}
                            </p>

                            <p className="text-gray-500 text-sm text-center mb-8 max-w-xs leading-relaxed">
                                Présenter le QR code au lecteur du point d'encaissement
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TradePayment;
