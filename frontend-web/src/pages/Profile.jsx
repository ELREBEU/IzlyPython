import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Pencil, Info, FileText, CreditCard, Bell, Smartphone, Monitor } from 'lucide-react';
import { api } from '../services/api';

const InfoRow = ({ label, value, editable = false, secondaryValue }) => (
    <div className="mb-6">
        <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
        <div className="flex items-center justify-between">
            <div className="text-izly-black font-medium text-lg">
                {value || <span className="text-gray-400 italic">Non renseigné</span>}
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
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await api.profile.getProfile();
                console.log("📋 Profile data loaded:", data);
                setProfile(data);
            } catch (err) {
                console.error("❌ Error loading profile:", err);
                setError("Impossible de charger le profil. Veuillez vous reconnecter.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    // Mapping des codes tarifs
    const getTariffLabel = (code) => {
        const tariffs = {
            '98': 'Boursier (Taux Max)',
            '100': 'Alternant/Précaire',
            '97': 'Non Boursier/Standard'
        };
        return tariffs[code] || code;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-izly-blue-main text-xl">Chargement du profil...</div>
                </div>
            </Layout>
        );
    }

    if (error || !profile) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-red-600 text-xl">{error || "Profil non trouvé"}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white">

                {/* Header */}
                <div className="bg-izly-blue-main w-full py-12 px-8 text-white">
                    <div className="flex justify-between items-start mb-8">
                        <h1 className="text-4xl font-light">{profile.full_name || 'Utilisateur Izly'}</h1>
                        <button
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    await api.profile.syncWithIzly();
                                    const data = await api.profile.getProfile();
                                    setProfile(data);
                                } catch (err) {
                                    console.error(err);
                                    setError("Erreur lors de la synchronisation");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Monitor size={16} />
                            Synchroniser avec Izly
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Identifiant</div>
                            <div className="font-medium text-lg">{profile.email || 'Non renseigné'}</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Statut</div>
                            <div className="font-medium text-lg">{getTariffLabel(profile.tariff_code)}</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider mb-1">Solde Izly</div>
                            <div className="font-medium text-lg">{profile.izly_balance?.toFixed(2) || '0.00'} €</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full max-w-6xl mx-auto p-12">

                    <SectionHeader title="Mes informations" />
                    <div className="bg-white border border-gray-200 p-8 mb-12 shadow-sm">
                        <InfoRow
                            label="Adresse postale"
                            value={profile.address_zip && profile.address_city
                                ? `${profile.address_street || ''}, ${profile.address_zip} ${profile.address_city}`.trim()
                                : null
                            }
                        />
                        <InfoRow label="Adresse e-mail principale" value={profile.email} />
                        <InfoRow label="Téléphone portable" value={profile.phone} editable />
                    </div>

                    <SectionHeader title="Paramétrage tarifaire Crous" />
                    <div className="bg-white border border-gray-200 p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Code tarif</div>
                            <div className="font-bold text-lg">{profile.tariff_code || 'Non défini'}</div>
                            <div className="text-sm text-gray-500 mt-1">{getTariffLabel(profile.tariff_code)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Solde actuel</div>
                            <div className="font-bold text-lg text-green-600">{profile.izly_balance?.toFixed(2) || '0.00'} €</div>
                        </div>
                    </div>

                    <SectionHeader title="Mon compte" />
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">User ID</span>
                            <span className="text-gray-500 font-mono text-sm">{profile.id}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">État</span>
                            <span className="text-green-500 font-bold">Actif</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="font-medium text-gray-700">Dernière synchronisation</span>
                            <span className="text-gray-500">
                                {profile.last_synced_at
                                    ? new Date(profile.last_synced_at).toLocaleDateString('fr-FR')
                                    : 'Jamais'
                                }
                            </span>
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

