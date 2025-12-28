import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';

const Payment = () => {
    const [qrImage, setQrImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const base64 = await api.payment.getQRCode();
            setQrImage(`data:image/png;base64,${base64}`);
        } catch (e) {
            console.error(e);
            setError("Erreur lors de la génération du QR Code");
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate on mount for mobile
    useEffect(() => {
        handleGenerate();
    }, []);

    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white md:bg-white">

                {/* MOBILE VERSION */}
                <div className="md:hidden flex flex-col h-full min-h-screen bg-gray-50">
                    {/* Blue Header Section */}
                    <div className="bg-izly-blue-main w-full pt-4 pb-12 flex flex-col items-center justify-start text-black relative">
                        {/* Icon Circle */}
                        <div className="bg-white p-5 rounded-full mb-4 shadow-lg">
                            <img src="/icons/payer-icon.svg" alt="Payer" className="w-12 h-12" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold uppercase tracking-wider">PAYER</h1>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex-1 flex flex-col items-center bg-gray-50 pt-8 pb-24 px-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-izly-blue-main"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center mb-4">{error}</div>
                        ) : qrImage ? (
                            <div className="flex flex-col items-center w-full">
                                {/* Large QR Code Circle */}
                                <div className="w-[75vw] h-[75vw] max-w-[340px] max-h-[340px] bg-white rounded-full shadow-2xl flex items-center justify-center p-6 mb-8 overflow-hidden">
                                    {/* Real QR Code Image */}
                                    <img src={qrImage} alt="QR Code Izly" className="w-full h-full object-contain" />
                                </div>

                                {/* Expiry Text */}
                                <p className="text-gray-900 text-xs font-bold mb-6 text-center">
                                    QR Code utilisable jusqu'au {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'H')}
                                </p>

                                {/* Instruction Text */}
                                <p className="text-gray-700 text-sm text-center mb-8 max-w-xs leading-relaxed">
                                    Présentez le QR code au lecteur du point d'encaissement
                                </p>

                                {/* Regenerate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="bg-izly-blue-main text-white font-bold py-3 px-10 rounded-full shadow-lg hover:bg-cyan-600 transition-colors uppercase tracking-wide text-xs disabled:opacity-50"
                                >
                                    {loading ? "Génération..." : "Régénérer le QR Code"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* DESKTOP VERSION - Keep original */}
                <div className="hidden md:flex flex-col h-full">
                    {/* Blue Header Section */}
                    <div className="bg-izly-blue-main w-full py-16 flex flex-col items-center justify-center text-white relative">
                        <div className="bg-white/20 p-5 rounded-full mb-6">
                            <img src="/icons/payer-icon.svg" alt="Payer" className="w-14 h-14" />
                        </div>
                        <h1 className="text-3xl font-medium uppercase tracking-wide mb-8">GÉNÉRER DES QR CODES</h1>

                        {/* Generate Button (Overlapping) */}
                        <div className="absolute -bottom-8">
                            <button
                                onClick={handleGenerate}
                                className="bg-izly-blue-main text-white font-bold py-4 px-12 rounded-full shadow-xl hover:bg-cyan-600 transition-colors uppercase tracking-wide text-lg border-4 border-white"
                            >
                                {loading ? "Génération..." : "Générer 1 QR Code"}
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center pt-24 px-4 bg-white">
                        {qrImage && (
                            <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl">
                                <div className="w-96 h-96 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-100 mb-12 p-8 overflow-hidden">
                                    <img src={qrImage} alt="QR Code Izly" className="w-full h-full object-contain" />
                                </div>

                                <p className="text-gray-500 text-base font-medium mb-10">
                                    QR Code(s) utilisable(s) jusqu'au {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>

                                <button className="border-2 border-gray-300 text-gray-600 font-bold py-3 px-10 rounded-full hover:bg-gray-50 transition-colors uppercase text-sm tracking-wider">
                                    Télécharger en PDF
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="text-red-500 mt-4">{error}</div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Payment;
