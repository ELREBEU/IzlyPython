import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // Use real API

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.auth.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-izly-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration to match the vibe if possible, or just keep clean */}

            <div className="mb-8 text-center z-10">
                <h1 className="text-6xl font-bold text-izly-cyan italic mb-2 tracking-tighter">izly</h1>
            </div>

            <div className="bg-white p-8 rounded-sm shadow-2xl w-full max-w-md z-10 relative">
                {/* Close button simulation if needed, but this is a page */}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            Identifiant
                            <span className="ml-1 text-izly-cyan">ℹ️</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Adresse e-mail / +XXX Téléphone"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-none focus:ring-1 focus:ring-izly-cyan focus:border-izly-cyan outline-none text-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Code secret</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Code secret"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-none focus:ring-1 focus:ring-izly-cyan focus:border-izly-cyan outline-none text-gray-600 pr-10"
                            />
                            {password && (
                                <button
                                    type="button"
                                    onClick={() => setPassword('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Numeric Keypad Simulation (Visual only for now, or functional if requested) */}
                    {/* The user asked to "inspire toi de l'image", the image shows a keypad. 
                        For a web app, a native keypad is better, but let's add a visual hint or just keep it simple inputs for now 
                        as implementing a full custom keypad is complex and might annoy desktop users. 
                        I will stick to standard inputs but styled like the screenshot.
                    */}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm border-l-4 border-red-500">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-izly-cyan text-white font-bold py-3 rounded-full hover:bg-cyan-500 transition-colors shadow-md mt-4"
                    >
                        {loading ? "Connexion..." : "Valider"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="#" className="text-xs text-gray-500 hover:text-izly-cyan flex items-center justify-center gap-1">
                        Code secret oublié : Cliquez ici <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">i</span>
                    </a>
                </div>
            </div>

            <div className="mt-12 flex justify-center gap-4 text-sm text-gray-600">
                <span>Version accessible | 🇬🇧 🇫🇷</span>
            </div>

            <div className="mt-4 flex justify-between w-full max-w-md text-xs text-gray-500 px-2">
                <a href="#">Recevoir à nouveau l'e-mail d'activation du compte</a>
                <a href="#">Besoin d'aide ? Cliquez ici</a>
            </div>
        </div>
    );
};

export default Login;
