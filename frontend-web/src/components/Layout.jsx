import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, PlusCircle, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex flex-col items-center justify-center py-6 hover:bg-gray-800 transition-colors w-full",
            active ? "text-izly-cyan border-l-4 border-izly-cyan" : "text-gray-400 border-l-4 border-transparent"
        )}
    >
        <Icon size={28} className="mb-2" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </Link>
);

const Layout = ({ children, fullWidth = false }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navItems = [
        { to: "/dashboard", icon: Home, label: "Accueil" },
        { to: "/payment", icon: CreditCard, label: "Payer" },
        { to: "/recharge", icon: PlusCircle, label: "Recharger" },
        { to: "/plus", icon: Menu, label: "Plus" },
    ];

    return (
        <div className="flex min-h-screen bg-izly-bg">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-24 bg-izly-black fixed h-full z-20">
                <div className="flex items-center justify-center h-32 bg-izly-black">
                    <img src="/logo_blanc.svg" alt="Izly" className="w-20 h-auto" />
                </div>
                <nav className="flex-1 flex flex-col mt-4">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>
                <div className="mt-auto mb-8 flex flex-col items-center space-y-4">
                    <div className="flex space-x-2">
                        <img src="/icons/Anglais.svg" alt="EN" className="w-6 h-6 opacity-50 hover:opacity-100 cursor-pointer" />
                        <img src="/icons/Francais.svg" alt="FR" className="w-6 h-6 cursor-pointer" />
                    </div>
                    <a href="http://www.cnous.fr/" target="_blank" rel="noopener noreferrer">
                        <img src="/logo_crous.svg" alt="Crous" className="w-20 h-auto opacity-80 hover:opacity-100 transition-opacity" />
                    </a>
                </div>
            </aside>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-izly-black z-20 pt-20 px-4">
                    <nav className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    "flex items-center p-4 rounded-lg",
                                    location.pathname === item.to ? "bg-gray-800 text-izly-cyan" : "text-white"
                                )}
                            >
                                <item.icon size={24} className="mr-4" />
                                <span className="text-lg font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className={clsx(
                "flex-1 md:ml-24 pt-0 overflow-y-auto",
                fullWidth ? "p-0" : "p-0 md:p-8"
            )}>
                {children}
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-izly-black h-16 flex items-center justify-around z-30 border-t border-gray-800 pb-safe">
                <Link to="/dashboard" className={clsx("flex flex-col items-center justify-center w-full h-full", location.pathname === "/dashboard" ? "text-izly-cyan" : "text-white")}>
                    <Home size={24} strokeWidth={1.5} />
                    <span className="text-[10px] mt-1 font-medium">Accueil</span>
                </Link>
                <Link to="/payment" className={clsx("flex flex-col items-center justify-center w-full h-full", location.pathname === "/payment" ? "text-izly-cyan" : "text-white")}>
                    <div className="w-6 h-6 flex items-center justify-center">
                        <img src="/icons/payer-icon.svg" alt="Payer" className="w-6 h-6" style={{ filter: location.pathname === "/payment" ? 'brightness(0) saturate(100%) invert(61%) sepia(97%) saturate(2742%) hue-rotate(168deg) brightness(99%) contrast(101%)' : 'brightness(0) saturate(100%) invert(100%)' }} />
                    </div>
                    <span className="text-[10px] mt-1 font-medium">Payer</span>
                </Link>
                <Link to="/recharge" className={clsx("flex flex-col items-center justify-center w-full h-full", location.pathname === "/recharge" ? "text-izly-cyan" : "text-white")}>
                    <PlusCircle size={24} strokeWidth={1.5} />
                    <span className="text-[10px] mt-1 font-medium">Recharger</span>
                </Link>
                <div className="flex flex-col items-center justify-center w-full h-full text-white opacity-50">
                    <div className="w-6 h-6 border-2 border-white rounded flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-white"></div>
                    </div>
                    <span className="text-[10px] mt-1 font-medium">Actus</span>
                </div>
                <Link to="/plus" className={clsx("flex flex-col items-center justify-center w-full h-full", location.pathname === "/plus" ? "text-izly-cyan" : "text-white")}>
                    <PlusCircle size={24} strokeWidth={1.5} className="rotate-45" />
                    <span className="text-[10px] mt-1 font-medium">Plus</span>
                </Link>
            </nav>
        </div>
    );
};

export default Layout;
