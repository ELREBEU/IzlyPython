import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { CreditCard, Landmark, Users, MapPin, Euro } from 'lucide-react';

const RechargeOption = ({ to, icon: Icon, label, subLabel, isSvg = false }) => (
    <Link to={to} className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex items-center hover:shadow-lg transition-all group h-40">
        <div className="mr-6 text-izly-blue-main group-hover:scale-110 transition-transform">
            {isSvg ? (
                <img src={Icon} alt="" className="w-14 h-14" />
            ) : (
                <Icon size={56} strokeWidth={1.5} />
            )}
        </div>
        <div className="text-left">
            <h3 className="text-izly-black font-bold text-lg">{label}</h3>
            {subLabel && <p className="text-gray-400 text-sm mt-2">{subLabel}</p>}
        </div>
    </Link>
);

const RechargeIndex = () => {
    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white">

                {/* Blue Header Section */}
                <div className="bg-izly-blue-main w-full py-12 flex flex-col items-center justify-center text-white">
                    <div className="bg-white/20 p-4 rounded-full mb-4">
                        <Euro size={48} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-medium uppercase tracking-wide mb-2">Recharger</h1>
                    <p className="text-white/80 text-center max-w-xl px-4">
                        Rechargez votre compte Izly à tout moment de façon simple et sécurisée, par virement immédiat, par carte bancaire ou espèces
                    </p>
                </div>

                {/* Options Grid */}
                <div className="flex-1 w-full max-w-6xl mx-auto p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <RechargeOption
                            to="/recharge/transfer"
                            icon="/icons/transfer-to-bank-account.svg"
                            isSvg={true}
                            label="Rechargement par virement immédiat sécurisé"
                            subLabel="(à partir de 5€)"
                        />
                        <RechargeOption
                            to="/recharge/card"
                            icon="/icons/recharger-icon.svg"
                            isSvg={true}
                            label="Rechargement par carte bancaire"
                            subLabel="(à partir de 10 €)"
                        />
                        <RechargeOption
                            to="#"
                            icon={Users}
                            label="Rechargement par un tiers"
                        />
                        <RechargeOption
                            to="#"
                            icon={MapPin}
                            label="Rechargement sur Campus"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RechargeIndex;
