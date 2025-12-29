import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';

const MyIzlyIdentifier = () => {
    const [qrImage, setQrImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        handleGenerate();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const base64 = await api.auth.getMyIzlyIdentifierQR();
            setQrImage(`data:image/png;base64,${base64}`);
        } catch (e) {
            console.error(e);
            setError("Erreur lors de la génération de votre identifiant Izly");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-full min-h-screen bg-gray-50 -m-4 md:-m-8">
                {/* Blue Header */}
                <div className="bg-iz ly-blue-main w-full py-12 md:py-16 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    {/* Decorative Circles Background - Mobile Only */}
                    <div className="md:hidden absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        <div className="absolute top-10 -left-10 w-80 h-80 rounded-full border-2 border-white/10"></div>
                        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full border-2 border-white/15"></div>
                    </div>

                    {/* Icon Circle */}
                    <div className="bg-white/20 p-5 rounded-full mb-6 relative z-10">
                        <img src="/icons/user.svg" alt="Mon identifiant" className="w-14 h-14" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-medium uppercase tracking-wide relative z-10">Mon identifiant Izly</h1>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                    {loading ? (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-izly-blue-main border-t-transparent"></div>
                            <p className="text-gray-600 text-sm">Génération de votre identifiant...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 max-w-md w-full">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">!</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-red-900 mb-1">Erreur</h3>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : qrImage && (
                        <div className="flex flex-col items-center animate-fade-in">
                            {/* QR Code */}
                            <div className="w-80 h-80 md:w-96 md:h-96 bg-white rounded-lg shadow-2xl flex items-center justify-center p-8 mb-8">
                                <img src={qrImage} alt="Mon identifiant Izly" className="w-full h-full object-contain" />
                            </div>

                            {/* Info Text */}
                            <p className="text-gray-700 text-sm text-center max-w-md leading-relaxed mb-4">
                                Ce QR code est votre identifiant Izly unique. Présentez-le pour vous identifier.
                            </p>

                            <button
                                onClick={handleGenerate}
                                className="border-2 border-gray-300 text-gray-600 font-bold py-3 px-10 rounded-full hover:bg-gray-50 transition-colors uppercase text-sm tracking-wider"
                            >
                                Régénérer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MyIzlyIdentifier;
