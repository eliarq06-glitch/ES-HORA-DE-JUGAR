import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, CheckCircle2, Shield, Link as LinkIcon, MessageSquare, FileDown } from 'lucide-react';
import { useSupabaseConfig } from '../hooks/useSupabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Confirm({ isAdmin, user, activeSession, confirmedPlayers, allPlayers, updateConfirmedPlayers, setPlayersDB }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [linkPlayerId, setLinkPlayerId] = useState('');
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', nickname: '' });
  const [activityLog, setActivityLog] = useSupabaseConfig('activityLog', []);

  const CAPTAINS = ['LUIS', 'SANTIAGO', 'FABRICIO', 'CARLOS'];

  const loggedInPlayer = allPlayers.find(p => p.email === user.email);

  const logActivity = (message) => {
    setActivityLog(prev => [{ id: Date.now(), text: message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }, ...(prev || [])].slice(0, 30));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(225, 193, 110);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('LCDF', pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('La Catedral del Fútbol', pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`${activeSession?.name || 'Jornada'} — ${activeSession?.date || new Date().toISOString().split('T')[0]}`, pageWidth / 2, 38, { align: 'center' });
    
    // Table
    const titulares = confirmedPlayers.slice(0, 24);
    const alternos = confirmedPlayers.slice(24);
    
    const bodyRows = [];
    
    titulares.forEach((p, i) => {
      const isCaptain = CAPTAINS.some(c => p.firstName?.toUpperCase().includes(c));
      bodyRows.push([
        { content: `${i + 1}`, styles: { fontStyle: 'bold', halign: 'center' } },
        { content: `${p.firstName} ${p.nickname ? `"${p.nickname}"` : ''} ${p.lastName}`, styles: isCaptain ? { fontStyle: 'bold', textColor: [225, 193, 110] } : {} },
        { content: p.position || 'MCO', styles: { halign: 'center' } },
        { content: isCaptain ? '⭐ CAPITÁN' : 'TITULAR', styles: isCaptain ? { fontStyle: 'bold', textColor: [225, 193, 110] } : { textColor: [34, 197, 94] } }
      ]);
    });
    
    if (alternos.length > 0) {
      bodyRows.push([{ content: 'ALTERNOS', colSpan: 4, styles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 10 } }]);
      alternos.forEach((p, i) => {
        bodyRows.push([
          { content: `${24 + i + 1}`, styles: { fontStyle: 'bold', halign: 'center' } },
          `${p.firstName} ${p.nickname ? `"${p.nickname}"` : ''} ${p.lastName}`,
          { content: p.position || 'MCO', styles: { halign: 'center' } },
          { content: 'ALTERNO', styles: { textColor: [239, 68, 68] } }
        ]);
      });
    }

    autoTable(doc, {
      startY: 50,
      head: [['#', 'JUGADOR', 'POS', 'ROL']],
      body: bodyRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 30, 30], textColor: [225, 193, 110], fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 18 }, 3: { cellWidth: 30 } },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado por La Catedral del Fútbol — ${new Date().toLocaleString()}`, pageWidth / 2, finalY, { align: 'center' });
    
    doc.save(`LCDF_Lista_${activeSession?.date || 'jornada'}.pdf`);
  };

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
    if (loggedInPlayer.status === 'injured') {
      alert('Actualmente estás marcado como LESIONADO o AUSENTE por el Administrador. No puedes confirmar tu asistencia.');
      return;
    }
    if (!activeSession.confirmedIds.includes(loggedInPlayer.id)) {
      updateConfirmedPlayers([...activeSession.confirmedIds, loggedInPlayer.id]);
      logActivity(`⚽ ${loggedInPlayer.firstName} ${loggedInPlayer.lastName} acaba de confirmar su asistencia.`);
      setJustConfirmed(true);
      setTimeout(() => setJustConfirmed(false), 2000);
    }
  };

  const handleConfirmExisting = (e) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    const pid = parseInt(selectedPlayerId);
    const p = allPlayers.find(pl => pl.id === pid);
    if (p && p.status === 'injured') {
      alert('Este jugador está marcado como LESIONADO o AUSENTE y no puede ser convocado.');
      return;
    }
    if (!activeSession.confirmedIds.includes(pid)) {
      updateConfirmedPlayers([...activeSession.confirmedIds, pid]);
      if (p) logActivity(`⚽ El Administrador confirmó a ${p.firstName} ${p.lastName}.`);
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
    updateConfirmedPlayers(activeSession.confirmedIds.filter(pid => Number(pid) !== Number(id)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '600px' }}>
      
      {(!activeSession || activeSession.status === 'closed' || activeSession.status === 'locked') && (
        <div className="glass-panel-light" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 className="title-main" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--light-text)' }}>NO HAY CONVOCATORIA ABIERTA</h2>
          <p style={{ color: 'var(--light-text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Para confirmar jugadores, el administrador debe crear o activar una nueva jornada en estado Abierto.
          </p>
          {isAdmin && (
            <p style={{ color: 'var(--light-text)', fontWeight: 'bold' }}>Ve a la pestaña "Jornadas" para crear o reanudar una.</p>
          )}
        </div>
      )}

      {(activeSession && activeSession.status !== 'closed' && activeSession.status !== 'locked') && (
        <>

      {!loggedInPlayer && (
        <div className="glass-panel-dark" style={{ border: '2px solid var(--accent-warning)', background: 'rgba(255,193,7,0.1)' }}>
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

      {loggedInPlayer && (
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
          ) : activeSession.status === 'locked' || activeSession.confirmedIds.length >= 27 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--accent-danger)', fontWeight: 'bold', padding: '1rem', border: '2px dashed var(--accent-danger)', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ fontSize: '1.5rem' }}>¡CUPOS LLENOS! 🚫</div>
              <p style={{ color: 'var(--light-text)', fontWeight: 'normal', fontSize: '1.1rem', margin: 0 }}>
                Ya no entraste en esta convocatoria...<br/>deberías inscribirte más temprano ¡Bolsa! 😂
              </p>
            </div>
          ) : (
            <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '400px' }}>
              <div style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid var(--accent-warning)', padding: '1rem', borderRadius: '8px', color: 'var(--accent-warning)', fontSize: '0.85rem', textAlign: 'center' }}>
                <strong>⚽ OJO CON TU POSICIÓN:</strong> Tu ubicación final (Titular o Alterno) dependerá de tu Estado en la base de datos. ¡Tendrán preferencia los verdaderos elementos que han <strong>"Tomado Biela"</strong> religiosamente! Los que recién asoman, no beben o están castigados irán al fondo de la lista 😂🍻
              </div>
              <button 
                className="btn btn-neon" 
                style={{ fontSize: '1.5rem', padding: '1rem 2rem', width: '100%' }}
                onClick={handleSelfConfirm}
              >
                Confirmar mi Asistencia
              </button>
            </div>
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
          </div>

          <h4 style={{ marginBottom: '1rem', color: 'var(--light-text)' }}>Seleccionar jugador:</h4>
          <form onSubmit={handleConfirmExisting} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <select 
              className="input-dark" 
              style={{ flex: 1, minWidth: '200px' }}
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
            >
              <option value="">Seleccionar jugador existente...</option>
              {allPlayers.filter(p => p.status !== 'injured' && !activeSession?.confirmedIds.includes(p.id)).sort((a,b) => a.firstName.localeCompare(b.firstName)).map(p => (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 className="title-main" style={{ fontSize: '1.3rem', margin: 0 }}>Lista Completa de la Jornada</h2>
            <span style={{ background: 'black', color: 'white', padding: '4px 12px', borderRadius: '100px', fontWeight: 'bold' }}>{confirmedPlayers.length} / 27</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-dark" 
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
              onClick={() => {
                navigator.clipboard.writeText(`¡Es Hora de Jugar! Confirma tu asistencia en La Catedral del Fútbol:\n👉 ${window.location.origin}`);
                alert('¡Link de invitación copiado al portapapeles!');
              }}
            >
              <LinkIcon size={16} /> Compartir
            </button>
            {isAdmin && (
              <button 
                className="btn btn-neon" 
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                onClick={handleExportPDF}
              >
                <FileDown size={16} /> Exportar PDF
              </button>
            )}
          </div>
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
                    <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                       <span style={{ background: isTitular ? 'var(--accent-neon)' : 'var(--accent-danger)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>
                          {isTitular ? 'TITULAR' : 'ALTERNO'}
                       </span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--light-text-muted)' }}><Shield size={12} /> OVR {player.ovr}</span>
                       
                       {player.status === 'frequent' && (
                         <span style={{ background: 'rgba(255,193,7,0.2)', color: 'var(--accent-warning)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           🍻 Toma Biela
                         </span>
                       )}
                       {player.status === 'occasional' && (
                         <span style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--accent-danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           🚫 Castigado / Ocasional
                         </span>
                       )}
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

        {/* Activity Log / Feed */}
        <div className="glass-panel-dark" style={{ background: 'rgba(15,23,42,0.8)' }}>
          <h3 className="title-main" style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--accent-neon)" /> Actividad Reciente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!activityLog || activityLog.length === 0) ? (
              <p style={{ color: 'var(--dark-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No hay actividad reciente en esta jornada.</p>
            ) : (
              activityLog.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--accent-warning)', fontSize: '0.7rem', minWidth: '45px', paddingTop: '2px' }}>{log.time}</div>
                  <div style={{ color: 'var(--light-text)', fontSize: '0.9rem', flex: 1 }}>{log.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

        </>
        )}
      </div>
  );
}
