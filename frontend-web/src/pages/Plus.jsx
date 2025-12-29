import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Settings, HelpCircle, LogOut, MapPin, Landmark } from 'lucide-react';

const PlusOption = ({ to, icon: Icon, label, subLabel, isSecret = false }) => {
    const [hovered, setHovered] = React.useState(false);

    return (
        <Link
            to={to}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex items-center hover:shadow-lg transition-all group h-40 relative overflow-hidden"
            onMouseEnter={() => isSecret && setHovered(true)}
            onMouseLeave={() => isSecret && setHovered(false)}
        >
            {isSecret && hovered && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-0 transition-all duration-300" />
            )}
            <div className={`mr-6 group-hover:scale-110 transition-transform z-10 ${isSecret && hovered ? 'text-green-400' : 'text-izly-blue-main'
                }`}>
                {isSecret && hovered ? (
                    <div className="bg-green-500/20 p-3 rounded-full">
                        <MapPin size={48} strokeWidth={1.5} className="text-green-400" />
                    </div>
                ) : (
                    <Icon size={56} strokeWidth={1.5} />
                )}
            </div>
            <div className={`text-left z-10 ${isSecret && hovered ? 'text-white' : 'text-izly-black'}`}>
                <h3 className="font-bold text-lg">
                    {isSecret && hovered ? 'Izly Trading' : label}
                </h3>
                {isSecret && hovered ? (
                    <p className="text-gray-300 text-sm mt-2">Partagez et trouvez des codes repas</p>
                ) : (
                    subLabel && <p className="text-gray-400 text-sm mt-2">{subLabel}</p>
                )}
            </div>
        </Link>
    );
};

const Plus = () => {
    return (
        <Layout>
            <div className="flex flex-col h-full min-h-[calc(100vh-64px)] md:min-h-screen -m-4 md:-m-8 bg-white">

                {/* Blue Header Section (same as Recharge) */}
                <div className="bg-izly-blue-main w-full py-12 flex flex-col items-center justify-center text-white">
                    <div className="bg-white/20 p-4 rounded-full mb-4">
                        <Settings size={48} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-medium uppercase tracking-wide mb-2">Plus</h1>
                    <p className="text-white/80 text-center max-w-xl px-4">
                        Gérez votre compte, accédez à l'aide et découvrez plus de fonctionnalités
                    </p>
                </div>

                {/* Options Grid */}
                <div className="flex-1 w-full max-w-6xl mx-auto p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <PlusOption
                            to="/transfer"
                            icon={Landmark}
                            label="Virer vers ma banque"
                            subLabel="Transférez votre solde Izly"
                        />
                        <PlusOption
                            to="/settings"
                            icon={Settings}
                            label="Mes paramètres"
                            subLabel="Gérez votre compte"
                        />
                        <PlusOption
                            to="/trade"
                            icon={HelpCircle}
                            label="Aide"
                            isSecret={true}
                        />
                        <PlusOption
                            to="/login"
                            icon={LogOut}
                            label="Déconnexion"
                            subLabel="Se déconnecter de l'application"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Plus;
