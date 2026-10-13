// frontend/src/pages/Participar.jsx
import React, { useState } from 'react';
import { consultarReniec, registerUser, getUserByDni } from '../services/api';

const TOTAL = 53;
const numbers = Array.from({ length: TOTAL }, (_, i) => i + 1);

export default function Participar() {
    // ── Paso activo: 1 = DNI, 2 = Números, 3 = Confirmado ──
    const [step, setStep] = useState(1);

    // Datos personales
    const [dni, setDni] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [loadingReniec, setLoadingReniec] = useState(false);
    const [reniecVerified, setReniecVerified] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [dniError, setDniError] = useState('');

    // Números
    const [selected, setSelected] = useState([]);

    // Registro
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [registerError, setRegisterError] = useState('');

    // ── Handlers ──────────────────────────────────────────
    const handleDniChange = (val) => {
        setDni(val.replace(/\D/g, '').slice(0, 8));
        setDniError('');
        setReniecVerified(false);
        setNombres('');
        setApellidos('');
        setManualMode(false);
    };

    const handleBuscarDni = async () => {
        setDniError('');
        if (!/^\d{8}$/.test(dni)) {
            setDniError('Ingresa un DNI válido de 8 dígitos.');
            return;
        }
        // Verificar si ya está registrado
        try {
            await getUserByDni(dni);
            setDniError('⚠️ Este DNI ya está participando. Solo puedes registrarte una vez.');
            return;
        } catch (_) {}

        setLoadingReniec(true);
        try {
            const data = await consultarReniec(dni);
            if (data.success) {
                setNombres(data.data.nombres);
                setApellidos(`${data.data.apellidoPaterno} ${data.data.apellidoMaterno}`.trim());
                setReniecVerified(true);
                setManualMode(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'No se pudo consultar RENIEC.';
            setDniError(msg + ' Puedes ingresar tus datos manualmente.');
            setManualMode(true);
        }
        setLoadingReniec(false);
    };

    const canAdvance = dni.length === 8 && nombres.trim() && apellidos.trim() && (reniecVerified || manualMode);

    const handleToggle = (num) => {
        if (selected.includes(num)) {
            setSelected(selected.filter(n => n !== num));
        } else {
            if (selected.length < 6) {
                setSelected([...selected, num].sort((a, b) => a - b));
            }
        }
    };

    const handleRandom = () => {
        const pool = [...numbers].sort(() => Math.random() - 0.5).slice(0, 6).sort((a, b) => a - b);
        setSelected(pool);
    };

    const handleRegistrar = async () => {
        setRegisterError('');
        if (selected.length !== 6) { setRegisterError('Selecciona exactamente 6 números.'); return; }
        setLoadingRegister(true);
        try {
            await registerUser({
                dni,
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                numeros: selected,
            });
            setStep(3);
        } catch (err) {
            setRegisterError(err.response?.data?.message || 'Error al registrar. Intenta de nuevo.');
        }
        setLoadingRegister(false);
    };

    const handleVolverEmpezar = () => {
        setStep(1);
        setDni(''); setNombres(''); setApellidos('');
        setReniecVerified(false); setManualMode(false); setDniError('');
        setSelected([]); setRegisterError('');
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#007b3b] to-[#005a2b] flex flex-col">

            {/* ── HEADER ─────────────────────────────────── */}
            <header className="bg-[#ffe700] border-b-4 border-[#e8a317] py-4 shadow-lg">
                <div className="max-w-xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🎯</span>
                        <div>
                            <p className="text-[#007b3b] font-black text-2xl italic leading-none tracking-tight">Tinka</p>
                            <p className="text-[#007b3b] text-xs font-bold uppercase tracking-widest">Simulador Didáctico</p>
                        </div>
                    </div>
                    <div className="text-right text-[#007b3b] font-black text-2xl leading-none">
                        S/ 8<span className="text-[#e32118]">'</span>000,000
                    </div>
                </div>
            </header>

            {/* ── HERO ───────────────────────────────────── */}
            <div className="bg-[#005a2b] py-6 text-center border-b border-green-700">
                <h1 className="text-white font-black text-2xl md:text-3xl uppercase tracking-tight">
                    ¡Participa en el Sorteo!
                </h1>
                <p className="text-green-200 text-sm mt-1">Ingresa tu DNI, elige 6 números y compite</p>
                {/* Stepper */}
                <div className="flex items-center justify-center gap-2 mt-4">
                    {[['1', 'Tu DNI'], ['2', 'Tus números'], ['3', '¡Listo!']].map(([n, label], i) => (
                        <React.Fragment key={n}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all
                                    ${step > i + 1 ? 'bg-yellow-400 border-yellow-400 text-black'
                                        : step === i + 1 ? 'bg-white border-white text-[#007b3b]'
                                        : 'bg-transparent border-green-500 text-green-400'}`}>
                                    {step > i + 1 ? '✓' : n}
                                </div>
                                <span className={`text-xs mt-1 font-semibold ${step === i + 1 ? 'text-yellow-300' : 'text-green-500'}`}>{label}</span>
                            </div>
                            {i < 2 && <div className={`w-10 h-0.5 mb-4 ${step > i + 1 ? 'bg-yellow-400' : 'bg-green-600'}`} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ── CARD CENTRAL ───────────────────────────── */}
            <div className="flex-1 flex items-start justify-center py-8 px-4">
                <div className="w-full max-w-lg">

                    {/* ════ PASO 1: DNI ════════════════════ */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-[#007b3b] px-6 py-4">
                                <h2 className="text-white font-black text-lg uppercase tracking-wide">Paso 1 — Verifica tu identidad</h2>
                                <p className="text-green-200 text-xs mt-0.5">Consultamos tu DNI con RENIEC para validar tus datos</p>
                            </div>
                            <div className="p-6 space-y-5">
                                {/* DNI input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-widest">
                                        Número de DNI
                                    </label>
                                    <div className="flex gap-2 grid">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={8}
                                            value={dni}
                                            onChange={e => handleDniChange(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleBuscarDni()}
                                            placeholder="00000000"
                                            className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-2xl font-mono text-center tracking-[0.3em] focus:outline-none focus:border-[#007b3b] transition-colors"
                                        />
                                                    
                                        <button
                                            onClick={handleBuscarDni}
                                            disabled={loadingReniec || dni.length !== 8}
                                            className="bg-[#007b3b] text-white font-bold px-5 py-3 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm
                                            "
                                        >
                                            {loadingReniec ? (
                                                <span className="animate-pulse">···</span>
                                            ) : 'BUSCAR'}
                                        </button>
                                    </div>
                                    {dniError && (
                                        <p className="mt-2 text-sm text-red-600 font-medium">{dniError}</p>
                                    )}
                                </div>

                                {/* Nombres */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-widest">Nombres</label>
                                    <input
                                        type="text"
                                        value={nombres}
                                        onChange={e => setNombres(e.target.value)}
                                        readOnly={reniecVerified}
                                        placeholder={reniecVerified || manualMode ? '' : 'Aparecerá al buscar tu DNI'}
                                        className={`w-full border-2 rounded-lg px-4 py-2.5 font-semibold focus:outline-none transition-colors
                                            ${reniecVerified ? 'border-green-400 bg-green-50 text-green-800 cursor-default' : 'border-gray-300 focus:border-[#007b3b]'}`}
                                    />
                                </div>

                                {/* Apellidos */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-widest">Apellidos</label>
                                    <input
                                        type="text"
                                        value={apellidos}
                                        onChange={e => setApellidos(e.target.value)}
                                        readOnly={reniecVerified}
                                        placeholder={reniecVerified || manualMode ? '' : 'Aparecerá al buscar tu DNI'}
                                        className={`w-full border-2 rounded-lg px-4 py-2.5 font-semibold focus:outline-none transition-colors
                                            ${reniecVerified ? 'border-green-400 bg-green-50 text-green-800 cursor-default' : 'border-gray-300 focus:border-[#007b3b]'}`}
                                    />
                                </div>

                                {/* Feedback RENIEC */}
                                {reniecVerified && (
                                    <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-3">
                                        <span className="text-2xl">✅</span>
                                        <div>
                                            <p className="text-green-800 font-bold text-sm">Identidad verificada con RENIEC</p>
                                            <p className="text-green-600 text-xs">{nombres} {apellidos}</p>
                                        </div>
                                    </div>
                                )}
                                {manualMode && (
                                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                                        <p className="text-yellow-800 text-sm font-medium">
                                            ⚠️ RENIEC no disponible. Ingresa tu nombre y apellidos manualmente.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => { setDniError(''); setStep(2); }}
                                    disabled={!canAdvance}
                                    className="w-full bg-[#e32118] text-white font-black text-lg py-3.5 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors tracking-wide mt-2"
                                >
                                    CONTINUAR →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════ PASO 2: NÚMEROS ════════════════ */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-[#a3a3a3] px-6 py-4">
                                <h2 className="text-white font-black text-lg uppercase tracking-wide">Paso 2 — Elige tus 6 números</h2>
                                <p className="text-gray-100 text-xs mt-0.5">
                                    Hola <span className="font-bold text-yellow-200">{nombres}</span> — Marca 6 bolillas del 1 al 53
                                </p>
                            </div>
                            <div className="p-6">
                                {/* Bolillas seleccionadas */}
                                <div className="flex gap-2 justify-center mb-5 min-h-[48px] items-center">
                                    {selected.length === 0 ? (
                                        <span className="text-gray-400 italic text-sm">Ningún número seleccionado aún</span>
                                    ) : (
                                        selected.map(n => (
                                            <button
                                                key={n}
                                                onClick={() => handleToggle(n)}
                                                title="Click para quitar"
                                                className="w-11 h-11 rounded-full bg-[#e32118] text-white font-black flex items-center justify-center text-sm shadow-md hover:bg-red-700 transition-colors"
                                            >
                                                {n}
                                            </button>
                                        ))
                                    )}
                                    {selected.length > 0 && selected.length < 6 && (
                                        [...Array(6 - selected.length)].map((_, i) => (
                                            <div key={`empty-${i}`} className="w-11 h-11 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs font-bold">
                                                ?
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Progreso */}
                                <div className="flex justify-center mb-4">
                                    <span className={`text-sm font-bold px-4 py-1 rounded-full ${selected.length === 6 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {selected.length}/6 seleccionados
                                    </span>
                                </div>

                                {/* Grilla */}
                                <div className="grid grid-cols-9 gap-y-2 gap-x-1 mb-5 place-items-center">
                                    {numbers.map(num => {
                                        const isSel = selected.includes(num);
                                        const isFull = selected.length >= 6 && !isSel;
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => handleToggle(num)}
                                                disabled={isFull}
                                                className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all
                                                    ${isSel
                                                        ? 'bg-[#e32118] text-white border-[#e32118] scale-110 shadow-md'
                                                        : isFull
                                                            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 border-gray-400 hover:bg-yellow-50 hover:border-yellow-400'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Botones al azar / limpiar */}
                                <div className="flex justify-center gap-3 mb-5">
                                    <button
                                        onClick={handleRandom}
                                        className="bg-[#ffe700] hover:bg-yellow-300 text-gray-900 font-bold py-2 px-6 rounded-full text-sm shadow-sm transition-colors"
                                    >
                                        🎲 Al Azar
                                    </button>
                                    <button
                                        onClick={() => setSelected([])}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-full text-sm shadow-sm transition-colors"
                                    >
                                        ✕ Limpiar
                                    </button>
                                </div>

                                {registerError && (
                                    <p className="text-red-600 text-sm font-medium text-center mb-3">{registerError}</p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        ← Atrás
                                    </button>
                                    <button
                                        onClick={handleRegistrar}
                                        disabled={selected.length !== 6 || loadingRegister}
                                        className="flex-2 flex-grow-[2] bg-[#e32118] text-white font-black text-lg py-3 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors tracking-wide"
                                    >
                                        {loadingRegister ? 'REGISTRANDO...' : '🎟 PARTICIPAR'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ PASO 3: ÉXITO ══════════════════ */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-center">
                            <div className="bg-[#007b3b] px-6 py-6">
                                <p className="text-6xl mb-2">🎉</p>
                                <h2 className="text-white font-black text-2xl uppercase tracking-tight">¡Estás participando!</h2>
                                <p className="text-green-200 text-sm mt-1">Tu registro fue exitoso</p>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-green-800 font-bold text-lg">{nombres} {apellidos}</p>
                                    <p className="text-green-600 text-sm font-mono">DNI: {dni}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">Tus números de la suerte</p>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        {selected.map(n => (
                                            <span
                                                key={n}
                                                className="w-12 h-12 rounded-full bg-[#e32118] text-white font-black text-lg flex items-center justify-center shadow-md"
                                            >
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <p className="text-yellow-800 text-sm font-medium">
                                        🎯 Tus números han sido registrados. El administrador realizará el sorteo y la simulación de Monte Carlo para determinar las probabilidades de ganar.
                                    </p>
                                </div>

                                <button
                                    onClick={handleVolverEmpezar}
                                    className="w-full border-2 border-[#007b3b] text-[#007b3b] font-bold py-3 rounded-lg hover:bg-green-50 transition-colors text-sm"
                                >
                                    Registrar otro participante
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FOOTER ─────────────────────────────────── */}
            <footer className="text-center py-4 text-green-600 text-xs">
                Simulador Didáctico La Tinka · Motor LCG + Monte Carlo
            </footer>
        </div>
    );
}
