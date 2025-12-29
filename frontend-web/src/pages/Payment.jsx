import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';

const Payment = () => {
    const [qrImage, setQrImage] = useState(null);
    const [qrExpiration, setQrExpiration] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (isRetry = false) => {
        setLoading(true);
        setError(null);
        if (!isRetry) {
            setQrImage(null); // Clear previous QR code when generating new one
            setQrExpiration(null);
        }
        try {
            const response = await api.payment.getQRCode();
            setQrImage(`data: image / png; base64, ${response.qr_code_base64} `);
            setQrExpiration(response.expiration);
            setError(null); // Explicitly clear error on success
        } catch (e) {
            console.error(e);

            // If it's a 401 and not already a retry, try once more
            if (e.response?.status === 401 && !isRetry) {
                console.log("🔄 First attempt failed with 401, retrying...");
                setLoading(false);
                setTimeout(() => handleGenerate(true), 500);
                return;
            }

            let errorMsg = "Erreur lors de la génération du QR Code";

            if (e.message.includes("Credentials missing")) {
                errorMsg = "⚠️ Veuillez vous connecter d'abord pour générer un QR Code";
            } else if (e.response?.status === 401) {
                errorMsg = "❌ Identifiants Izly invalides. Vérifiez votre email/mot de passe.";
            } else if (e.response?.status === 422) {
                errorMsg = "⚠️ Données de requête invalides. Veuillez vous reconnecter.";
            } else if (e.response?.data?.detail) {
                errorMsg = e.response.data.detail;
            }

            setError(errorMsg);
            setQrImage(null); // Ensure QR image is cleared on error
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate on mount for mobile
    useEffect(() => {
        handleGenerate(false);
    }, []);

    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white md:bg-white">

                {/* MOBILE VERSION */}
                <div className="md:hidden flex flex-col h-full min-h-screen bg-gray-50">
                    {/* Blue Header Section with Decorative Circles */}
                    <div className="bg-izly-blue-main w-full pt-4 pb-64 flex flex-col items-center justify-start text-black relative overflow-hidden">
                        {/* Decorative Circles Background */}
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

                    {/* QR Code Section - Overlapping with blue background */}
                    <div className="flex-1 flex flex-col items-center bg-gray-50 -mt-56 pt-0 pb-24 px-4 relative z-20">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-izly-blue-main border-t-transparent"></div>
                                <p className="text-gray-600 text-sm font-medium animate-pulse">Génération du QR Code...</p>
                            </div>
                        ) : error && !qrImage ? (
                            <div className="flex flex-col items-center w-full max-w-md space-y-6">
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 w-full">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">!</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-red-900 mb-1">Erreur</h3>
                                            <p className="text-red-700 text-sm">{error}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    className="bg-izly-blue-main text-white font-bold py-3 px-10 rounded-full shadow-lg hover:bg-cyan-600 transition-all duration-300 uppercase tracking-wide text-xs active:scale-95"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : qrImage ? (
                            <div className="flex flex-col items-center w-full animate-fade-in">
                                {/* Large QR Code Circle with Animation - ENLARGED */}
                                <div className="w-[90vw] h-[90vw] max-w-[420px] max-h-[420px] bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl flex items-center justify-center p-12 mb-8 overflow-hidden border-4 border-white relative animate-scale-in">
                                    {/* Real QR Code Image */}
                                    <img src={qrImage} alt="QR Code Izly" className="w-full h-full object-contain relative z-10" />
                                </div>

                                {/* Expiry Text - DYNAMIC */}
                                <p className="text-gray-900 text-xs font-bold mb-6 text-center px-4">
                                    {qrExpiration ? (
                                        <>QR Code utilisable jusqu'au {qrExpiration}</>
                                    ) : (
                                        <>QR Code utilisable jusqu'au {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'H')}</>
                                    )}
                                </p>

                                {/* Instruction Text */}
                                <p className="text-gray-700 text-sm text-center mb-8 max-w-xs leading-relaxed">
                                    Présentez le QR code au lecteur du point d'encaissement
                                </p>

                                {/* Regenerate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="bg-izly-blue-main text-white font-bold py-3 px-10 rounded-full shadow-lg hover:bg-cyan-600 transition-all duration-300 uppercase tracking-wide text-xs disabled:opacity-50 active:scale-95"
                                >
                                    {loading ? "Génération..." : "Régénérer le QR Code"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* DESKTOP VERSION */}
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
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-izly-blue-main border-t-transparent"></div>
                                <p className="text-gray-600 text-sm font-medium animate-pulse">Génération du QR Code...</p>
                            </div>
                        ) : error && !qrImage ? (
                            <div className="flex flex-col items-center w-full max-w-md space-y-6">
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 w-full">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">!</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-red-900 mb-1">Erreur</h3>
                                            <p className="text-red-700 text-sm">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : qrImage ? (
                            <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl">
                                {/* Enlarged QR Code Circle - MUCH BIGGER */}
                                <div className="w-[500px] h-[500px] bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl flex items-center justify-center border-4 border-white mb-12 p-14 overflow-hidden relative">
                                    {/* NO hover animation on desktop */}
                                    <img src={qrImage} alt="QR Code Izly" className="w-full h-full object-contain relative z-10" />
                                </div>

                                {/* Dynamic Expiration Text */}
                                <p className="text-gray-900 text-base font-bold mb-10 text-center">
                                    {qrExpiration ? (
                                        <>QR Code utilisable jusqu'au {qrExpiration}</>
                                    ) : (
                                        <>QR Code utilisable jusqu'au {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>
                                    )}
                                </p>

                                <button
                                    onClick={handleGenerate}
                                    className="border-2 border-gray-300 text-gray-600 font-bold py-3 px-10 rounded-full hover:bg-gray-50 transition-colors uppercase text-sm tracking-wider"
                                >
                                    Régénérer le QR Code
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Payment;
