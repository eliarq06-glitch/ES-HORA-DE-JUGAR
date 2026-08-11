import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Activity, Trash2, Play, Pause, Square, AlertCircle } from 'lucide-react';
import TacticalPitch from '../components/TacticalPitch';

// Sonidos usando Web Audio API (Cero dependencias)
const playBeep = (freq = 440, type = 'sine', duration = 0.5) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
};

const playWhistle = () => {
  playBeep(1200, 'square', 0.2);
  setTimeout(() => playBeep(1200, 'square', 0.4), 250);
  setTimeout(() => playBeep(1200, 'square', 0.8), 700);
};

export default function Match({ teams, matchEvents, setMatchEvents, matches, setMatches }) {
  const [activeMatchId, setActiveMatchId] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Timer State
  const [timerDuration, setTimerDuration] = useState(15); // minutes
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const activeMatch = matches?.find(m => m.id === activeMatchId);
  const team1 = activeMatch ? teams.find(t => t.id === activeMatch.team1Id) : null;
  const team2 = activeMatch ? teams.find(t => t.id === activeMatch.team2Id) : null;
  
  const currentEvents = matchEvents.filter(e => e.matchId === activeMatchId);

  const finishMatch = () => {
    if (!activeMatchId) return;
    setMatches(matches.map(m => m.id === activeMatchId ? { ...m, status: 'finished' } : m));
    setActiveMatchId('');
  };

  // Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 61) {
            // Faltando 1 minuto (60 segundos) suena alerta
            playBeep(800, 'sine', 1);
          }
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playWhistle();
            finishMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerDuration * 60);
  };
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Events
  const goalTypes = ['De Jugada', 'De Cabeza', 'De Chilena/Tijera', 'Tiro Libre', 'Penal'];
  const legTypes = ['Derecha', 'Izquierda'];
  const eventTypes = [
    { id: 'goal', label: 'Gol', icon: '⚽' },
    { id: 'own_goal', label: 'Autogol', icon: '💥' },
    { id: 'assist', label: 'Asistencia', icon: '👟' },
    { id: 'shot_on_target', label: 'Tiro al arco', icon: '🎯' },
    { id: 'shot_off_target', label: 'Tiro fuera', icon: '💨' },
    { id: 'save', label: 'Tapada', icon: '🧤' },
    { id: 'interception', label: 'Robo', icon: '🧲' },
    { id: 'foul', label: 'Falta', icon: '⚠️' },
    { id: 'yellow_card', label: 'Amarilla', icon: '🟨' },
    { id: 'red_card', label: 'Roja', icon: '🟥' }
  ];

  const handleAddEvent = (typeId, details = '') => {
    if (!selectedPlayer || !activeMatch) return;

    // Encontrar de qué equipo es el jugador seleccionado
    const isTeam1 = team1.players.find(p => p.id === selectedPlayer.id);
    const teamName = isTeam1 ? team1.name : team2.name;

    const newEvent = {
      id: Date.now(),
      matchId: activeMatchId,
      type: typeId,
      player: selectedPlayer,
      team: teamName,
      details: details,
      timeString: formatTime(timerDuration * 60 - timeLeft),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMatchEvents([newEvent, ...matchEvents]);
    setSelectedPlayer(null); // Reset
  };

  const removeEvent = (id) => {
    setMatchEvents(matchEvents.filter(e => e.id !== id));
  };

  if (!matches || matches.length === 0) {
    return <div className="glass-panel-dark" style={{ textAlign: 'center' }}>Primero debes generar el Torneo en la pestaña "Torneo".</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      
      {/* Top Header: Select Match & Timer */}
      <div className="glass-panel-dark" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div>
          <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <Gamepad2 color="var(--accent-danger)" /> VAR en Vivo
          </h2>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Seleccionar Partido Activo</label>
            <select className="input-dark" value={activeMatchId} onChange={(e) => {
              const newId = e.target.value;
              setActiveMatchId(newId);
              if (newId) {
                setMatches(matches.map(m => m.id === newId ? { ...m, status: 'active' } : (m.status === 'active' ? { ...m, status: 'pending' } : m)));
              }
              resetTimer();
            }} style={{ minWidth: '250px' }}>
              <option value="">-- Elige un partido --</option>
              {matches.filter(m => m.status !== 'finished').map(m => {
                const t1 = teams.find(t => t.id === m.team1Id);
                const t2 = teams.find(t => t.id === m.team2Id);
                if(!t1 || !t2) return null;
                return <option key={m.id} value={m.id}>{m.isFinal ? 'FINAL: ' : ''}{t1.name} vs {t2.name}</option>
              })}
            </select>
          </div>
        </div>

        {activeMatch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', background: 'rgba(0,0,0,0.4)', padding: '1rem 2rem', borderRadius: '16px', border: timeLeft <= 60 ? '2px solid var(--accent-danger)' : '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '900', fontFamily: 'monospace', lineHeight: 1, color: timeLeft <= 60 ? 'var(--accent-danger)' : 'var(--accent-neon)' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: '4px' }}>
                {timeLeft <= 60 && timeLeft > 0 ? '¡ÚLTIMO MINUTO!' : 'TIEMPO RESTANTE'}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={`btn ${isRunning ? 'btn-danger' : 'btn-neon'}`} style={{ padding: '0.5rem', width: '100px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={toggleTimer}>
                  {isRunning ? <><Pause size={18} /> Pausa</> : <><Play size={18} /> {timeLeft === timerDuration * 60 ? 'Iniciar' : 'Reanudar'}</>}
                </button>
                <button className="btn btn-dark" style={{ padding: '0.5rem' }} onClick={resetTimer} title="Reiniciar">
                  <Square size={18} />
                </button>
                <button className="btn btn-dark" style={{ padding: '0.5rem', color: 'var(--accent-warning)', border: '1px solid var(--accent-warning)' }} onClick={() => setTimeLeft(prev => prev + 60)} title="Añadir 1 Minuto">
                  +1 Min
                </button>
                <button className="btn btn-dark" style={{ padding: '0.5rem', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)' }} onClick={() => setTimeLeft(prev => Math.max(1, prev - 60))} title="Restar 1 Minuto">
                  -1 Min
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>Duración:</span>
                  <input type="number" className="input-dark" style={{ width: '60px', padding: '0.2rem', textAlign: 'center' }} value={timerDuration} onChange={(e) => setTimerDuration(Number(e.target.value))} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>min</span>
                </div>
                <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--accent-danger)', color: 'black' }} onClick={() => { if(window.confirm('¿Finalizar el partido inmediatamente?')) { setTimeLeft(0); setIsRunning(false); playWhistle(); finishMatch(); } }}>
                  Terminar Ahora
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeMatch && team1 && team2 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Team 1 Players */}
          <div className="glass-panel-dark">
            <h3 className="title-main" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>{team1.name}</h3>
            <TacticalPitch team={team1} events={currentEvents} selectedPlayerId={selectedPlayer?.id} onPlayerClick={setSelectedPlayer} />
          </div>

          {/* Action Center */}
          <div className="glass-panel-dark" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="title-main" style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-neon)' }}>Registrar Acción</h3>
            
            {selectedPlayer ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {selectedPlayer.firstName} {selectedPlayer.lastName}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {eventTypes.filter(e => e.id !== 'goal' && e.id !== 'own_goal').map(evt => (
                    <button key={evt.id} className="btn btn-dark" style={{ padding: '0.75rem', fontSize: '0.9rem' }} onClick={() => handleAddEvent(evt.id)}>
                      {evt.icon} {evt.label}
                    </button>
                  ))}
                  <button className="btn btn-dark" style={{ padding: '0.75rem', fontSize: '0.9rem', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }} onClick={() => handleAddEvent('own_goal')}>
                    💥 Autogol
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-neon)', marginBottom: '0.5rem', textAlign: 'center' }}>⚽ GOL A FAVOR</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <select id="goalType" className="input-dark" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
                      {goalTypes.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select id="legType" className="input-dark" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
                      {legTypes.map(l => <option key={l} value={l}>{l}</option>)}
                      <option value="Cabeza/Otro">Cabeza</option>
                    </select>
                  </div>
                  <button className="btn btn-neon" style={{ width: '100%', padding: '0.75rem' }} onClick={() => {
                      const type = document.getElementById('goalType').value;
                      const leg = document.getElementById('legType').value;
                      handleAddEvent('goal', `${type} - ${leg}`);
                  }}>
                    ¡GOOOOOOOOL!
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark-text-muted)', textAlign: 'center', padding: '2rem' }}>
                Selecciona un jugador de cualquier equipo para registrar una acción.
              </div>
            )}
          </div>

          {/* Team 2 Players */}
          <div className="glass-panel-dark">
            <h3 className="title-main" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>{team2.name}</h3>
            <TacticalPitch team={team2} events={currentEvents} selectedPlayerId={selectedPlayer?.id} onPlayerClick={setSelectedPlayer} />
          </div>

          {/* Timeline Full Width */}
          <div className="glass-panel-dark" style={{ gridColumn: '1 / -1' }}>
            <h3 className="title-main" style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity color="var(--accent-warning)" /> Timeline del Partido
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {currentEvents.length === 0 ? (
                <div style={{ color: 'var(--dark-text-muted)', textAlign: 'center', padding: '2rem' }}>Aún no hay eventos registrados en este partido.</div>
              ) : (
                currentEvents.map(evt => {
                  const typeInfo = eventTypes.find(e => e.id === evt.type);
                  return (
                    <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: evt.type === 'goal' ? '4px solid var(--accent-neon)' : (evt.type === 'own_goal' ? '4px solid var(--accent-danger)' : '4px solid transparent') }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-neon)', fontWeight: 'bold' }}>{evt.timeString}'</span>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{typeInfo?.icon} {evt.player.firstName} {evt.player.lastName}</span>
                          <span style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>({evt.team})</span>
                          {evt.details && <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>{evt.details}</div>}
                        </div>
                      </div>
                      <button className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent-danger)' }} onClick={() => removeEvent(evt.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel-dark" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={48} color="var(--dark-text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--dark-text-muted)' }}>Selecciona un partido activo en el menú de arriba para empezar el VAR y el Cronómetro.</p>
        </div>
      )}
      
    </div>
  );
}
