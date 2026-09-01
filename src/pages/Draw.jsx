import React, { useState, useEffect } from 'react';
import { Users, Shuffle, Star, Settings2, Trash2, GripHorizontal, Crown } from 'lucide-react';
import { getCaptainImage } from '../utils/captains';

export default function Draw({ players, teams, setTeams }) {
  const [numTeams, setNumTeams] = useState(4);
  const [captains, setCaptains] = useState({});
  const [draftMode, setDraftMode] = useState('auto'); // 'auto' or 'manual'

  useEffect(() => {
    if (teams.length !== numTeams) {
      const initialTeams = Array.from({ length: numTeams }, (_, i) => ({
        id: i,
        name: `Equipo ${String.fromCharCode(65 + i)}`,
        players: []
      }));
      setTeams(initialTeams);
    }
  }, [numTeams, setTeams, teams.length]);

  const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const getAvailablePlayers = () => {
    const allAssignedIds = [];
    teams.forEach(t => t.players.forEach(p => {
       if(!allAssignedIds.includes(p.id)) allAssignedIds.push(p.id);
    }));
    return players.filter(p => !allAssignedIds.includes(p.id));
  };

  const handleDrawAuto = () => {
    // Verificar que cada equipo tenga al menos un capitán
    let missingCaptains = false;
    teams.forEach((t, idx) => {
      if (!captains[idx] || captains[idx].length === 0) {
        missingCaptains = true;
      }
    });

    if (missingCaptains) {
      alert("⚠️ Debes elegir al menos un capitán (👑) para cada equipo antes de realizar el sorteo automático.");
      return;
    }

    const availablePlayers = getAvailablePlayers();
    const grouped = { 5: [], 4: [], 3: [], 2: [], 1: [] };
    availablePlayers.forEach(p => grouped[p.stars].push(p));

    let newTeams = teams.map((team) => {
      return { ...team, players: [...team.players] };
    });

    [5, 4, 3, 2, 1].forEach(starLevel => {
      const group = shuffleArray(grouped[starLevel]);
      group.forEach(player => {
        const minPlayers = Math.min(...newTeams.map(t => t.players.length));
        const eligibleTeams = newTeams.map((t, idx) => ({ t, idx })).filter(item => item.t.players.length === minPlayers);
        const selectedTeam = eligibleTeams[0];
        newTeams[selectedTeam.idx].players.push(player);
      });
    });
    setTeams(newTeams);
  };

  const toggleCaptain = (playerId, teamIndex) => {
    let newCaptains;
    setCaptains(prev => {
      const newCaps = { ...prev };
      Object.keys(newCaps).forEach(key => {
        if (parseInt(key) !== teamIndex) {
            newCaps[key] = newCaps[key].filter(id => id !== playerId);
        }
      });

      if (!newCaps[teamIndex]) newCaps[teamIndex] = [];
      
      if (newCaps[teamIndex].includes(playerId)) {
        newCaps[teamIndex] = newCaps[teamIndex].filter(id => id !== playerId);
      } else {
        newCaps[teamIndex] = [playerId]; // Solo permitimos 1 capitán oficial visualmente
      }
      newCaptains = newCaps;
      return newCaps;
    });

    // Update team name based on the new captain
    setTimeout(() => {
       const newTeams = [...teams];
       const caps = newCaptains[teamIndex];
       if (caps && caps.length > 0) {
           const capPlayer = players.find(p => p.id === caps[0]);
           if (capPlayer) {
               newTeams[teamIndex].name = `Team ${capPlayer.firstName}`;
               newTeams[teamIndex].captainId = capPlayer.id;
           }
       } else {
           newTeams[teamIndex].name = `Equipo ${String.fromCharCode(65 + teamIndex)}`;
           newTeams[teamIndex].captainId = null;
       }
       setTeams(newTeams);
    }, 0);
  };

  const assignPlayerManual = (player, teamIndex) => {
    const newTeams = [...teams];
    if(!newTeams[teamIndex].players.find(p => p.id === player.id)) {
        newTeams[teamIndex].players.push(player);
        setTeams(newTeams);
    }
  };

  const removePlayerManual = (playerId, teamIndex) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players = newTeams[teamIndex].players.filter(p => p.id !== playerId);
    setTeams(newTeams);
    if((captains[teamIndex] || []).includes(playerId)) {
        setCaptains(prev => ({...prev, [teamIndex]: prev[teamIndex].filter(id => id !== playerId)}));
    }
  };

  const resetTeams = () => {
    if(window.confirm('¿Limpiar los equipos formados? (Se conservan los capitanes en sus equipos)')) {
        let newTeams = teams.map((team, index) => {
          const teamCaps = (captains[index] || []).map(id => players.find(p => p.id === id));
          // Filter out undefined in case of inconsistency
          return { ...team, players: teamCaps.filter(p => p) };
        });
        setTeams(newTeams);
    }
  };

  // --- DRAG AND DROP LOGIC ---
  const handleDragStart = (e, playerId, sourceTeamIndex) => {
    e.dataTransfer.setData('playerId', playerId);
    e.dataTransfer.setData('sourceTeamIndex', sourceTeamIndex);
  };

  const handleDrop = (e, targetTeamIndex) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    const sourceTeamIndex = e.dataTransfer.getData('sourceTeamIndex');
    
    if (!playerId) return;
    const pId = parseInt(playerId);
    const newTeams = [...teams];

    if (sourceTeamIndex === 'available') {
        const playerToMove = players.find(p => p.id === pId);
        if(playerToMove && !newTeams[targetTeamIndex].players.find(p=>p.id===pId)) {
             newTeams[targetTeamIndex].players.push(playerToMove);
             setTeams(newTeams);
        }
    } else {
        const sIdx = parseInt(sourceTeamIndex);
        if (sIdx === targetTeamIndex) return;

        const playerToMove = newTeams[sIdx].players.find(p => p.id === pId);
        if (playerToMove) {
            newTeams[sIdx].players = newTeams[sIdx].players.filter(p => p.id !== pId);
            newTeams[targetTeamIndex].players.push(playerToMove);
            setTeams(newTeams);
            
            if ((captains[sIdx] || []).includes(pId)) {
                setCaptains(prev => ({...prev, [sIdx]: prev[sIdx].filter(id => id !== pId)}));
            }
        }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const available = getAvailablePlayers();

  return (
    <div style={{ width: '100%', maxWidth: '1400px' }}>
      <div className="glass-panel-dark" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings2 color="var(--accent-neon)" /> Configuración
            </h2>
            <p className="subtitle" style={{ color: 'var(--dark-text-muted)' }}>Sorteo y balanceo</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Número de Equipos</label>
              <select className="input-dark" value={numTeams} onChange={(e) => setNumTeams(Number(e.target.value))} style={{ width: '150px' }}>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Equipos</option>)}
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label>Modo de Asignación</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={`btn ${draftMode === 'auto' ? 'btn-neon' : 'btn-dark'}`} onClick={() => setDraftMode('auto')} style={{ padding: '0.5rem 1rem' }}>
                  Aleatorio
                </button>
                <button className={`btn ${draftMode === 'manual' ? 'btn-neon' : 'btn-dark'}`} onClick={() => setDraftMode('manual')} style={{ padding: '0.5rem 1rem' }}>
                  Manual
                </button>
              </div>
            </div>

            {draftMode === 'auto' && (
                <button className="btn btn-neon" style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem' }} onClick={handleDrawAuto}>
                  <Shuffle size={20} /> BALANCEAR AUTO
                </button>
            )}
            <button className="btn btn-danger" style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem', background: 'transparent' }} onClick={resetTeams}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`, 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        {teams.map((team, index) => {
          let bgImage = 'var(--dark-glass)';
          let capPlayer = null;
          const caps = captains[index] || [];
          if (caps.length > 0) {
              capPlayer = players.find(p => p.id === caps[0]);
              if (capPlayer) {
                  const epicImage = getCaptainImage(capPlayer.firstName);
                  if (epicImage) {
                      bgImage = `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 1)), url('${epicImage}')`;
                  }
              }
          }

          return (
          <div 
            key={team.id} 
            className="glass-panel-dark" 
            style={{ 
              padding: '1rem', 
              border: capPlayer ? '2px solid var(--accent-neon)' : '2px solid transparent', 
              transition: 'border 0.2s',
              background: bgImage,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              position: 'relative',
              overflow: 'hidden'
            }}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
          >
            <input className="input-dark" value={team.name}
              onChange={(e) => {
                const newTeams = [...teams];
                newTeams[index].name = e.target.value;
                setTeams(newTeams);
              }}
              style={{ fontSize: '1.4rem', fontWeight: '900', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', textAlign: 'center', background: 'rgba(0,0,0,0.5)', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.1)', width: '100%', padding: '0.5rem', marginBottom: '1rem', color: capPlayer ? 'var(--accent-neon)' : 'white' }}
            />

            <div style={{ minHeight: '200px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
                <h4 className="subtitle" style={{ fontSize: '0.75rem', color: 'white' }}>Plantilla Actual</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-neon)' }}>{team.players.length} J.</span>
              </div>
              
              {team.players.map(p => {
                const isCaptain = (captains[index] || []).includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, p.id, index)}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '0.5rem', 
                      borderLeft: isCaptain ? '4px solid var(--accent-neon)' : '4px solid transparent',
                      cursor: 'grab'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GripHorizontal size={14} color="var(--dark-text-muted)" style={{ cursor: 'grab' }} />
                      <div className="avatar-placeholder" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>{p.firstName.charAt(0)}</div>
                      <div>
                        <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1, fontSize: '0.85rem' }}>
                          {p.firstName} {p.lastName.substring(0,1)}.
                        </span>
                        {p.nickname && <span style={{ color: 'var(--accent-warning)', fontSize: '0.65rem' }}>"{p.nickname}"</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '2px', background: 'transparent', color: isCaptain ? 'var(--accent-neon)' : 'var(--dark-text-muted)' }} 
                        onClick={() => toggleCaptain(p.id, index)}
                        title={isCaptain ? "Quitar cinta de capitán" : "Hacer capitán"}
                      >
                        <Crown size={16} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent-warning)', marginLeft: '4px' }}>
                        <Star size={12} fill="var(--accent-warning)" /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{p.stars}</span>
                      </div>
                      {draftMode === 'manual' && !isCaptain && (
                        <button className="btn" style={{ padding: '2px', background: 'transparent', color: 'var(--accent-danger)' }} onClick={() => removePlayerManual(p.id, index)}>
                           <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              
              <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: 'var(--dark-text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                 Arrastra jugadores aquí
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {available.length > 0 && (
        <div className="glass-panel-dark" style={{ border: '2px solid var(--accent-neon)' }}>
           <h3 className="title-main" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-neon)' }}>Jugadores Disponibles ({available.length})</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {available.sort((a,b) => b.ovr - a.ovr).map(p => (
                 <div 
                   key={p.id} 
                   draggable={true}
                   onDragStart={(e) => handleDragStart(e, p.id, 'available')}
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', cursor: 'grab' }}
                 >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripHorizontal size={14} color="var(--dark-text-muted)" />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{p.firstName} {p.lastName.substring(0,1)}.</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-warning)' }}>OVR: {p.ovr}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                       {teams.map((t, idx) => (
                         <button key={t.id} className="btn btn-dark" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => assignPlayerManual(p, idx)} title={`Asignar a ${t.name}`}>
                            {String.fromCharCode(65 + idx)}
                         </button>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
