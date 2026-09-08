import React, { useState, useEffect } from 'react';
import { UserPlus, Save, Trash2, Edit2, Shield, Users, ShieldAlert, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseConfig } from '../hooks/useSupabase';

export default function AdminPlayers({ allPlayers, setPlayersDB, isGlobalAdmin }) {
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', nickname: '', email: '', password: '', photoUrl: '', stars: 3, status: 'active' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', nickname: '', email: '', photoUrl: '', stars: 3, status: 'active' });
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sponsorsConfig, setSponsorsConfig] = useSupabaseConfig('sponsors', []);
  const [activityLog, setActivityLog] = useSupabaseConfig('activityLog', []);

  useEffect(() => {
    if (isGlobalAdmin) {
      supabase.from('profiles').select('*').then(({ data }) => setProfiles(data || []));
    }
  }, [isGlobalAdmin]);

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

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newPlayer.firstName || !newPlayer.email || !newPlayer.password) {
      alert("Por favor, ingresa el Nombre, Correo y una Contraseña para poder crear al jugador.");
      return;
    }

    try {
      // Cliente secundario para no cerrar la sesión del admin al crear usuarios
      const authClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      // 1. Crear el usuario en Supabase Auth silenciosamente
      const { data: authData, error: authError } = await authClient.auth.signUp({
        email: newPlayer.email.toLowerCase().trim(),
        password: newPlayer.password,
        options: {
          data: {
            full_name: `${newPlayer.firstName} ${newPlayer.lastName}`.trim().toUpperCase(),
          }
        }
      });

      if (authError) throw authError;

      // 2. Crear el perfil del jugador en la base de datos
      const newId = Date.now();
      const playerObj = { 
        ...newPlayer, 
        id: newId, 
        firstName: newPlayer.firstName.toUpperCase(),
        lastName: newPlayer.lastName.toUpperCase(),
        nickname: newPlayer.nickname ? newPlayer.nickname.toUpperCase() : '',
        email: newPlayer.email.toLowerCase().trim(),
        ratings: [] 
      };
      
      // Removemos el password del objeto antes de guardarlo en playersDB
      delete playerObj.password;

      setPlayersDB(prev => [...prev, playerObj]);
      setNewPlayer({ firstName: '', lastName: '', nickname: '', email: '', password: '', photoUrl: '', stars: 3, status: 'active' });
      alert(`¡Jugador y cuenta creados exitosamente!\nPasale estos datos:\nCorreo: ${playerObj.email}\nContraseña: ${newPlayer.password}`);
    } catch (err) {
      alert("Error al crear la cuenta: " + err.message);
    }
  };

  const handleStartEdit = (p) => {
    setEditingId(p.id);
    setEditData({ 
      firstName: p.firstName, 
      lastName: p.lastName, 
      nickname: p.nickname || '', 
      email: p.email || '', 
      photoUrl: p.photoUrl || '', 
      stars: p.stars || 3,
      status: p.status || 'active',
      cardType: p.cardType || 'default',
      position: p.position || 'MCO'
    });
  };

  const handleSaveEdit = (id) => {
    const oldPlayer = allPlayers.find(p => p.id === id);
    const logs = [];
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const name = `${oldPlayer.firstName} ${oldPlayer.lastName}`;

    const oldStatus = oldPlayer?.status || 'active';
    const newStatus = editData.status || 'active';
    if (oldStatus !== newStatus) {
      const statusName = newStatus === 'injured' ? 'LESIONADO/AUSENTE' : newStatus === 'occasional' ? 'CASTIGADO/OCASIONAL' : newStatus === 'frequent' ? 'FRECUENTE (Toma Biela)' : 'ACTIVO';
      logs.push({ id: Date.now(), text: `⚠️ La Directiva cambió el estado de ${name} a: ${statusName}`, time });
    }

    const cardNames = { default: 'Por Defecto', blue: 'Ultimate Blue', white: 'Icon White', black: 'TOTW Black', gold: 'Rare Gold', bronze: 'Bronze' };
    if ((oldPlayer?.cardType || 'default') !== (editData.cardType || 'default')) {
      logs.push({ id: Date.now() + 1, text: `🃏 ${name} ahora tiene carta FIFA: ${cardNames[editData.cardType] || editData.cardType}`, time });
    }

    if ((oldPlayer?.position || 'MCO') !== (editData.position || 'MCO')) {
      logs.push({ id: Date.now() + 2, text: `🔄 ${name} cambió de posición a: ${editData.position}`, time });
    }

    const oldStars = oldPlayer?.stars || 3;
    if (oldStars !== parseInt(editData.stars)) {
      logs.push({ id: Date.now() + 3, text: `⭐ ${name} ahora es Bombo ${6 - parseInt(editData.stars)} (${editData.stars} Estrellas)`, time });
    }

    if (logs.length > 0) {
      setActivityLog(prev => [...logs, ...(prev || [])].slice(0, 30));
    }

    setPlayersDB(prev => prev.map(p => p.id === id ? { 
      ...p, 
      ...editData, 
      firstName: editData.firstName.toUpperCase(),
      lastName: editData.lastName.toUpperCase(),
      nickname: editData.nickname ? editData.nickname.toUpperCase() : '',
      stars: parseInt(editData.stars),
      status: editData.status,
      cardType: editData.cardType,
      position: editData.position
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

  // Filtrar y Ordenar alfabéticamente
  const filteredPlayers = allPlayers
    .filter(p => {
      const searchStr = `${p.firstName} ${p.lastName} ${p.nickname} ${p.email}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div className="glass-panel-dark">
        <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, marginBottom: '1rem' }}>
          <Users color="var(--accent-primary)" /> Gestión de Jugadores ({allPlayers.length})
        </h2>
        <p style={{ color: 'var(--dark-text-muted)' }}>
          Aquí puedes clasificar a los jugadores por Bombos y subir sus fotos directamente.
        </p>
      </div>

      <div className="glass-panel-light">
        <h3 style={{ margin: '0 0 1rem 0' }}>Agregar Nuevo Jugador y Crear su Cuenta</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--light-text-muted)', marginBottom: '1rem' }}>Llena todos los datos. El sistema le creará automáticamente una cuenta con la contraseña que elijas para que pueda iniciar sesión.</p>
        <form onSubmit={handleCreateNew} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" className="input-dark" placeholder="Nombre (Req)" value={newPlayer.firstName} onChange={e => setNewPlayer({...newPlayer, firstName: e.target.value})} style={{ flex: 1, minWidth: '120px' }} required />
          <input type="text" className="input-dark" placeholder="Apellido" value={newPlayer.lastName} onChange={e => setNewPlayer({...newPlayer, lastName: e.target.value})} style={{ flex: 1, minWidth: '120px' }} />
          <input type="text" className="input-dark" placeholder="Apodo" value={newPlayer.nickname} onChange={e => setNewPlayer({...newPlayer, nickname: e.target.value})} style={{ flex: 1, minWidth: '100px' }} />
          <input type="email" className="input-dark" placeholder="Email (Req)" value={newPlayer.email} onChange={e => setNewPlayer({...newPlayer, email: e.target.value})} style={{ flex: 1, minWidth: '150px' }} required />
          <input type="text" className="input-dark" placeholder="Contraseña (Req)" value={newPlayer.password} onChange={e => setNewPlayer({...newPlayer, password: e.target.value})} style={{ flex: 1, minWidth: '150px' }} required minLength={6} />
          
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--accent-neon)' }}>Plantilla General (Todos los jugadores)</h3>
          <input 
            type="text" 
            className="input-light" 
            placeholder="🔍 Buscar por nombre, apodo o correo..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredPlayers.map(p => (
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
                  
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{fontSize:'0.7rem', color:'gray'}}>Posición</label>
                    <select className="input-dark" value={editData.position || 'MCO'} onChange={e => setEditData({...editData, position: e.target.value})} style={{ width: '100%' }}>
                      <option value="POR">POR</option>
                      <option value="DFC">DFC</option>
                      <option value="LI">LI</option>
                      <option value="LD">LD</option>
                      <option value="MCD">MCD</option>
                      <option value="MC">MC</option>
                      <option value="MCO">MCO</option>
                      <option value="MI">MI</option>
                      <option value="MD">MD</option>
                      <option value="EI">EI</option>
                      <option value="ED">ED</option>
                      <option value="DC">DC</option>
                      <option value="DEL">DEL</option>
                    </select>
                  </div>

                  <div style={{ flex: 1.5, minWidth: '150px' }}><label style={{fontSize:'0.7rem', color:'gray'}}>Email Vinculado</label><input type="email" className="input-dark" placeholder="Email vinculado" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} style={{ width: '100%' }} /></div>

                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{fontSize:'0.7rem', color:'gray'}}>Estado</label>
                    <select className="input-dark" value={editData.status || 'active'} onChange={e => setEditData({...editData, status: e.target.value})} style={{ width: '100%' }}>
                      <option value="frequent">Frecuente (Toma Biela)</option>
                      <option value="active">Activo (Normal)</option>
                      <option value="occasional">Ocasional (Ausente / Castigado)</option>
                      <option value="injured">Lesionado (Descartado)</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{fontSize:'0.7rem', color:'gray'}}>Carta FIFA</label>
                    <select className="input-dark" value={editData.cardType || 'default'} onChange={e => setEditData({...editData, cardType: e.target.value})} style={{ width: '100%' }}>
                      <option value="default">Por Defecto (según Estrellas)</option>
                      <option value="blue">Ultimate Blue (Azul)</option>
                      <option value="white">Icon White (Blanca)</option>
                      <option value="black">TOTW Black (Negra)</option>
                      <option value="gold">Rare Gold (Dorada)</option>
                      <option value="bronze">Bronze (Bronce)</option>
                    </select>
                  </div>
                  
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                  <div className="avatar-placeholder">{p.firstName.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{p.firstName} {p.lastName} {p.nickname && <span style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}>"{p.nickname}"</span>}</div>
                    <div style={{ fontSize: '0.8rem', color: p.email ? 'var(--accent-neon)' : 'var(--dark-text-muted)' }}>
                      {p.email ? `✉️ ${p.email}` : 'Sin cuenta vinculada'}
                    </div>
                  </div>
                  
                  {isGlobalAdmin && (
                    <div style={{ minWidth: '150px' }}>
                      {(() => {
                        const matchingProfile = p.email ? profiles.find(pr => pr.email?.toLowerCase() === p.email.toLowerCase()) : null;
                        if (!matchingProfile) return <span style={{ fontSize: '0.7rem', color: 'gray' }}>No Autenticado</span>;
                        
                        return (
                          <select 
                            className="input-dark" 
                            value={matchingProfile.role || 'player'} 
                            onChange={(e) => handleUpdateRole(matchingProfile.id, matchingProfile.role, e.target.value)}
                            style={{ padding: '0.3rem', fontSize: '0.8rem', width: '100%', borderColor: matchingProfile.role === 'admin' ? 'var(--accent-neon)' : '' }}
                          >
                            <option value="player">Jugador (Sin permisos)</option>
                            <option value="admin">Admin (Lucho)</option>
                            {matchingProfile.role === 'global_admin' && <option value="global_admin">SUPER ADMIN</option>}
                          </select>
                        );
                      })()}
                    </div>
                  )}
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
