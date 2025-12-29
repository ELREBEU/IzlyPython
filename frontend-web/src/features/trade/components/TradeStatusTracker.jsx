import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { MOCK_TRADE_SESSION, TRADE_STATUS } from '../data/dummyUsers';

const TradeStatusTracker = ({ session = MOCK_TRADE_SESSION, onClose }) => {
    const getStatusInfo = (status) => {
        switch (status) {
            case TRADE_STATUS.CREATED:
                return {
                    icon: ClockIcon,
                    color: 'blue',
                    label: 'Réservation confirmée',
                    description: 'En attente du QR code...'
                };
            case TRADE_STATUS.QR_SENT:
                return {
                    icon: CheckCircleIcon,
                    color: 'green',
                    label: 'QR Code envoyé',
                    description: 'Vous pouvez maintenant manger !'
                };
            case TRADE_STATUS.CHECKING:
                return {
                    icon: ClockIcon,
                    color: 'orange',
                    label: 'Vérification en cours',
                    description: 'Synchronisation avec Izly...'
                };
            case TRADE_STATUS.FINALIZED:
                return {
                    icon: CheckCircleIcon,
                    color: 'green',
                    label: 'Transaction finalisée',
                    description: 'Tout est bon !'
                };
            case TRADE_STATUS.DISPUTE:
                return {
                    icon: AlertTriangleIcon,
                    color: 'red',
                    label: 'Litige ouvert',
                    description: 'Support contacté'
                };
            default:
                return {
                    icon: XCircleIcon,
                    color: 'gray',
                    label: 'Statut inconnu',
                    description: ''
                };
        }
    };

    const statusInfo = getStatusInfo(session.status);
    const Icon = statusInfo.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 right-4 z-40 bg-[#1c1c1c] rounded-2xl shadow-2xl border border-gray-800 p-4 max-w-sm"
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`bg-${statusInfo.color}-500/20 p-2 rounded-full`}>
                    <Icon className={`text-${statusInfo.color}-400`} size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-bold">{statusInfo.label}</h4>
                    <p className="text-gray-400 text-sm">{statusInfo.description}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <XCircleIcon size={20} />
                </button>
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-900/50 rounded-xl p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Vendeur</span>
                    <span className="text-white font-semibold">{session.seller_name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Montant</span>
                    <span className="text-green-400 font-bold text-lg">{session.agreed_price}€</span>
                </div>
            </div>

            {/* Messages */}
            <div className="space-y-2">
                {session.messages.map((msg, index) => (
                    <div key={index} className="text-xs text-gray-500 flex items-start gap-2">
                        <span className="text-gray-600">{msg.time}</span>
                        <span className="text-gray-400">{msg.content}</span>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{
                        width: session.status === TRADE_STATUS.FINALIZED ? '100%' :
                            session.status === TRADE_STATUS.QR_SENT ? '66%' :
                                session.status === TRADE_STATUS.CHECKING ? '85%' : '33%'
                    }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
};

export default TradeStatusTracker;
