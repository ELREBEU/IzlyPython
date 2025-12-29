import React, { useState, useEffect } from 'react';
import { User, ChevronDown, LogOut, Globe, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load user profile data
        const loadProfile = async () => {
            try {
                const wallet = await api.wallet.getBalance();
                const transactions = await api.transactions.getHistory();
                setUserProfile({
                    name: "Utilisateur Izly",
                    email: localStorage.getItem('izly_credentials') ? JSON.parse(localStorage.getItem('izly_credentials')).email : "user@izly.fr",
                    balance: wallet.balance
                });
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };
        loadProfile();
    }, []);

    const handleLogout = () => {
        // Clear credentials and redirect to login
        api.auth.logout();
        navigate('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center w-16 h-16 shadow-lg"
            >
                <User className="text-white" size={40} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in text-gray-700">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-bold text-lg">{userProfile?.name || "Chargement..."}</div>
                        <div className="text-xs text-gray-500">{userProfile?.email || ""}</div>
                        {userProfile?.balance !== undefined && (
                            <div className="text-sm text-izly-cyan font-semibold mt-1">Solde: {userProfile.balance.toFixed(2)} €</div>
                        )}
                    </div>

                    <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50 transition-colors flex items-center" onClick={() => setIsOpen(false)}>
                        <User size={18} className="mr-3 text-gray-400" />
                        Mon profil
                    </Link>

                    <Link to="/my-izly-identifier" className="block px-4 py-3 hover:bg-gray-50 transition-colors flex items-center" onClick={() => setIsOpen(false)}>
                        <User size={18} className="mr-3 text-gray-400" />
                        Mon identifiant Izly
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center">
                        <Globe size={18} className="mr-3 text-gray-400" />
                        Passer la page en anglais
                    </button>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center text-izly-blue-main font-medium">
                        <Globe size={18} className="mr-3" />
                        Passer la page en français (Actif)
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <a href="#" className="block px-4 py-3 hover:bg-gray-50 transition-colors flex items-center">
                        <ExternalLink size={18} className="mr-3 text-gray-400" />
                        Ouvrir le site des Crous
                    </a>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full block px-4 py-3 hover:bg-red-50 text-red-600 transition-colors flex items-center"
                    >
                        <LogOut size={18} className="mr-3" />
                        Déconnexion
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
