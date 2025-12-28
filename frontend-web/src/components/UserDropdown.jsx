import React, { useState } from 'react';
import { User, ChevronDown, LogOut, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

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
                        <div className="font-bold text-lg">Nolan PUJOL</div>
                        <div className="text-xs text-gray-500">nolanpujol34@orange.fr</div>
                    </div>

                    <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50 transition-colors flex items-center">
                        <User size={18} className="mr-3 text-gray-400" />
                        Mon profil
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

                    <Link to="/login" className="block px-4 py-3 hover:bg-red-50 text-red-600 transition-colors flex items-center">
                        <LogOut size={18} className="mr-3" />
                        Déconnexion
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
