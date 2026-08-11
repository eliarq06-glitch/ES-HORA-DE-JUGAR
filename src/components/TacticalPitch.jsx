import React from 'react';
import { Star } from 'lucide-react';

export default function TacticalPitch({ team, events, selectedPlayerId, onPlayerClick }) {
  // Configuración de formaciones base (Filas de abajo hacia arriba)
  // Ej: Para 5 jugadores -> [1 (GK), 2 (DEF), 2 (FWD)]
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

  const calculatePositions = (players) => {
    const formation = getFormation(players.length);
    let positions = [];
    let playerIndex = 0;
    
    formation.forEach((rowCount, rowIndex) => {
        const rowY = 90 - (rowIndex * (75 / (formation.length - 1 || 1))); // De 90% (GK) a 15% (DEL)
        
        for (let i = 0; i < rowCount; i++) {
            if (playerIndex >= players.length) break;
            
            // Distribuir equitativamente en X
            const spacing = 100 / (rowCount + 1);
            const colX = spacing * (i + 1);
            
            positions.push({
                top: `${rowY}%`,
                left: `${colX}%`
            });
            playerIndex++;
        }
    });
    
    return positions;
  };

  const positions = calculatePositions(team.players);

  return (
    <div style={{
      width: '100%',
      aspectRatio: '3/4',
      background: 'linear-gradient(to bottom, #2b8c44, #1a6d30)',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      border: '4px solid #fff',
      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
    }}>
      {/* Líneas de la cancha */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '2px solid rgba(255,255,255,0.5)' }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '15%', border: '2px solid rgba(255,255,255,0.5)', borderTop: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '15%', border: '2px solid rgba(255,255,255,0.5)', borderBottom: 'none' }}></div>
      <div style={{ position: 'absolute', top: 0, left: '35%', right: '35%', height: '6%', border: '2px solid rgba(255,255,255,0.5)', borderTop: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: '35%', right: '35%', height: '6%', border: '2px solid rgba(255,255,255,0.5)', borderBottom: 'none' }}></div>

      {/* Jugadores */}
      {team.players.map((p, index) => {
        const playerEvents = events.filter(e => e.player.id === p.id);
        const goals = playerEvents.filter(e => e.type === 'goal').length;
        const assists = playerEvents.filter(e => e.type === 'assist').length;
        const yellows = playerEvents.filter(e => e.type === 'yellow_card').length;
        const reds = playerEvents.filter(e => e.type === 'red_card').length;

        // Sofascore calculation
        const baseRating = p.ovr / 10;
        const liveRating = Math.min(10.0, Math.max(3.0, baseRating + (goals * 1.0) + (assists * 0.5) - (yellows * 0.5) - (reds * 1.0))).toFixed(1);
        
        let ratingColor = '#f59e0b'; // Amarillo
        if (liveRating >= 7.5) ratingColor = '#10b981'; // Verde
        if (liveRating < 6.0) ratingColor = '#ef4444'; // Rojo

        const isSelected = selectedPlayerId === p.id;
        const isCaptain = team.captainId === p.id;

        return (
          <div 
            key={p.id} 
            style={{ 
              position: 'absolute', 
              top: positions[index]?.top || '50%', 
              left: positions[index]?.left || '50%', 
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: onPlayerClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              zIndex: isSelected ? 10 : 1,
              opacity: reds > 0 ? 0.5 : 1
            }}
            onClick={() => onPlayerClick && onPlayerClick(p)}
          >
            {/* Camiseta / Avatar */}
            <div style={{ position: 'relative' }}>
               <div style={{
                 width: '40px',
                 height: '40px',
                 borderRadius: '50%',
                 background: isSelected ? 'var(--accent-primary)' : 'white',
                 border: isSelected ? '2px solid white' : '2px solid #ccc',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                 color: isSelected ? 'white' : 'black',
                 fontWeight: 'bold'
               }}>
                 {p.firstName.charAt(0)}{p.lastName.charAt(0)}
               </div>

               {/* Calificación Sofascore Flotante */}
               <div style={{
                 position: 'absolute',
                 top: '-10px',
                 right: '-15px',
                 background: ratingColor,
                 color: 'white',
                 fontSize: '0.7rem',
                 fontWeight: 'bold',
                 padding: '2px 6px',
                 borderRadius: '10px',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
               }}>
                 {liveRating}
               </div>

               {/* Iconos de Eventos */}
               <div style={{ position: 'absolute', bottom: '-5px', right: '-15px', display: 'flex', gap: '2px' }}>
                 {Array.from({ length: goals }).map((_, i) => <span key={`g${i}`} style={{ fontSize: '0.8rem', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>⚽</span>)}
                 {Array.from({ length: yellows }).map((_, i) => <span key={`y${i}`} style={{ fontSize: '0.8rem', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>🟨</span>)}
                 {Array.from({ length: reds }).map((_, i) => <span key={`r${i}`} style={{ fontSize: '0.8rem', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>🟥</span>)}
               </div>
            </div>

            {/* Nombre */}
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '2px 6px',
              borderRadius: '4px',
              marginTop: '8px',
              whiteSpace: 'nowrap',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isCaptain && <div style={{ background: 'white', color: 'black', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 'bold' }}>C</div>}
              {p.firstName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
