import React from 'react';

const Ticket = ({ selectedNumbers, onToggleNumber, onRandom, onClear }) => {
    // Generamos un arreglo del 1 al 53
    const numbers = Array.from({ length: 53 }, (_, i) => i + 1);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Cabecera gris del Paso 1 */}
            <div className="bg-[#a3a3a3] text-white px-4 py-2 font-bold text-sm tracking-wide">
                PASO 1: ELIGE TU JUGADA
            </div>
            
            <div className="p-5 flex-1">
                <div className="flex justify-between items-center mb-5 border-b border-gray-200 pb-2">
                    <h2 className="text-lg font-bold text-gray-700">JUGADA A</h2>
                    <span className="text-xs text-gray-500 font-medium">Marca 6 bolillas o más</span>
                </div>
                
                {/* Cuadrícula exacta de 6 columnas como en la imagen real */}
                <div className="grid grid-cols-6 gap-y-3 gap-x-2 mb-8 place-items-center">
                    {numbers.map((num) => {
                        const isSelected = selectedNumbers.includes(num);
                        return (
                            <button
                                key={num}
                                onClick={() => onToggleNumber(num)}
                                className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-all border
                                    ${isSelected 
                                        ? 'bg-[#e32118] text-white border-[#e32118] shadow-md transform scale-110' 
                                        : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
                
                {/* Botones amarillos inferiores */}
                <div className="flex justify-center gap-4 mt-auto">
                    <button 
                        onClick={onRandom} 
                        className="bg-[#ffe700] hover:bg-[#ebd500] text-gray-900 font-bold py-2 px-6 rounded-full text-sm shadow-sm transition-colors w-32"
                    >
                        Al Azar
                    </button>
                    <button 
                        onClick={onClear} 
                        className="bg-[#ffe700] hover:bg-[#ebd500] text-gray-900 font-bold py-2 px-6 rounded-full text-sm shadow-sm transition-colors w-32"
                    >
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ticket;