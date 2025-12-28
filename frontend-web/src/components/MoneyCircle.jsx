import React from 'react';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MoneyCircle = ({ amount, isLoading }) => {
    return (
        <div className="relative flex items-center justify-center w-[83vw] h-[83vw] max-w-[380px] max-h-[380px] md:w-[600px] md:h-[600px] md:max-w-none md:max-h-none mx-auto my-0 md:my-8">
            {/* Circle Container / Outer */}
            <div className="w-full h-full rounded-full flex items-center justify-center p-5 md:p-12 bg-white/5">
                {/* Circle Middle 2 */}
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center p-5 md:p-12">
                    {/* Circle Middle 1 */}
                    <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center p-4 md:p-10">
                        {/* Main White Circle */}
                        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center relative shadow-2xl">

                            {/* Plus Button (Absolute positioned) */}
                            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white rounded-full p-1 md:p-1.5 shadow-lg z-10">
                                <Link to="/recharge" className="block bg-izly-green rounded-full p-2 md:p-3 hover:bg-green-600 transition-colors">
                                    <Plus size={32} className="text-white md:w-10 md:h-10" />
                                </Link>
                            </div>

                            {isLoading ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-[3.2rem] leading-none md:text-8xl font-bold text-[#0087B0] tracking-tight flex items-start justify-center mb-2 md:mb-3">
                                        <span>{amount > 0 ? '+' : ''}</span>
                                        <span>{Math.floor(amount)},{Math.round((amount % 1) * 100).toString().padStart(2, '0')}</span>
                                        <span className="text-3xl md:text-5xl mt-1 md:mt-4 ml-1 font-bold">€</span>
                                    </div>
                                    <div className="text-gray-700 text-xs md:text-base font-normal">
                                        Solde au
                                    </div>
                                    <div className="text-gray-700 text-xs md:text-base mt-0.5 md:mt-1 font-normal">
                                        {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'H')}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoneyCircle;
