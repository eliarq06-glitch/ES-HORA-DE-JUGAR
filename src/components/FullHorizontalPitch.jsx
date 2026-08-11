import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

export default function FullHorizontalPitch({ team1, team2, events, selectedPlayerId, onPlayerClick }) {
  const [customPositions, setCustomPositions] = useState({});
  const pitchRef = useRef(null);
  const dragRef = useRef({ isDragging: false, playerId: null, startX: 0, startY: 0, moved: false });

  // Configuración de formaciones base (Filas)
  const getFormation = (count) => {
    switch (count) {
      case 5: return [1, 2, 2];
      case 6: return [1, 2, 1, 2];
      case 7: return [1, 2, 3, 1];
      case 8: return [1, 3, 2, 2];
      case 9: return [1, 3, 3, 2];
      case 10: return [1, 3, 4, 2];
      case 11: return [1, 4, 4, 2];
      default: return [1, Math.floor((count-1)/2), Math.ceil((count-1)/2)];
    }
  };

  const calculatePositions = (players, isRightSide) => {
    const formation = getFormation(players.length);
    let positions = [];
    let playerIndex = 0;
    
    formation.forEach((rowCount, rowIndex) => {
        const distanceFromGoalLine = rowIndex * (35 / (formation.length - 1 || 1)) + 5;
        const colX = isRightSide ? (100 - distanceFromGoalLine) : distanceFromGoalLine;
        
        for (let i = 0; i < rowCount; i++) {
            if (playerIndex >= players.length) break;
            
            const spacing = 100 / (rowCount + 1);
            const rowY = spacing * (i + 1);
            
            positions.push({
                top: `${rowY}%`,
                left: `${colX}%`
            });
            playerIndex++;
        }
    });
    
    return positions;
  };

  // Inicializar posiciones
  useEffect(() => {
    const posT1 = calculatePositions(team1.players, false);
    const posT2 = calculatePositions(team2.players, true);
    
    const initialPos = {};
    team1.players.forEach((p, i) => { initialPos[p.id] = posT1[i]; });
    team2.players.forEach((p, i) => { initialPos[p.id] = posT2[i]; });
    
    setCustomPositions(initialPos);
  }, [team1, team2]);

  const handlePointerDown = (e, playerId) => {
    e.target.setPointerCapture(e.pointerId);
    dragRef.current = {
      isDragging: true,
      playerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    
    const dx = Math.abs(e.clientX - dragRef.current.startX);
    const dy = Math.abs(e.clientY - dragRef.current.startY);
    
    if (dx > 5 || dy > 5) {
      dragRef.current.moved = true;
    }

    if (dragRef.current.moved && pitchRef.current) {
      const rect = pitchRef.current.getBoundingClientRect();
      let left = ((e.clientX - rect.left) / rect.width) * 100;
      let top = ((e.clientY - rect.top) / rect.height) * 100;

      // Restringir bordes
      left = Math.max(2, Math.min(98, left));
      top = Math.max(2, Math.min(98, top));

      setCustomPositions(prev => ({
        ...prev,
        [dragRef.current.playerId]: { left: `${left}%`, top: `${top}%` }
      }));
    }
  };

  const handlePointerUp = (e, p) => {
    if (dragRef.current.isDragging) {
      e.target.releasePointerCapture(e.pointerId);
      
      // Si no se movió (fue un clic real), seleccionamos el jugador
      if (!dragRef.current.moved && onPlayerClick) {
        onPlayerClick(p);
      }
      
      dragRef.current = { isDragging: false, playerId: null, startX: 0, startY: 0, moved: false };
    }
  };

  const renderPlayer = (p, team) => {
    const pos = customPositions[p.id] || { top: '50%', left: '50%' };
    
    const playerEvents = events.filter(e => e.player.id === p.id);
    const goals = playerEvents.filter(e => e.type === 'goal').length;
    const assists = playerEvents.filter(e => e.type === 'assist').length;
    const yellows = playerEvents.filter(e => e.type === 'yellow_card').length;
    const reds = playerEvents.filter(e => e.type === 'red_card').length;

    const baseRating = p.ovr / 10;
    const liveRating = Math.min(10.0, Math.max(3.0, baseRating + (goals * 1.0) + (assists * 0.5) - (yellows * 0.5) - (reds * 1.0))).toFixed(1);
    
    let ratingColor = '#f59e0b';
    if (liveRating >= 7.5) ratingColor = '#10b981';
    if (liveRating < 6.0) ratingColor = '#ef4444';

    const isSelected = selectedPlayerId === p.id;
    const isCaptain = team.captainId === p.id;

    return (
      <div 
        key={p.id} 
        style={{ 
          position: 'absolute', 
          top: pos.top, 
          left: pos.left, 
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'grab',
          transition: dragRef.current.isDragging && dragRef.current.playerId === p.id ? 'none' : 'opacity 0.2s ease',
          zIndex: isSelected ? 10 : (dragRef.current.playerId === p.id ? 20 : 1),
          opacity: reds > 0 ? 0.5 : 1,
          touchAction: 'none' // Prevenir scroll en móviles al arrastrar
        }}
        onPointerDown={(e) => handlePointerDown(e, p.id)}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => handlePointerUp(e, p)}
        onPointerCancel={(e) => handlePointerUp(e, p)}
      >
        <div style={{
          width: isSelected ? '45px' : '40px',
          height: isSelected ? '45px' : '40px',
          borderRadius: '50%',
          background: team.color || '#333',
          border: `3px solid ${isSelected ? 'var(--accent-neon)' : 'white'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'black',
          boxShadow: isSelected ? '0 0 20px var(--accent-neon)' : '0 4px 10px rgba(0,0,0,0.5)',
          position: 'relative',
          pointerEvents: 'none' // Para que el div contenedor reciba los eventos
        }}>
          {p.firstName.charAt(0)}{p.lastName ? p.lastName.charAt(0) : ''}
          
          {isCaptain && (
            <div style={{ position: 'absolute', top: -15, background: 'var(--accent-warning)', color: 'black', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
              C
            </div>
          )}

          <div style={{
            position: 'absolute',
            top: -5,
            right: -15,
            background: ratingColor,
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 4px',
            borderRadius: '6px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {liveRating}
          </div>

          <div style={{ position: 'absolute', bottom: -15, display: 'flex', gap: '2px' }}>
            {goals > 0 && <span style={{ fontSize: '0.8rem' }}>⚽<span style={{ fontSize: '0.6rem', color: 'white' }}>{goals>1?`x${goals}`:''}</span></span>}
            {assists > 0 && <span style={{ fontSize: '0.8rem' }}>👟<span style={{ fontSize: '0.6rem', color: 'white' }}>{assists>1?`x${assists}`:''}</span></span>}
            {yellows > 0 && <div style={{ width: '8px', height: '12px', background: 'yellow', border: '1px solid black', borderRadius: '2px' }}></div>}
            {reds > 0 && <div style={{ width: '8px', height: '12px', background: 'red', border: '1px solid black', borderRadius: '2px' }}></div>}
          </div>
        </div>
        <div style={{
          marginTop: '8px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 6px',
          borderRadius: '4px',
          pointerEvents: 'none'
        }}>
          {p.firstName}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={pitchRef}
      style={{
        width: '100%',
        aspectRatio: '16/9',
        background: 'linear-gradient(to right, #2b8c44, #1a6d30, #2b8c44)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        border: '4px solid #fff',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '2px solid rgba(255,255,255,0.5)' }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '150px', height: '150px', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%' }}></div>
      
      <div style={{ position: 'absolute', top: '20%', bottom: '20%', left: 0, width: '15%', border: '2px solid rgba(255,255,255,0.5)', borderLeft: 'none' }}></div>
      <div style={{ position: 'absolute', top: '35%', bottom: '35%', left: 0, width: '6%', border: '2px solid rgba(255,255,255,0.5)', borderLeft: 'none' }}></div>
      
      <div style={{ position: 'absolute', top: '20%', bottom: '20%', right: 0, width: '15%', border: '2px solid rgba(255,255,255,0.5)', borderRight: 'none' }}></div>
      <div style={{ position: 'absolute', top: '35%', bottom: '35%', right: 0, width: '6%', border: '2px solid rgba(255,255,255,0.5)', borderRight: 'none' }}></div>

      {team1.players.map(p => renderPlayer(p, team1))}
      {team2.players.map(p => renderPlayer(p, team2))}
    </div>
  );
}
