import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockIcon, XIcon, CheckIcon } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onSubmit, title = "Confirmation requise" }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        try {
            await onSubmit(password);
            setPassword(""); // Clear on success
            onClose();
        } catch (error) {
            // Error handling is done by parent usually, but we stop loading
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-[#1E1E24] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <LockIcon size={20} />
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                                <XIcon size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Veuillez entrer votre mot de passe Izly pour sécuriser cette transaction.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mot de passe Izly"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Confirmer
                                        <CheckIcon size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PasswordModal;
