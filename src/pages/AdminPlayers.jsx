import React, { useState, useEffect } from 'react';
import { UserPlus, Save, Trash2, Edit2, Shield, Users, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseConfig } from '../hooks/useSupabase';

export default function AdminPlayers({ allPlayers, setPlayersDB, isGlobalAdmin }) {
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', nickname: '', email: '', photoUrl: '', stars: 3 });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', nickname: '', email: '', photoUrl: '', stars: 3 });
  const [profiles, setProfiles] = useState([]);
  const [sponsorsConfig, setSponsorsConfig] = useSupabaseConfig('sponsors', []);

  useEffect(() => {
    if (isGlobalAdmin) {
      fetchProfiles();
    }
  }, [isGlobalAdmin]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  const handleUploadPhoto = async (e, isNew) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('fotos').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('fotos').getPublicUrl(fileName);
      
      if (isNew) {
        setNewPlayer({ ...newPlayer, photoUrl: data.publicUrl });
      } else {
        setEditData({ ...editData, photoUrl: data.publicUrl });
      }
      alert('¡Foto subida con éxito!');
    } catch (err) {
      alert('Error subiendo foto. Asegúrate de haber creado el bucket "fotos" público en Supabase. Detalles: ' + err.message);
    }
  };

  const handleUpdateRole = async (id, currentRole, newRole) => {
    if (currentRole === 'global_admin') {
      alert("No puedes quitarle permisos al Super Admin.");
      return;
    }
    if (window.confirm(`¿Seguro que deseas dar permisos de ${newRole} a este usuario?`)) {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
      if (error) {
        alert("Error de permisos: " + error.message + ". Necesitas desactivar RLS en la tabla 'profiles' desde Supabase.");
      } else {
        setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
        alert("¡Rol actualizado exitosamente!");
      }
    }
  };
  const formatTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/['"]/g, '').trim().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newPlayer.firstName) return;
    const newId = Date.now();
    const playerObj = { 
      id: newId, 
      ...newPlayer, 
      firstName: newPlayer.firstName.toUpperCase(),
      lastName: newPlayer.lastName.toUpperCase(),
      nickname: formatTitleCase(newPlayer.nickname),
      ratings: [] 
    };
    setPlayersDB(prev => [...prev, playerObj]);
    setNewPlayer({ firstName: '', lastName: '', nickname: '', email: '', photoUrl: '', stars: 3 });
  };

  const handleStartEdit = (p) => {
    setEditingId(p.id);
    setEditData({ firstName: p.firstName, lastName: p.lastName, nickname: p.nickname || '', email: p.email || '', photoUrl: p.photoUrl || '', stars: p.stars || 3 });
  };

  const handleSaveEdit = (id) => {
    setPlayersDB(prev => prev.map(p => p.id === id ? { 
      ...p, 
      ...editData, 
      firstName: editData.firstName.toUpperCase(),
      lastName: editData.lastName.toUpperCase(),
      nickname: formatTitleCase(editData.nickname),
      stars: parseInt(editData.stars) 
    } : p));
    setEditingId(null);
  };

  const handleDelete = (id, p) => {
    if (p.firstName === 'Víctor' || p.firstName === 'Victor' || p.email === 'eli.arq.06@gmail.com') {
      alert('¡Acción no permitida! No puedes eliminar al Administrador Global (Víctor).');
      return;
    }
    if(window.confirm('¿Estás seguro de eliminar este jugador? Perderá todos sus históricos y estadísticas.')) {
      setPlayersDB(prev => prev.filter(player => player.id !== id));
    }
  };

  // Ordenar alfabéticamente
  const sortedPlayers = [...allPlayers].sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {isGlobalAdmin && (
        <div className="glass-panel-dark" style={{ border: '2px solid var(--accent-neon)' }}>
          <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, marginBottom: '1rem', color: 'var(--accent-neon)' }}>
            <ShieldAlert size={28} /> Accesos (Solo Super Admin)
          </h2>
          <p style={{ color: 'var(--dark-text-muted)', marginBottom: '1.5rem' }}>
            Aquí puedes darle permisos de Admin a otros usuarios (ej. Lucho) cuando se registren.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.5rem', color: 'var(--accent-warning)' }}>Usuario</th>
                  <th style={{ padding: '0.5rem', color: 'var(--accent-warning)' }}>Apodo</th>
                  <th style={{ padding: '0.5rem', color: 'var(--accent-warning)' }}>Rol Actual</th>
                  <th style={{ padding: '0.5rem', color: 'var(--accent-warning)' }}>Cambiar Rol</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => {
                  const matchingPlayer = allPlayers.find(ap => {
                    const matchByEmail = ap.email && p.email && ap.email.toLowerCase() === p.email.toLowerCase();
                    const matchByName = p.full_name && ap.firstName && 
                      p.full_name.toLowerCase().includes(ap.firstName.toLowerCase()) && 
                      (!ap.lastName || p.full_name.toLowerCase().includes(ap.lastName.toLowerCase()));
                    return matchByEmail || matchByName;
                  });
                  return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem', color: 'white' }}>
                      {p.full_name?.toUpperCase() || p.email?.toLowerCase() || 'DESCONOCIDO'}
                    </td>
                    <td style={{ padding: '0.5rem', color: 'var(--accent-warning)', fontSize: '0.9rem' }}>
                      {matchingPlayer && matchingPlayer.nickname ? `"${matchingPlayer.nickname}"` : '-'}
                    </td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: p.role === 'global_admin' ? 'var(--accent-danger)' : p.role === 'admin' ? 'var(--accent-neon)' : 'white' }}>
                      {p.role === 'global_admin' ? 'SUPER ADMIN' : p.role === 'admin' ? 'ADMIN' : 'Jugador'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {p.role !== 'global_admin' && (
                        <select 
                          className="input-dark" 
                          value={p.role || 'player'} 
                          onChange={(e) => handleUpdateRole(p.id, p.role, e.target.value)}
                          style={{ padding: '0.3rem', fontSize: '0.8rem' }}
                        >
                          <option value="player">Jugador (Sin permisos)</option>
                          <option value="admin">Admin (Lucho)</option>
                        </select>
                      )}
                    </td>
                  </tr>
                )})}
                {profiles.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'white' }}>Cargando usuarios o sin datos...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass-panel-dark">
        <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, marginBottom: '1rem' }}>
          <Users color="var(--accent-primary)" /> Gestión de Jugadores ({allPlayers.length})
        </h2>
        <p style={{ color: 'var(--dark-text-muted)' }}>
          Aquí puedes clasificar a los jugadores por Bombos y subir sus fotos directamente.
        </p>
      </div>

      <div className="glass-panel-light">
        <h3 style={{ margin: '0 0 1rem 0' }}>Agregar Nuevo Jugador</h3>
        <form onSubmit={handleCreateNew} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" className="input-dark" placeholder="Nombre" value={newPlayer.firstName} onChange={e => setNewPlayer({...newPlayer, firstName: e.target.value})} style={{ flex: 1, minWidth: '120px' }} required />
          <input type="text" className="input-dark" placeholder="Apellido" value={newPlayer.lastName} onChange={e => setNewPlayer({...newPlayer, lastName: e.target.value})} style={{ flex: 1, minWidth: '120px' }} />
          <input type="text" className="input-dark" placeholder="Apodo" value={newPlayer.nickname} onChange={e => setNewPlayer({...newPlayer, nickname: e.target.value})} style={{ flex: 1, minWidth: '100px' }} />
          <input type="email" className="input-dark" placeholder="Email" value={newPlayer.email} onChange={e => setNewPlayer({...newPlayer, email: e.target.value})} style={{ flex: 1, minWidth: '150px' }} />
          
          <select className="input-dark" value={newPlayer.position || 'MCO'} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} style={{ flex: 0.5, minWidth: '90px' }}>
            <option value="POR">POR</option>
            <option value="DEF">DEF</option>
            <option value="MCD">MCD</option>
            <option value="MC">MC</option>
            <option value="MCO">MCO</option>
            <option value="ED">ED</option>
            <option value="EI">EI</option>
            <option value="DC">DC</option>
          </select>
          <select className="input-dark" value={newPlayer.stars} onChange={e => setNewPlayer({...newPlayer, stars: parseInt(e.target.value)})} style={{ flex: 1, minWidth: '150px' }}>
            <option value={5}>Bombo 1 (5 Estrellas)</option>
            <option value={4}>Bombo 2 (4 Estrellas)</option>
            <option value={3}>Bombo 3 (3 Estrellas)</option>
            <option value={2}>Bombo 4 (2 Estrellas)</option>
            <option value={1}>Bombo 5 (1 Estrella)</option>
          </select>
          
          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.8rem', color: '#666' }}>Cargar Foto:</label>
            <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, true)} style={{ width: '100%' }} />
          </div>
          
          <button type="submit" className="btn btn-neon" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-end' }}>
            <UserPlus size={18} /> Agregar
          </button>
        </form>
      </div>

      <div className="glass-panel-dark">
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--accent-neon)' }}>Plantilla General (Todos los jugadores)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedPlayers.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
              
              {editingId === p.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '100px' }}><label style={{fontSize:'0.7rem', color:'gray'}}>Nombre</label><input type="text" className="input-dark" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} style={{ width: '100%' }} /></div>
                  <div style={{ flex: 1, minWidth: '100px' }}><label style={{fontSize:'0.7rem', color:'gray'}}>Apellido</label><input type="text" className="input-dark" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} style={{ width: '100%' }} /></div>
                  <div style={{ flex: 0.5, minWidth: '80px' }}><label style={{fontSize:'0.7rem', color:'gray'}}>Apodo</label><input type="text" className="input-dark" value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} style={{ width: '100%' }} /></div>
                  
                  <div style={{ flex: 0.5, minWidth: '70px' }}>
                    <label style={{fontSize:'0.7rem', color:'gray'}}>Pos</label>
                    <select className="input-dark" value={editData.position || 'MCO'} onChange={e => setEditData({...editData, position: e.target.value})} style={{ width: '100%' }}>
                      <option value="POR">POR</option>
                      <option value="DEF">DEF</option>
                      <option value="MCD">MCD</option>
                      <option value="MC">MC</option>
                      <option value="MCO">MCO</option>
                      <option value="ED">ED</option>
                      <option value="EI">EI</option>
                      <option value="DC">DC</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{fontSize:'0.7rem', color:'gray'}}>Clasificación Bombo</label>
                    <select className="input-dark" value={editData.stars} onChange={e => setEditData({...editData, stars: parseInt(e.target.value)})} style={{ width: '100%' }}>
                      <option value={5}>Bombo 1 (5 Estrellas)</option>
                      <option value={4}>Bombo 2 (4 Estrellas)</option>
                      <option value={3}>Bombo 3 (3 Estrellas)</option>
                      <option value={2}>Bombo 4 (2 Estrellas)</option>
                      <option value={1}>Bombo 5 (1 Estrella)</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1.5, minWidth: '150px' }}><label style={{fontSize:'0.7rem', color:'gray'}}>Email Vinculado</label><input type="email" className="input-dark" placeholder="Email vinculado" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} style={{ width: '100%' }} /></div>
                  
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <label style={{fontSize:'0.7rem', color:'gray'}}>Actualizar Foto</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, false)} style={{ width: '100%', color: 'white' }} />
                      {editData.photoUrl && (
                        <button className="btn btn-danger" type="button" onClick={() => setEditData({...editData, photoUrl: ''})} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Borrar</button>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-neon" onClick={() => handleSaveEdit(p.id)} style={{ padding: '0.5rem' }}>
                    <Save size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div className="avatar-placeholder">{p.firstName.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{p.firstName} {p.lastName} {p.nickname && <span style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}>"{p.nickname}"</span>}</div>
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
                    <button className="btn btn-dark" onClick={() => handleDelete(p.id, p)} style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}>
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel-dark" style={{ marginTop: '2rem' }}>
        <h3 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-neon)', marginBottom: '1rem' }}>
          <ImageIcon /> Gestión de Auspiciantes ({sponsorsConfig?.length || 0})
        </h3>
        <p style={{ color: 'var(--dark-text-muted)', marginBottom: '1rem' }}>Sube el logo de los auspiciantes. Se acomodarán automáticamente en el banner de Jugadores.</p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', color: '#666' }}>Cargar Nuevo Logo:</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `sponsor_${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, file);
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
                    const currentSponsors = sponsorsConfig || [];
                    setSponsorsConfig([...currentSponsors, { id: Date.now(), url: publicUrl }]);
                    alert('Auspiciante agregado.');
                  } catch (error) {
                    alert('Error al subir: ' + error.message);
                  }
              }} style={{ width: '100%' }} />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {sponsorsConfig && sponsorsConfig.map(sponsor => (
                <div key={sponsor.id} style={{ background: 'white', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '120px' }}>
                    <img src={sponsor.url} alt="Sponsor" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <button className="btn btn-danger" onClick={() => setSponsorsConfig((sponsorsConfig || []).filter(s => s.id !== sponsor.id))} style={{ padding: '0.3rem', width: '100%' }}>
                        Eliminar
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
