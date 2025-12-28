import React from 'react';
import clsx from 'clsx';

const AmountBubble = ({ amount, selected, onClick }) => (
    <button
        onClick={() => onClick(amount)}
        className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold transition-all transform hover:scale-105 shadow-md",
            selected
                ? "bg-izly-cyan text-white ring-4 ring-izly-cyan ring-opacity-30"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-izly-cyan"
        )}
    >
        {amount}€
    </button>
);

const AmountSelector = ({ selectedAmount, onSelect, customAmount, onCustomChange }) => {
    const amounts = [10, 20, 50];

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex space-x-6 justify-center">
                {amounts.map((amt) => (
                    <AmountBubble
                        key={amt}
                        amount={amt}
                        selected={selectedAmount === amt && !customAmount}
                        onClick={(val) => {
                            onSelect(val);
                            onCustomChange(''); // Clear custom if bubble selected
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-xs">
                <label className="block text-sm font-medium text-gray-500 mb-2 text-center uppercase tracking-wide">
                    Ou montant libre
                </label>
                <div className="relative">
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                            onCustomChange(e.target.value);
                            onSelect(null); // Deselect bubbles
                        }}
                        placeholder="Autre montant"
                        className="block w-full text-center text-2xl font-bold p-4 rounded-xl border-2 border-gray-200 focus:border-izly-cyan focus:ring-0 outline-none transition-colors"
                    />
                    <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">€</span>
                </div>
            </div>
        </div>
    );
};

export default AmountSelector;
