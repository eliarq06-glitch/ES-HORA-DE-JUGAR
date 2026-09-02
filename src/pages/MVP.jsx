import React, { useState } from 'react';
import { Award, ChevronUp, Users, Lock, Share2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function MVP({ isAdmin, historicalTournaments, setHistoricalTournaments, mvpVotes, setMvpVotes, mvpClosed, setMvpClosed }) {
  const [myVoterName, setMyVoterName] = useLocalStorage('ehdj_mvp_my_name', '');

  const lastTournament = historicalTournaments && historicalTournaments.length > 0 ? historicalTournaments[0] : null;

  if (!lastTournament) {
    return (
      <div style={{ width: '100%', maxWidth: '800px', textAlign: 'center', padding: '3rem 1rem' }}>
        <Award size={64} color="var(--dark-text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 className="title-main" style={{ color: 'var(--dark-text-muted)' }}>Aún no hay Jornadas Finalizadas</h2>
        <p>La votación del MVP se abrirá una vez que se finalice una jornada.</p>
      </div>
    );
  }

  // Extraer jugadores y estadísticas del último torneo
  const playersStats = {};
  
  if (lastTournament.matchEvents) {
    lastTournament.matchEvents.forEach(e => {
      const pId = e.player.id;
      if (!playersStats[pId]) {
        playersStats[pId] = { ...e.player, goals: 0, assists: 0 };
      }
      if (e.type === 'goal') playersStats[pId].goals++;
      if (e.type === 'assist') playersStats[pId].assists++;
    });
  }

  // Calculate scores to determine podium
  const podium = Object.values(playersStats).sort((a, b) => {
    const scoreA = (a.goals * 2) + a.assists + (a.ovr * 0.1);
    const scoreB = (b.goals * 2) + b.assists + (b.ovr * 0.1);
    return scoreB - scoreA;
  }).slice(0, 5);

  // Helper to count votes per player
  const getPlayerVotes = (playerId) => {
    let count = 0;
    let voters = [];
    Object.keys(mvpVotes).forEach(voterName => {
      if (mvpVotes[voterName] === playerId) {
        count++;
        voters.push(voterName);
      }
    });
    return { count, voters };
  };

  const handleVote = (playerId) => {
    if (mvpClosed) {
      alert("La votación ya está cerrada.");
      return;
    }

    let name = myVoterName;
    if (!name) {
      name = prompt("Para registrar tu voto y hacerlo transparente, ¿Cuál es tu nombre?");
      if (!name || name.trim() === '') return;
      setMyVoterName(name.trim());
    } else {
      const confirmChange = window.confirm(`Estás votando como "${name}". ¿Continuar?\n\n(Si quieres cambiar de voto, se anulará tu voto anterior).`);
      if (!confirmChange) return;
    }

    setmvpVotes(prev => ({
      ...prev,
      [name.trim()]: playerId
    }));
  };

  const handleChangeIdentity = () => {
    if (mvpClosed) return;
    setMyVoterName('');
  };

  const handleCloseVoting = () => {
    if (window.confirm("¿Seguro que quieres cerrar la votación? Ya nadie podrá votar y se guardará el ganador definitivo en el historial.")) {
      setmvpClosed(true);
      
      // Guardar el ganador en el historial
      const finalPodium = [...podium].sort((a,b) => getPlayerVotes(b.id).count - getPlayerVotes(a.id).count);
      const mvpWinner = finalPodium.length > 0 ? finalPodium[0] : null;
      
      if (mvpWinner && setHistoricalTournaments) {
        const updatedTournaments = [...historicalTournaments];
        updatedTournaments[0] = {
          ...updatedTournaments[0],
          mvpWinner: mvpWinner,
          mvpVotes: mvpVotes
        };
        setHistoricalTournaments(updatedTournaments);
      }
    }
  };

  const handleOpenVoting = () => {
    if (window.confirm("¿Reabrir la votación? Se podrá volver a votar.")) {
      setmvpClosed(false);
      // Remove winner from history temporarily
      if (setHistoricalTournaments) {
        const updatedTournaments = [...historicalTournaments];
        updatedTournaments[0] = {
          ...updatedTournaments[0],
          mvpWinner: null
        };
        setHistoricalTournaments(updatedTournaments);
      }
    }
  };

  const handleResetVotes = () => {
    if (window.confirm("¿Eliminar todos los votos actuales y empezar de cero la votación para esta jornada?")) {
      setmvpVotes({});
      setmvpClosed(false);
    }
  };

  const maxVotes = podium.length > 0 ? Math.max(...podium.map(p => getPlayerVotes(p.id).count)) : 0;
  const sortedPodium = [...podium].sort((a,b) => getPlayerVotes(b.id).count - getPlayerVotes(a.id).count);
  const mvpWinner = sortedPodium.length > 0 ? sortedPodium[0] : null;

  const getShareText = () => {
    let text = mvpClosed ? `🏆 *RESULTADOS FINALES DEL MVP* 🏆\n\n` : `🏆 *VOTACIÓN DEL MVP (EN VIVO)* 🏆\n\n`;
    text += `Jornada: ${lastTournament.sessionName} (${lastTournament.date})\n\n`;
    
    if (mvpClosed && mvpWinner) {
      text += `👑 *EL MVP DE LA JORNADA ES: ${mvpWinner.firstName} "${mvpWinner.nickname}"*\n\n`;
    }

    text += `*Ranking de Votos:*\n`;
    sortedPodium.forEach((p, index) => {
       const v = getPlayerVotes(p.id);
       text += `${index + 1}. ${p.firstName} "${p.nickname}" - ${v.count} votos\n`;
       if (v.voters.length > 0) {
           text += `   🗣️ Votado por: ${v.voters.join(', ')}\n`;
       }
    });
    
    if (!mvpClosed) {
      text += `\nVota aquí: ${window.location.href}`;
    }
    
    return text;
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      
      <div className="glass-panel-light" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
        <button 
          className="btn btn-dark" 
          style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem', border: '1px solid var(--light-glass-border)' }}
          onClick={() => {
            navigator.clipboard.writeText(getShareText());
            alert("¡Resultados copiados! Pégalo en WhatsApp.");
          }}
        >
          <Share2 size={14} style={{ marginRight: '6px' }} /> 
          {mvpClosed ? 'Compartir Resultados' : 'Compartir Votación'}
        </button>
        
        <Award size={48} color={mvpClosed ? "var(--accent-primary)" : "var(--accent-warning)"} style={{ margin: '0 auto 1rem auto' }} />
        <h2 className="title-main" style={{ color: '#000' }}>{mvpClosed ? 'Resultados del MVP' : 'Votación del MVP'}</h2>
        <p className="subtitle" style={{ color: 'var(--light-text-muted)', marginBottom: '0.5rem' }}>{lastTournament.sessionName} ({lastTournament.date})</p>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>Podio de la Jornada (Top 5 Rendimientos)</p>
        
        {!mvpClosed && myVoterName && (
          <div style={{ marginTop: '1rem', display: 'inline-block', background: 'rgba(0,0,0,0.05)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem' }}>
            Votando como: <strong>{myVoterName}</strong> 
            <button className="btn" style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '0.7rem', background: 'white', color: 'black' }} onClick={handleChangeIdentity}>Cambiar</button>
          </div>
        )}

        {mvpClosed && (
          <div style={{ marginTop: '1rem', display: 'inline-block', background: 'var(--accent-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Lock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Votación Cerrada
          </div>
        )}

        {isAdmin && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', borderTop: '1px solid var(--light-glass-border)', paddingTop: '1.5rem' }}>
            {!mvpClosed ? (
              <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={handleCloseVoting}>
                 <Lock size={14} style={{ marginRight: '4px' }} /> Cerrar Votación
              </button>
            ) : (
              <button className="btn btn-dark" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={handleOpenVoting}>
                 Reabrir Votación
              </button>
            )}
            
            <button className="btn btn-dark" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(255,0,0,0.1)', color: 'red' }} onClick={handleResetVotes}>
               Limpiar Todos los Votos
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {sortedPodium.map((player, index) => {
          const { count, voters } = getPlayerVotes(player.id);
          const percentage = maxVotes === 0 ? 0 : (count / maxVotes) * 100;
          const iVotedForThis = myVoterName && mvpVotes[myVoterName] === player.id;
          
          return (
            <div key={player.id} className="glass-panel-light" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', border: iVotedForThis && !mvpClosed ? '2px solid var(--accent-warning)' : (index === 0 && mvpClosed ? '2px solid var(--accent-primary)' : '1px solid var(--light-glass-border)') }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percentage}%`, background: index === 0 && maxVotes > 0 ? (mvpClosed ? 'rgba(79, 70, 229, 0.1)' : 'rgba(245, 158, 11, 0.2)') : 'rgba(0,0,0,0.03)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 0 }}></div>

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--light-text-muted)', width: '30px' }}>#{index + 1}</div>
                  <div className="avatar-placeholder" style={{ background: index === 0 && maxVotes > 0 ? (mvpClosed ? 'var(--accent-primary)' : 'var(--accent-warning)') : 'var(--accent-neon)' }}>
                    {player.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: index === 0 && mvpClosed ? 'var(--accent-primary)' : '#000' }}>
                      {player.firstName} "{player.nickname}" {player.lastName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--light-text-muted)', marginTop: '4px' }}>
                      ⚽ {player.goals} Goles | 👟 {player.assists} Asist. | OVR {player.ovr}
                    </div>
                    {voters.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} /> {voters.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{count}</div>
                  </div>
                  
                  {!mvpClosed && (
                    <button className="btn" style={{ background: iVotedForThis ? 'var(--accent-warning)' : 'black', color: iVotedForThis ? 'black' : 'white', padding: '0.75rem' }} onClick={() => handleVote(player.id)}>
                      <ChevronUp size={24} /> {iVotedForThis ? 'TU VOTO' : 'VOTAR'}
                    </button>
                  )}
                  {mvpClosed && index === 0 && maxVotes > 0 && (
                     <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                       <Award size={32} />
                     </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {podium.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.8)', borderRadius: '16px' }}>
            Aún no hay suficientes datos para armar el podio de esta jornada.
          </div>
        )}
      </div>
    </div>
  );
}
