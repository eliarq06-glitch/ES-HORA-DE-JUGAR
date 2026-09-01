import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, CheckCircle2, Shield, Link as LinkIcon } from 'lucide-react';

export default function Confirm({ isAdmin, user, activeSession, confirmedPlayers, allPlayers, updateConfirmedPlayers, setPlayersDB }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [linkPlayerId, setLinkPlayerId] = useState('');
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', nickname: '' });

  const loggedInPlayer = allPlayers.find(p => p.email === user.email);

  const handleLinkAccount = (e) => {
    e.preventDefault();
    if (!linkPlayerId) return;
    const pid = parseInt(linkPlayerId);
    if(window.confirm('¿Seguro que este eres tú? Esta acción vinculará tu correo a este jugador para siempre.')) {
      setPlayersDB(prev => prev.map(p => p.id === pid ? { ...p, email: user.email } : p));
      alert('¡Cuenta vinculada exitosamente!');
    }
  };

  const handleSelfConfirm = () => {
    if (!loggedInPlayer) return;
    if (!activeSession.confirmedIds.includes(loggedInPlayer.id)) {
      updateConfirmedPlayers([...activeSession.confirmedIds, loggedInPlayer.id]);
      setJustConfirmed(true);
      setTimeout(() => setJustConfirmed(false), 2000);
    }
  };

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
      
      {!isAdmin && !loggedInPlayer && (
        <div className="glass-panel-dark" style={{ border: '2px solid var(--accent-warning)', background: 'rgba(255, 193, 7, 0.1)' }}>
          <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-warning)', margin: 0, marginBottom: '1rem' }}>
            <LinkIcon size={28} /> Vincula tu Perfil
          </h2>
          <p style={{ color: 'white', marginBottom: '1.5rem' }}>
            Hola <strong>{user.user_metadata?.full_name || user.email}</strong>, para poder confirmar tu asistencia necesitamos saber qué jugador de la base de datos eres tú. Selecciona tu nombre en la lista de abajo:
          </p>
          <form onSubmit={handleLinkAccount} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select className="input-dark" style={{ flex: 1, minWidth: '200px' }} value={linkPlayerId} onChange={e => setLinkPlayerId(e.target.value)} required>
              <option value="">-- Selecciona tu nombre --</option>
              {allPlayers.filter(p => !p.email).sort((a,b) => a.firstName.localeCompare(b.firstName)).map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.nickname ? `("${p.nickname}")` : ''}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-warning" style={{ background: 'var(--accent-warning)', color: 'black', fontWeight: 'bold' }}>
              Vincular
            </button>
          </form>
        </div>
      )}

      {!isAdmin && loggedInPlayer && (
        <div className="glass-panel-light" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="avatar-placeholder" style={{ width: '80px', height: '80px', fontSize: '2.5rem', margin: '0 auto 1.5rem auto', boxShadow: '0 0 20px var(--accent-neon)' }}>
            {loggedInPlayer.firstName.charAt(0)}
          </div>
          <h2 className="title-main" style={{ fontSize: '2rem', marginBottom: '0.5rem', margin: 0 }}>Hola, {loggedInPlayer.firstName}</h2>
          <p className="subtitle" style={{ marginBottom: '2rem', color: 'var(--light-text-muted)' }}>Jornada: {activeSession?.name} ({activeSession?.date})</p>
          
          {activeSession.confirmedIds.includes(loggedInPlayer.id) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--accent-neon)', fontWeight: 'bold' }}>
              <CheckCircle2 size={48} />
              <span style={{ fontSize: '1.5rem' }}>¡Estás Confirmado!</span>
              <p style={{ color: 'var(--light-text-muted)', fontWeight: 'normal' }}>Nos vemos en la cancha.</p>
            </div>
          ) : (
            <button 
              className="btn btn-neon" 
              style={{ fontSize: '1.5rem', padding: '1rem 2rem', width: '100%', maxWidth: '400px' }}
              onClick={handleSelfConfirm}
            >
              Confirmar mi Asistencia
            </button>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="glass-panel-light">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="title-main" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Shield size={28} /> Admin: Confirmar
              </h2>
              <p className="subtitle" style={{ marginBottom: '2rem', color: 'var(--light-text-muted)' }}>Jornada: {activeSession?.name} ({activeSession?.date})</p>
            </div>
            <button 
              className="btn btn-dark" 
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
              onClick={() => {
                navigator.clipboard.writeText(`¡Confirma tu asistencia para la jornada de hoy!\n👉 ${window.location.origin}`);
                alert('¡Link copiado al portapapeles!');
              }}
            >
              <LinkIcon size={16} /> Compartir Link
            </button>
          </div>

          <h4 style={{ marginBottom: '1rem', color: 'var(--light-text)' }}>Seleccionar jugador:</h4>
          <form onSubmit={handleConfirmExisting} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <select 
              className="input-light" 
              style={{ flex: 1, minWidth: '200px' }}
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
            >
              <option value="">Seleccionar jugador existente...</option>
              {allPlayers.filter(p => !activeSession?.confirmedIds.includes(p.id)).sort((a,b) => a.firstName.localeCompare(b.firstName)).map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.nickname ? `"${p.nickname}"` : ''}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-dark" disabled={!selectedPlayerId} style={{ minWidth: '120px' }}>
              Confirmar
            </button>
          </form>

          {justConfirmed && <div style={{ color: 'var(--accent-neon)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} /> Confirmado correctamente</div>}

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--light-text)' }}>O crear jugador nuevo:</h4>
            <form onSubmit={handleCreateNew} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="text" className="input-light" placeholder="Nombre" value={newPlayer.firstName} onChange={e => setNewPlayer({...newPlayer, firstName: e.target.value})} style={{ flex: 1, minWidth: '120px' }} required />
              <input type="text" className="input-light" placeholder="Apellido" value={newPlayer.lastName} onChange={e => setNewPlayer({...newPlayer, lastName: e.target.value})} style={{ flex: 1, minWidth: '120px' }} />
              <input type="text" className="input-light" placeholder="Apodo (Opcional)" value={newPlayer.nickname} onChange={e => setNewPlayer({...newPlayer, nickname: e.target.value})} style={{ flex: 1, minWidth: '120px' }} />
              <button type="submit" className="btn btn-dark">Crear y Confirmar</button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Confirmados visible para todos */}
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
