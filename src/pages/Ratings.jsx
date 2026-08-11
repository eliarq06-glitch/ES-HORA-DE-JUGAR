import React, { useState, useEffect } from 'react';
import { Star, Calculator } from 'lucide-react';

export default function Ratings({ players, updatePlayerRating, matchEvents }) {
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (Object.keys(scores).length === 0 && matchEvents && matchEvents.length > 0) {
      calculateAutoRatings();
    }
  }, [players, matchEvents]); // Solo al inicio

  const calculateAutoRatings = () => {
    const newScores = {};
    players.forEach(p => {
      let rating = 6.0; // Base Sofascore
      const events = matchEvents.filter(e => e.player.id === p.id);
      
      events.forEach(e => {
        if (e.type === 'goal') rating += 1.0;
        if (e.type === 'assist') rating += 0.6;
        if (e.type === 'shot_on_target') rating += 0.2;
        if (e.type === 'shot_off_target') rating -= 0.1;
        if (e.type === 'save') rating += 0.5;
        if (e.type === 'interception') rating += 0.2;
        if (e.type === 'foul') rating -= 0.2;
        if (e.type === 'yellow_card') rating -= 0.5;
        if (e.type === 'red_card') rating -= 1.5;
        if (e.type === 'own_goal') rating -= 1.0;
        
        if (e.type === 'goal' && e.details && e.details.includes('Cabeza')) rating += 0.2;
      });

      rating = Math.max(1.0, Math.min(10.0, rating));
      newScores[p.id] = rating.toFixed(1);
    });
    setScores(newScores);
  };

  const handleSave = (playerId) => {
    if (!scores[playerId]) return;
    updatePlayerRating(playerId, parseFloat(scores[playerId]));
    setScores(prev => ({ ...prev, [playerId]: '' }));
    alert('Calificación guardada para el jugador');
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <div className="glass-panel-dark" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star color="var(--accent-warning)" /> Calificaciones (SofaScore)
          </h2>
          <p className="subtitle" style={{ color: 'var(--dark-text-muted)' }}>Cálculo automático basado en el VAR. Puedes modificarlo antes de guardar.</p>
        </div>
        <button className="btn btn-dark" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={calculateAutoRatings}>
          <Calculator size={16} /> Recalcular Auto
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {players.map(p => (
          <div key={p.id} className="glass-panel-dark" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="avatar-placeholder">{p.firstName.charAt(0)}</div>
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>{p.firstName} "{p.nickname}" {p.lastName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>OVR Actual: {p.ovr}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="number" 
                step="0.1" 
                min="1" 
                max="10" 
                className="input-dark" 
                style={{ width: '80px', textAlign: 'center', padding: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-warning)' }} 
                placeholder="6.0"
                value={scores[p.id] || ''}
                onChange={(e) => setScores({ ...scores, [p.id]: e.target.value })}
              />
              <button className="btn btn-warning" style={{ background: 'var(--accent-warning)', color: 'black', padding: '0.5rem 1rem' }} onClick={() => handleSave(p.id)}>
                Guardar
              </button>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div style={{ color: 'var(--dark-text-muted)', textAlign: 'center' }}>No hay jugadores confirmados para calificar.</div>
        )}
      </div>
    </div>
  );
}
