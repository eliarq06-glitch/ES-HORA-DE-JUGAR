import React, { useState } from 'react';
import { UserPlus, Save, Trash2, Edit2, Shield, Users } from 'lucide-react';

export default function AdminPlayers({ allPlayers, setPlayersDB }) {
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', nickname: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', nickname: '', email: '' });

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newPlayer.firstName) return;
    const newId = Date.now();
    const playerObj = { id: newId, ...newPlayer, ratings: [] };
    setPlayersDB(prev => [...prev, playerObj]);
    setNewPlayer({ firstName: '', lastName: '', nickname: '' });
  };

  const handleStartEdit = (p) => {
    setEditingId(p.id);
    setEditData({ firstName: p.firstName, lastName: p.lastName, nickname: p.nickname, email: p.email || '' });
  };

  const handleSaveEdit = (id) => {
    setPlayersDB(prev => prev.map(p => p.id === id ? { ...p, ...editData } : p));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if(window.confirm('¿Estás seguro de eliminar este jugador? Perderá todos sus históricos y estadísticas.')) {
      setPlayersDB(prev => prev.filter(p => p.id !== id));
    }
  };

  // Ordenar alfabéticamente
  const sortedPlayers = [...allPlayers].sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="glass-panel-dark">
        <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, marginBottom: '1rem' }}>
          <Users color="var(--accent-primary)" /> Gestión de Jugadores ({allPlayers.length})
        </h2>
        <p style={{ color: 'var(--dark-text-muted)' }}>
          Aquí puedes administrar a todos los jugadores de la base de datos. Si un jugador vincula su correo al iniciar sesión, aparecerá aquí.
        </p>
      </div>

      <div className="glass-panel-light">
        <h3 style={{ margin: '0 0 1rem 0' }}>Agregar Nuevo Jugador</h3>
        <form onSubmit={handleCreateNew} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" className="input-dark" placeholder="Nombre" value={newPlayer.firstName} onChange={e => setNewPlayer({...newPlayer, firstName: e.target.value})} style={{ flex: 1, minWidth: '150px' }} required />
          <input type="text" className="input-dark" placeholder="Apellido" value={newPlayer.lastName} onChange={e => setNewPlayer({...newPlayer, lastName: e.target.value})} style={{ flex: 1, minWidth: '150px' }} />
          <input type="text" className="input-dark" placeholder="Apodo" value={newPlayer.nickname} onChange={e => setNewPlayer({...newPlayer, nickname: e.target.value})} style={{ flex: 1, minWidth: '120px' }} />
          <button type="submit" className="btn btn-neon" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} /> Agregar
          </button>
        </form>
      </div>

      <div className="glass-panel-dark">
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--accent-neon)' }}>Lista Completa</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedPlayers.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
              
              {editingId === p.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                  <input type="text" className="input-dark" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} style={{ width: '100px' }} />
                  <input type="text" className="input-dark" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} style={{ width: '100px' }} />
                  <input type="text" className="input-dark" value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} style={{ width: '80px' }} placeholder="Apodo" />
                  <input type="email" className="input-dark" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} style={{ flex: 1, minWidth: '150px' }} placeholder="Email vinculado" />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div className="avatar-placeholder">{p.firstName.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{p.firstName} {p.lastName} {p.nickname && <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>"{p.nickname}"</span>}</div>
                    <div style={{ fontSize: '0.8rem', color: p.email ? 'var(--accent-neon)' : 'var(--dark-text-muted)' }}>
                      {p.email ? `✉️ ${p.email}` : 'Sin cuenta vinculada'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editingId === p.id ? (
                  <button className="btn btn-neon" onClick={() => handleSaveEdit(p.id)} style={{ padding: '0.5rem' }}>
                    <Save size={18} />
                  </button>
                ) : (
                  <>
                    <button className="btn btn-dark" onClick={() => handleStartEdit(p)} style={{ padding: '0.5rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button className="btn btn-dark" onClick={() => handleDelete(p.id)} style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}>
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
