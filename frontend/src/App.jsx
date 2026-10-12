import React, { useState } from 'react';
import Ticket from './components/Ticket';
import { drawTinka, simulateTinka } from './services/api';

function App() {
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [drawResult, setDrawResult] = useState(null);
    const [simulationResult, setSimulationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleToggleNumber = (num) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length < 6) {
                setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
            } else {
                alert("Ya has seleccionado el máximo de 6 números.");
            }
        }
    };

    // Usamos el motor LCG del backend para elegir al azar de forma matemática
    const handleRandomTicket = async () => {
        try {
            const data = await drawTinka();
            setSelectedNumbers(data.data); // data.data trae el array de 6 números
        } catch (error) {
            alert("Error al generar jugada al azar.");
        }
    };

    const handleClear = () => {
        setSelectedNumbers([]);
        setSimulationResult(null);
        setDrawResult(null);
    };

    const handleSimulate = async () => {
        if (selectedNumbers.length !== 6) return;
        setLoading(true);
        try {
            const data = await simulateTinka(selectedNumbers, 1000000); // 1 Millón de sorteos
            setSimulationResult(data.results);
            setDrawResult(null);
        } catch (error) {
            alert("Error en la simulación.");
        }
        setLoading(false);
    };

    const handleDraw = async () => {
        try {
            const data = await drawTinka();
            setDrawResult(data.data);
            setSimulationResult(null);
        } catch (error) {
            alert("Error al generar sorteo.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] font-sans text-gray-800">
            {/* Header Tipo Tinka (Menú Superior) */}
            <header className="bg-[#ffe700] border-b-[3px] border-[#e8a317]">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-2">
                        {/* Logo Emulado: Emoji recto, Tinka cursiva */}
                        <div className="text-2xl font-black text-[#007b3b] flex items-center">
                            <span className="text-red-600 mr-1 text-3xl not-italic">🎯</span> 
                            <span className="italic tracking-tight">Tinka</span>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button className="border border-[#007b3b] text-[#007b3b] font-bold px-5 py-1.5 rounded-sm bg-white hover:bg-gray-50 text-sm">
                            Ingresa
                        </button>
                        <button className="border border-[#007b3b] text-[#007b3b] font-bold px-5 py-1.5 rounded-sm bg-white hover:bg-gray-50 text-sm">
                            Regístrate
                        </button>
                    </div>
                </div>
            </header>

            {/* Banner Pozo Millonario (Totalmente recto) */}
            <div className="bg-[#ffe700] py-4 shadow-sm mb-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="text-[#007b3b] text-xl md:text-2xl font-black uppercase tracking-tighter not-italic">
                            POZO MILLONARIO
                        </div>
                        <div className="text-[#e32118] text-4xl md:text-5xl font-black tracking-tighter not-italic">
                            S/ 8'000,000
                        </div>
                    </div>
                    <div className="text-right text-[#007b3b] font-bold text-sm hidden md:block">
                        Juégalo<br/>hasta las 09:50 pm
                    </div>
                </div>
            </div>

            {/* Contenedor Principal (3 Columnas emulando la imagen) */}
            <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                
                {/* COLUMNA 1: La Cartilla */}
                <Ticket 
                    selectedNumbers={selectedNumbers} 
                    onToggleNumber={handleToggleNumber} 
                    onRandom={handleRandomTicket}
                    onClear={handleClear}
                />

                {/* COLUMNA 2: Paso 2 (Simulador) */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-[#a3a3a3] text-white px-4 py-2 font-bold text-sm tracking-wide">
                        PASO 2: FINALIZAR Y SIMULAR
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 font-medium text-sm">Tus números son</span>
                        </div>
                        
                        {/* Mostrar números elegidos */}
                        <div className="flex gap-2 justify-center mb-6 h-12">
                            {selectedNumbers.length === 0 ? (
                                <span className="text-gray-400 italic text-sm self-center">Ningún número seleccionado</span>
                            ) : (
                                selectedNumbers.map(n => (
                                    <div key={n} className="w-10 h-10 rounded-full bg-[#e32118] text-white font-bold flex items-center justify-center">
                                        {n}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Botones de Emulación */}
                        <div className="mt-auto space-y-3">
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Costo por simulación:</span>
                                    <span>S/ 0</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-800">
                                    <span>Total iteraciones:</span>
                                    <span>1'000,000</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSimulate}
                                disabled={loading || selectedNumbers.length !== 6}
                                className="w-full bg-[#e32118] text-white font-bold text-lg py-3 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'PROCESANDO...' : 'SIMULAR MONTE CARLO'}
                            </button>

                            <button 
                                onClick={handleDraw}
                                className="w-full bg-green-700 text-white font-bold text-sm py-2 rounded hover:bg-green-800 transition-colors"
                            >
                                EXTRAER SORTEO EN VIVO
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMNA 3: Resultados (Reemplaza la publicidad) */}
                <div className="flex flex-col gap-4">
                    {/* Tarjeta Sorteo Rápido */}
                    {drawResult && (
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-yellow-400 border-l-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-tight text-center">¡Sorteo Realizado!</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                {drawResult.map(n => (
                                    <span key={n} className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-lg border border-yellow-500">
                                        {n}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tarjeta Simulación Monte Carlo */}
                    {simulationResult && (
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-red-500 border-t-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 mb-1 uppercase tracking-tight text-center">Resultados</h3>
                            <p className="text-center text-xs text-gray-500 mb-4 uppercase">1 Millón de Sorteos (Monte Carlo)</p>
                            <div className="space-y-2">
                                {Object.entries(simulationResult).reverse().map(([hits, count]) => (
                                    <div key={hits} className={`flex justify-between items-center p-2 rounded text-sm ${hits === '6' && count > 0 ? 'bg-green-100 text-green-800 font-bold' : 'bg-gray-50 border border-gray-100'}`}>
                                        <span className="font-semibold text-gray-600">{hits} Aciertos</span>
                                        <span className="text-gray-900 font-mono font-medium">{count.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Banner publicitario de relleno para darle realismo */}
                    {!drawResult && !simulationResult && (
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg p-6 text-center text-white shadow-sm flex flex-col justify-center h-full min-h-[250px]">
                            <h3 className="text-2xl font-black italic mb-2">¡Pon a prueba tu suerte!</h3>
                            <p className="text-sm">Utiliza nuestro motor matemático LCG para comprobar las probabilidades reales de ganar.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

export default App;