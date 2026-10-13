// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Ticket from './components/Ticket';
import Registro from './pages/Registro';
import Participar from './pages/Participar';
import { drawTinka, simulateTinka, simulateAll, getAllUsers, deleteUser, clearAllUsers } from './services/api';

// ===================== PANEL PRINCIPAL =====================
function Panel() {
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [drawResult, setDrawResult] = useState(null);
    const [simulationResult, setSimulationResult] = useState(null);
    const [simProbabilities, setSimProbabilities] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false);
    const [nSimulations, setNSimulations] = useState(1000000);
    const [simInput, setSimInput] = useState('1000000');
    const [participants, setParticipants] = useState([]);
    const [participantResults, setParticipantResults] = useState([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);

    // Cargar participantes al montar
    const fetchParticipants = useCallback(async () => {
        try {
            const data = await getAllUsers();
            setParticipants(data.data || []);
        } catch (_) {}
    }, []);

    useEffect(() => {
        fetchParticipants();
    }, [fetchParticipants]);

    const handleToggleNumber = (num) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length < 6) {
                setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
            } else {
                alert('Ya has seleccionado el máximo de 6 números.');
            }
        }
    };

    const handleRandomTicket = async () => {
        try {
            const data = await drawTinka();
            setSelectedNumbers(data.data);
        } catch (_) {
            alert('Error al generar jugada al azar.');
        }
    };

    const handleClear = () => {
        setSelectedNumbers([]);
        setSimulationResult(null);
        setSimProbabilities(null);
        setDrawResult(null);
    };

    const handleNSimChange = (val) => {
        setSimInput(val);
        const n = parseInt(val.replace(/[^0-9]/g, '')) || 0;
        if (n >= 1000 && n <= 5000000) setNSimulations(n);
    };

    const handleSimulate = async () => {
        if (selectedNumbers.length !== 6) return;
        setLoading(true);
        try {
            const data = await simulateTinka(selectedNumbers, nSimulations);
            setSimulationResult(data.results);
            setSimProbabilities(data.probabilities);
            setDrawResult(null);
        } catch (_) {
            alert('Error en la simulación.');
        }
        setLoading(false);
    };

    const handleDraw = async () => {
        try {
            const data = await drawTinka();
            setDrawResult(data.data);
            setSimulationResult(null);
            setSimProbabilities(null);
        } catch (_) {
            alert('Error al generar sorteo.');
        }
    };

    // Sortear + simular todos los participantes
    const handleSortearYSimular = async () => {
        setParticipantsLoading(true);
        try {
            // Primero generamos el número ganador
            const drawData = await drawTinka();
            setDrawResult(drawData.data);
            setSimulationResult(null);
            setSimProbabilities(null);

            // Luego simulamos todos los participantes
            const simData = await simulateAll(nSimulations);
            setParticipantResults(simData.participants || []);

            // Actualizar lista de participantes
            fetchParticipants();
        } catch (_) {
            alert('Error al sortear.');
        }
        setParticipantsLoading(false);
    };

    const handleSimularTodos = async () => {
        setLoadingAll(true);
        try {
            const simData = await simulateAll(nSimulations);
            setParticipantResults(simData.participants || []);
        } catch (_) {
            alert('Error al simular participantes.');
        }
        setLoadingAll(false);
    };

    const handleDeleteParticipant = async (id) => {
        if (!confirm('¿Eliminar este participante?')) return;
        try {
            await deleteUser(id);
            fetchParticipants();
            setParticipantResults(prev => prev.filter(p => p.id !== id));
        } catch (_) {
            alert('Error al eliminar.');
        }
    };

    const handleClearAll = async () => {
        if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los participantes? Esta acción no se puede deshacer.')) return;
        try {
            await clearAllUsers();
            setParticipants([]);
            setParticipantResults([]);
        } catch (_) {
            alert('Error al limpiar la tabla.');
        }
    };

    const nSimFormatted = nSimulations.toLocaleString('es-PE');

    return (
        <div className="min-h-screen bg-[#f4f4f4] font-sans text-gray-800">
            {/* Header */}
            <header className="bg-[#ffe700] border-b-[3px] border-[#e8a317]">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-black text-[#007b3b] flex items-center">
                            <span className="text-red-600 mr-1 text-3xl not-italic">🎯</span>
                            <span className="italic tracking-tight">Tinka</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/registro"
                            className="border border-[#007b3b] text-[#007b3b] font-bold px-5 py-1.5 rounded-sm bg-white hover:bg-gray-50 text-sm"
                        >
                            + Registrar Participante
                        </Link>
                    </div>
                </div>
            </header>

            {/* Banner */}
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
                        Juégalo<br />hasta las 09:50 pm
                    </div>
                </div>
            </div>

            {/* Contenedor Principal (3 columnas) */}
            <main className="max-w-6xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

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

                            {/* Control de simulaciones */}
                            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                                    Nº de Simulaciones Monte Carlo
                                </label>
                                <input
                                    type="number"
                                    min={1000}
                                    max={5000000}
                                    step={10000}
                                    value={simInput}
                                    onChange={e => handleNSimChange(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-[#007b3b] mb-2"
                                />
                                <input
                                    type="range"
                                    min={1000}
                                    max={5000000}
                                    step={10000}
                                    value={nSimulations}
                                    onChange={e => {
                                        setNSimulations(parseInt(e.target.value));
                                        setSimInput(e.target.value);
                                    }}
                                    className="w-full accent-[#007b3b]"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1,000</span>
                                    <span className="font-bold text-[#007b3b]">{nSimFormatted}</span>
                                    <span>5,000,000</span>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="mt-auto space-y-3">
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

                    {/* COLUMNA 3: Resultados */}
                    <div className="flex flex-col gap-4">
                        {drawResult && (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-yellow-400 border-l-4">
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

                        {simulationResult && (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-red-500 border-t-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1 uppercase tracking-tight text-center">Resultados</h3>
                                <p className="text-center text-xs text-gray-500 mb-3 uppercase">
                                    {nSimFormatted} Sorteos (Monte Carlo)
                                </p>
                                <div className="space-y-2">
                                    {Object.entries(simulationResult).reverse().map(([hits, count]) => (
                                        <div
                                            key={hits}
                                            className={`flex justify-between items-center p-2 rounded text-sm ${
                                                hits === '6' && count > 0
                                                    ? 'bg-green-100 text-green-800 font-bold'
                                                    : 'bg-gray-50 border border-gray-100'
                                            }`}
                                        >
                                            <span className="font-semibold text-gray-600">{hits} Aciertos</span>
                                            <div className="text-right">
                                                <span className="text-gray-900 font-mono font-medium block">{count.toLocaleString()}</span>
                                                {simProbabilities && (
                                                    <span className="text-xs text-blue-600 font-mono">
                                                        {simProbabilities[hits]}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!drawResult && !simulationResult && (
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg p-6 text-center text-white shadow-sm flex flex-col justify-center h-full min-h-[250px]">
                                <h3 className="text-2xl font-black italic mb-2">¡Pon a prueba tu suerte!</h3>
                                <p className="text-sm">Utiliza nuestro motor matemático LCG para comprobar las probabilidades reales de ganar.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECCIÓN PARTICIPANTES */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#007b3b] text-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-base tracking-wide">PANEL DE PARTICIPANTES</h2>
                            <p className="text-green-200 text-xs">{participants.length} participante(s) registrado(s)</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleSimularTodos}
                                disabled={loadingAll || participants.length === 0}
                                className="bg-yellow-400 text-black font-bold px-4 py-2 rounded text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingAll ? 'SIMULANDO...' : `⚙ SIMULAR TODOS (${nSimFormatted})`}
                            </button>
                            <button
                                onClick={handleSortearYSimular}
                                disabled={participantsLoading || participants.length === 0}
                                className="bg-[#e32118] text-white font-bold px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {participantsLoading ? 'SORTEANDO...' : '🎰 SORTEAR Y SIMULAR'}
                            </button>
                            <button
                                onClick={fetchParticipants}
                                className="border border-white text-white font-bold px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                                ↻ Actualizar
                            </button>
                            <button
                                onClick={handleClearAll}
                                disabled={participants.length === 0}
                                className="bg-gray-800 text-white font-bold px-3 py-2 rounded text-sm hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Eliminar todos los participantes"
                            >
                                🗑 Limpiar todo
                            </button>
                        </div>
                    </div>

                    {participants.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p className="text-4xl mb-3">🎟</p>
                            <p className="font-medium">No hay participantes registrados aún.</p>
                            <Link to="/registro" className="mt-3 inline-block bg-[#007b3b] text-white font-bold px-5 py-2 rounded hover:bg-green-800 text-sm">
                                Registrar primer participante
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        {participantResults.length > 0 && (
                                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">#</th>
                                        )}
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">DNI</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Nombre</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Números</th>
                                        {participantResults.length > 0 && (
                                            <>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-blue-600 uppercase">Prob. Premio<br/><span className="text-gray-400 normal-case">(≥3 aciertos)</span></th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-red-600 uppercase">Prob. Pozo<br/><span className="text-gray-400 normal-case">(6 aciertos)</span></th>
                                            </>
                                        )}
                                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-600 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(participantResults.length > 0 ? participantResults : participants.map(p => ({ ...p, ticket: [p.n1, p.n2, p.n3, p.n4, p.n5, p.n6] }))).map((p, idx) => (
                                        <tr
                                            key={p.id}
                                            className={`border-b border-gray-100 ${
                                                participantResults.length > 0 && idx === 0
                                                    ? 'bg-yellow-50 font-semibold'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            {participantResults.length > 0 && (
                                                <td className="px-3 py-3 text-center">
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                                </td>
                                            )}
                                            <td className="px-3 py-3 font-mono text-gray-600">{p.dni}</td>
                                            <td className="px-3 py-3 text-gray-800">{p.nombres} {p.apellidos}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1 flex-wrap">
                                                    {(p.ticket || [p.n1, p.n2, p.n3, p.n4, p.n5, p.n6]).map(n => (
                                                        <span
                                                            key={n}
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                                                                drawResult && drawResult.includes(n)
                                                                    ? 'bg-yellow-400 text-black border-yellow-500'
                                                                    : 'bg-[#e32118] text-white border-red-700'
                                                            }`}
                                                        >
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            {participantResults.length > 0 && (
                                                <>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="font-mono text-blue-700 font-bold">{p.probabilidadPremio}%</span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="font-mono text-red-600 text-xs">{p.probabilidadPozo}%</span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteParticipant(p.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-xs border border-red-300 rounded px-2 py-1 hover:bg-red-50 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// ===================== APP ROOT =====================
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Panel />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/participar" element={<Participar />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;