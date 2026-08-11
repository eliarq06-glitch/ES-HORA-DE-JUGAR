import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, CheckCircle2, Shield } from 'lucide-react';

export default function Confirm({ isAdmin, activeSession, confirmedPlayers, allPlayers, updateConfirmedPlayers, setPlayersDB }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', nickname: '' });

  const handleConfirmExisting = (e) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    const pid = parseInt(selectedPlayerId);
    if (!activeSession.confirmedIds.includes(pid)) {
      updateConfirmedPlayers([...activeSession.confirmedIds, pid]);
      setJustConfirmed(true);
      setTimeout(() => setJustConfirmed(false), 2000);
    }
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newPlayer.firstName) return;
    const newId = Date.now();
    const playerObj = { id: newId, ...newPlayer, ratings: [] };
    setPlayersDB(prev => [...prev, playerObj]);
    updateConfirmedPlayers([...activeSession.confirmedIds, newId]);
    setNewPlayer({ firstName: '', lastName: '', nickname: '' });
    setJustConfirmed(true);
    setTimeout(() => setJustConfirmed(false), 2000);
  };

  const handleRemove = (id) => {
    updateConfirmedPlayers(activeSession.confirmedIds.filter(pid => pid !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '600px' }}>
      <div className="glass-panel-light">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="title-main" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={28} /> Confirmar Asistencia
            </h2>
            <p className="subtitle" style={{ marginBottom: '2rem' }}>Jornada: {activeSession?.name} ({activeSession?.date})</p>
          </div>
          <button 
            className="btn btn-dark" 
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
            onClick={() => {
              navigator.clipboard.writeText(`¡Confirma tu asistencia para la jornada de hoy!\n👉 ${window.location.origin}`);
              alert('¡Mensaje copiado! Pégalo en el grupo de WhatsApp.');
            }}
          >
            <Shield size={16} /> Compartir Link
          </button>
        </div>
        
        <h4 style={{ marginBottom: '1rem', color: 'var(--light-text)' }}>Selecciona tu perfil existente:</h4>
        <form onSubmit={handleConfirmExisting} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <select 
            className="input-light" 
            style={{ flex: 1 }}
            value={selectedPlayerId} 
            onChange={(e) => setSelectedPlayerId(e.target.value)}
          >
            <option value="">-- Elige tu nombre --</option>
            {allPlayers.filter(p => !activeSession?.confirmedIds.includes(p.id)).sort((a,b) => a.firstName.localeCompare(b.firstName)).map(p => (
              <option key={p.id} value={p.id}>{p.firstName} "{p.nickname}" {p.lastName}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-dark" disabled={!selectedPlayerId}>
            CONFIRMAR
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--light-glass-border)', margin: '2rem 0' }}></div>

        <h4 style={{ marginBottom: '1rem', color: 'var(--light-text)' }}>¿Eres nuevo? Regístrate:</h4>
        <form onSubmit={handleCreateNew}>
          <div className="form-group">
            <input className="input-light" placeholder="Nombre" value={newPlayer.firstName} onChange={(e) => setNewPlayer({...newPlayer, firstName: e.target.value})} required />
          </div>
          <div className="form-group">
            <input className="input-light" placeholder="Apodo (Opcional)" value={newPlayer.nickname} onChange={(e) => setNewPlayer({...newPlayer, nickname: e.target.value})} />
          </div>
          <div className="form-group">
            <input className="input-light" placeholder="Apellido" value={newPlayer.lastName} onChange={(e) => setNewPlayer({...newPlayer, lastName: e.target.value})} required />
          </div>
          <button type="submit" className={`btn btn-dark ${justConfirmed ? 'animate-success' : ''}`} style={{ width: '100%', marginTop: '1rem' }}>
            {justConfirmed ? <><CheckCircle2 /> ¡REGISTRADO!</> : 'CREAR PERFIL Y CONFIRMAR'}
          </button>
        </form>
      </div>

      <div className="glass-panel-light" style={{ background: 'rgba(255,255,255,0.95)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="title-main" style={{ fontSize: '1.5rem', margin: 0 }}>Confirmados</h2>
          <span style={{ background: 'black', color: 'white', padding: '4px 12px', borderRadius: '100px', fontWeight: 'bold' }}>{confirmedPlayers.length}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {confirmedPlayers.map((player, index) => {
            const isTitular = index < 24;
            return (
            <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--light-text-muted)', width: '25px', textAlign: 'right' }}>#{index + 1}</div>
                <div className="avatar-placeholder">{player.firstName.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--light-text)' }}>
                    {player.firstName} {player.nickname ? <span style={{ color: 'var(--accent-warning)' }}>"{player.nickname}"</span> : ''} {player.lastName}
                  </div>
                  <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                     <span style={{ background: isTitular ? 'var(--accent-neon)' : 'var(--accent-danger)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        {isTitular ? 'TITULAR' : 'ALTERNO'}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--light-text-muted)' }}><Shield size={12} /> OVR {player.ovr}</span>
                  </div>
                </div>
              </div>
              
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent-danger)' }} onClick={() => handleRemove(player.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>
            );
          })}
          {confirmedPlayers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--light-text-muted)' }}>
              Aún no hay confirmados para esta jornada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
