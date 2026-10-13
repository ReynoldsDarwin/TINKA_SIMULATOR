// frontend/src/pages/Registro.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { consultarReniec, registerUser, getUserByDni } from '../services/api';

const TOTAL_NUMBERS = 53;
const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);

const Registro = () => {
    const [dni, setDni] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [loadingReniec, setLoadingReniec] = useState(false);
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [reniecError, setReniecError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [reniecFound, setReniecFound] = useState(false);
    const [manualMode, setManualMode] = useState(false);

    const handleBuscarDni = async () => {
        setReniecError('');
        setSuccessMsg('');
        setErrorMsg('');
        setReniecFound(false);
        setNombres('');
        setApellidos('');

        if (!dni || !/^\d{8}$/.test(dni)) {
            setReniecError('Ingresa un DNI válido de 8 dígitos.');
            return;
        }

        // Verificar si ya está registrado
        try {
            await getUserByDni(dni);
            setReniecError('⚠️ Este DNI ya está registrado en el sistema.');
            return;
        } catch (_) {
            // No existe, continuar
        }

        setLoadingReniec(true);
        try {
            const data = await consultarReniec(dni);
            if (data.success) {
                setNombres(data.data.nombres);
                setApellidos(`${data.data.apellidoPaterno} ${data.data.apellidoMaterno}`.trim());
                setReniecFound(true);
                setManualMode(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'No se pudo consultar RENIEC.';
            setReniecError(msg + ' Puedes ingresar los datos manualmente.');
            setManualMode(true);
        }
        setLoadingReniec(false);
    };

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

    const handleRandomNumbers = () => {
        const shuffled = [...numbers].sort(() => Math.random() - 0.5).slice(0, 6).sort((a, b) => a - b);
        setSelectedNumbers(shuffled);
    };

    const handleClearNumbers = () => setSelectedNumbers([]);

    const handleRegistrar = async () => {
        setSuccessMsg('');
        setErrorMsg('');

        if (!dni || !/^\d{8}$/.test(dni)) {
            setErrorMsg('Ingresa un DNI válido.');
            return;
        }
        if (!nombres.trim() || !apellidos.trim()) {
            setErrorMsg('Completa los nombres y apellidos.');
            return;
        }
        if (selectedNumbers.length !== 6) {
            setErrorMsg('Debes seleccionar exactamente 6 números.');
            return;
        }

        setLoadingRegister(true);
        try {
            await registerUser({
                dni,
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                numeros: selectedNumbers
            });
            setSuccessMsg('✅ ¡Participante registrado exitosamente!');
            // Limpiar formulario
            setDni('');
            setNombres('');
            setApellidos('');
            setSelectedNumbers([]);
            setReniecFound(false);
            setManualMode(false);
            setReniecError('');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al registrar. Intente de nuevo.');
        }
        setLoadingRegister(false);
    };

    const canRegister = dni.length === 8 && nombres.trim() && apellidos.trim() && selectedNumbers.length === 6;

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
                            to="/"
                            className="border border-[#007b3b] text-[#007b3b] font-bold px-5 py-1.5 rounded-sm bg-white hover:bg-gray-50 text-sm"
                        >
                            ← Panel Principal
                        </Link>
                    </div>
                </div>
            </header>

            {/* Banner */}
            <div className="bg-[#007b3b] py-3 text-center text-white font-bold text-lg tracking-wide">
                REGISTRO DE PARTICIPANTES
            </div>

            <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* SECCIÓN 1: Datos personales via DNI */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#007b3b] text-white px-4 py-2 font-bold text-sm tracking-wide">
                        PASO 1: CONSULTA TU DNI
                    </div>
                    <div className="p-6 flex flex-col gap-5">
                        {/* Input DNI */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Número de DNI
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={8}
                                    value={dni}
                                    onChange={e => {
                                        setDni(e.target.value.replace(/\D/g, ''));
                                        setReniecFound(false);
                                        setReniecError('');
                                        setSuccessMsg('');
                                        setErrorMsg('');
                                        setNombres('');
                                        setApellidos('');
                                        setManualMode(false);
                                    }}
                                    placeholder="12345678"
                                    className="flex-1 border-2 border-gray-300 rounded px-3 py-2 text-lg font-mono focus:outline-none focus:border-[#007b3b] tracking-widest"
                                />
                                <button
                                    onClick={handleBuscarDni}
                                    disabled={loadingReniec || dni.length !== 8}
                                    className="bg-[#007b3b] text-white font-bold px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    {loadingReniec ? '...' : 'BUSCAR'}
                                </button>
                            </div>
                            {reniecError && (
                                <p className="mt-2 text-sm text-red-600">{reniecError}</p>
                            )}
                        </div>

                        {/* Nombres */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Nombres
                            </label>
                            <input
                                type="text"
                                value={nombres}
                                onChange={e => setNombres(e.target.value)}
                                readOnly={reniecFound && !manualMode}
                                placeholder="Aparecerá automáticamente"
                                className={`w-full border-2 rounded px-3 py-2 focus:outline-none ${
                                    reniecFound && !manualMode
                                        ? 'border-green-400 bg-green-50 text-green-800 font-bold'
                                        : 'border-gray-300 focus:border-[#007b3b]'
                                }`}
                            />
                        </div>

                        {/* Apellidos */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Apellidos
                            </label>
                            <input
                                type="text"
                                value={apellidos}
                                onChange={e => setApellidos(e.target.value)}
                                readOnly={reniecFound && !manualMode}
                                placeholder="Aparecerá automáticamente"
                                className={`w-full border-2 rounded px-3 py-2 focus:outline-none ${
                                    reniecFound && !manualMode
                                        ? 'border-green-400 bg-green-50 text-green-800 font-bold'
                                        : 'border-gray-300 focus:border-[#007b3b]'
                                }`}
                            />
                        </div>

                        {reniecFound && (
                            <div className="bg-green-50 border border-green-300 rounded p-3 flex items-center gap-2">
                                <span className="text-green-600 text-xl">✓</span>
                                <div>
                                    <p className="text-green-800 font-bold text-sm">Datos verificados con RENIEC</p>
                                    <p className="text-green-700 text-xs">{nombres} {apellidos}</p>
                                </div>
                            </div>
                        )}

                        {manualMode && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                                <p className="text-yellow-800 text-sm font-medium">
                                    ⚠️ Modo manual: Ingresa tus datos directamente.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECCIÓN 2: Selección de números */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#a3a3a3] text-white px-4 py-2 font-bold text-sm tracking-wide">
                        PASO 2: ELIGE TUS 6 NÚMEROS (1 al 53)
                    </div>
                    <div className="p-5">
                        {/* Números seleccionados */}
                        <div className="flex gap-2 justify-center mb-4 min-h-[44px]">
                            {selectedNumbers.length === 0 ? (
                                <span className="text-gray-400 italic text-sm self-center">
                                    Selecciona 6 números
                                </span>
                            ) : (
                                selectedNumbers.map(n => (
                                    <div
                                        key={n}
                                        className="w-10 h-10 rounded-full bg-[#e32118] text-white font-bold flex items-center justify-center text-sm"
                                    >
                                        {n}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Grilla de números */}
                        <div className="grid grid-cols-9 gap-y-2 gap-x-1 mb-4 place-items-center">
                            {numbers.map(num => {
                                const isSelected = selectedNumbers.includes(num);
                                return (
                                    <button
                                        key={num}
                                        onClick={() => handleToggleNumber(num)}
                                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all border
                                            ${isSelected
                                                ? 'bg-[#e32118] text-white border-[#e32118] shadow-md scale-110'
                                                : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Botones aleatorio / limpiar */}
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleRandomNumbers}
                                className="bg-[#ffe700] hover:bg-[#ebd500] text-gray-900 font-bold py-2 px-5 rounded-full text-sm shadow-sm transition-colors"
                            >
                                Al Azar
                            </button>
                            <button
                                onClick={handleClearNumbers}
                                className="bg-[#ffe700] hover:bg-[#ebd500] text-gray-900 font-bold py-2 px-5 rounded-full text-sm shadow-sm transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* BOTÓN REGISTRAR - Full width */}
                <div className="md:col-span-2">
                    {successMsg && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded font-bold text-center text-lg">
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded font-bold text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Resumen */}
                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex gap-2">
                                    <span className="font-semibold w-20">DNI:</span>
                                    <span className="font-mono">{dni || '—'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold w-20">Nombre:</span>
                                    <span>{nombres && apellidos ? `${nombres} ${apellidos}` : '—'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold w-20">Números:</span>
                                    <span className="font-mono">
                                        {selectedNumbers.length === 6
                                            ? selectedNumbers.join(' - ')
                                            : `${selectedNumbers.length}/6 seleccionados`}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleRegistrar}
                                disabled={!canRegister || loadingRegister}
                                className="w-full sm:w-auto bg-[#e32118] text-white font-bold text-lg py-3 px-10 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingRegister ? 'REGISTRANDO...' : '🎟 PARTICIPAR'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Registro;
