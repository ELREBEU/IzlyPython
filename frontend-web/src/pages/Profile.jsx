import React from 'react';
import Layout from '../components/Layout';
import { Pencil, Info, FileText, CreditCard, Bell, Smartphone, Monitor } from 'lucide-react';

const InfoRow = ({ label, value, editable = false, secondaryValue }) => (
    <div className="mb-6">
        <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
        <div className="flex items-center justify-between">
            <div className="text-izly-black font-medium text-lg">
                {value}
                {secondaryValue && <div className="text-gray-400 text-sm mt-1">{secondaryValue}</div>}
            </div>
            {editable && (
                <button className="bg-izly-blue-main text-white px-4 py-1 rounded-full text-xs font-bold uppercase flex items-center hover:bg-cyan-600 transition-colors">
                    <Pencil size={12} className="mr-2" /> Modifier
                </button>
            )}
        </div>
    </div>
);

const SectionHeader = ({ title }) => (
    <h2 className="text-izly-blue-main text-xl font-medium mb-6 mt-8 border-b border-gray-100 pb-2">
        {title}
    </h2>
);

const Profile = () => {
    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white">

                {/* Header */}
                <div className="bg-izly-blue-main w-full py-12 px-8 text-white">
                    <h1 className="text-4xl font-light mb-8">Nolan PUJOL</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Identifiant</div>
                            <div className="font-medium text-lg">nolanpujol34@orange.fr</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Pseudo</div>
                            <div className="font-medium text-lg">Nolan.PUJOL</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Date de naissance</div>
                            <div className="font-medium text-lg">20/03/2005</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full max-w-6xl mx-auto p-12">

                    <SectionHeader title="Mes informations" />
                    <div className="bg-white border border-gray-200 p-8 mb-12 shadow-sm">
                        <InfoRow label="Adresse postale" value="33 impasse du Grès, 34400 Villetelle" />
                        <InfoRow label="Adresse e-mail principale" value="nolanpujol34@orange.fr" />
                        <InfoRow label="Adresse e-mail secondaire" value="nolanpujol34@orange.fr" editable />
                        <InfoRow label="Téléphone portable" value="+33 6 85 80 21 08" editable />
                    </div>

                    <SectionHeader title="Paramétrage tarifaire Crous" />
                    <div className="bg-white border border-gray-200 p-8 mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-sm">
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Code société</div>
                            <div className="font-bold text-lg">10</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Code tarif</div>
                            <div className="font-bold text-lg">97</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Date de fin de droits Crous</div>
                            <div className="font-bold text-lg">30/11/2026</div>
                        </div>
                    </div>

                    <SectionHeader title="Mon contrat" />
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">Plafonds</span>
                            <span className="text-gray-500">Plafonds restreints</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">Historique</span>
                            <span className="text-gray-500">Activités du dernier mois</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">Relevés</span>
                            <span className="text-gray-500">Dernier relevé : novembre 2025</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">État</span>
                            <span className="text-green-500 font-bold">Actif</span>
                        </div>
                    </div>

                    <SectionHeader title="Mes supports" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                            <CreditCard className="text-izly-blue-main mr-4" size={32} />
                            <div>
                                <div className="font-bold text-gray-700">Carte Izly</div>
                                <div className="text-sm text-gray-500">N° 04C23D1A501490</div>
                            </div>
                        </div>
                        <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                            <Smartphone className="text-izly-blue-main mr-4" size={32} />
                            <div>
                                <div className="font-bold text-gray-700">Application mobile</div>
                                <div className="text-sm text-gray-500">IPhone</div>
                            </div>
                        </div>
                    </div>

                    <SectionHeader title="Évènements" />
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex">
                            <span className="font-bold w-40 flex-shrink-0">11/07/2023 à 15:45</span>
                            <p>Nous vous confirmons que votre mise à jour des coordonnées bancaires du 11/07/2023 15:45:45 a bien été enregistrée</p>
                        </div>
                        <div className="flex">
                            <span className="font-bold w-40 flex-shrink-0">11/07/2023 à 15:34</span>
                            <p>Nous vous confirmons votre inscription du 11/07/2023 15:34:26 sur le site Izly. Merci pour votre confiance et à bientôt !</p>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500 space-y-2">
                        <div className="space-x-4">
                            <a href="#" className="hover:underline">Application mobile Play Store Android (Nouvelle fenêtre)</a>
                            <a href="#" className="hover:underline">Application mobile App Store Apple (Nouvelle fenêtre)</a>
                        </div>
                        <div className="pt-4">
                            Izly est un service opéré par <span className="font-bold text-orange-500">Xpollens</span> (Nouvelle fenêtre)
                        </div>
                        <div className="space-x-2 pt-2">
                            <a href="#" className="hover:underline">Qui sommes-nous ?</a> -
                            <a href="#" className="hover:underline">Aide et Contact</a> -
                            <a href="#" className="hover:underline">CGU</a> -
                            <a href="#" className="hover:underline">Sécurité</a> -
                            <a href="#" className="hover:underline">Mentions légales</a>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Profile;
