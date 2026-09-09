import React, { useState, useMemo } from 'react';
import { Star, Shield, Zap, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useSupabaseConfig } from '../hooks/useSupabase';

const getCardTheme = (player) => {
  const stars = player.stars || 3;
  let ct = player.cardType || 'default';
  if (ct === 'default') {
    if (stars >= 5) ct = 'white';
    else if (stars === 4) ct = 'blue';
    else if (stars === 3) ct = 'black';
    else if (stars === 2) ct = 'gold';
    else ct = 'bronze';
  }
  return ct;
};

const getOvr = (player) => Math.round((player.stars || 3) / 5 * 99) || 50;

const CARD_LABELS = { white: 'Blanca (Icon)', blue: 'Azul (Ultimate)', black: 'Negra (TOTW)', gold: 'Oro (Rare)', bronze: 'Bronce' };

export default function Players({ players }) {
  const [sponsorsConfig] = useSupabaseConfig('sponsors', []);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCard, setFilterCard] = useState('all');
  const [filterPos, setFilterPos] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const allPositions = useMemo(() => [...new Set(players.map(p => p.position || 'MCO'))].sort(), [players]);

  const filteredPlayers = useMemo(() => {
    let list = [...players];

    // Search
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      list = list.filter(p => {
        const full = `${p.firstName} ${p.lastName} ${p.nickname || ''}`.toLowerCase();
        return full.includes(q);
      });
    }

    // Filter by card type
    if (filterCard !== 'all') {
      list = list.filter(p => getCardTheme(p) === filterCard);
    }

    // Filter by position
    if (filterPos !== 'all') {
      list = list.filter(p => (p.position || 'MCO') === filterPos);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name') return a.firstName.localeCompare(b.firstName);
      if (sortBy === 'ovr_desc') return getOvr(b) - getOvr(a);
      if (sortBy === 'ovr_asc') return getOvr(a) - getOvr(b);
      if (sortBy === 'goals') return (b.historicalGoals || 0) - (a.historicalGoals || 0);
      if (sortBy === 'assists') return (b.historicalAssists || 0) - (a.historicalAssists || 0);
      if (sortBy === 'championships') return (b.historicalChampionships || 0) - (a.historicalChampionships || 0);
      if (sortBy === 'stars_desc') return (b.stars || 3) - (a.stars || 3);
      return 0;
    });

    return list;
  }, [players, searchText, filterCard, filterPos, sortBy]);

  // Suggestions for smart search
  const suggestions = useMemo(() => {
    if (searchText.trim().length < 2) return [];
    const q = searchText.toLowerCase().trim();
    return players
      .filter(p => `${p.firstName} ${p.lastName} ${p.nickname || ''}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({ id: p.id, label: `${p.firstName} ${p.lastName}${p.nickname ? ` "${p.nickname}"` : ''}` }));
  }, [players, searchText]);

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="title-main" style={{ color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>PLANTILLA OFICIAL</h2>
        <p className="subtitle" style={{ color: 'var(--accent-neon)' }}>Temporada Actual</p>
      </div>

      <div className="glass-panel-dark" style={{ marginBottom: '3rem', padding: '1.5rem', border: '1px solid rgba(204, 255, 0, 0.2)' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-neon)' }}>
          <Zap size={20} /> Guía del Ranking y Cartas
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <strong>OVR (Nivel General):</strong> Va del 1 al 99. Sube o baja dependiendo de tu rendimiento en la cancha. Al final de cada jornada cerrada, el administrador asigna estrellas (1 a 5) en base a la votación del equipo. Mientras mejores notas saques consistentemente, más alto será tu OVR. ¡A esforzarse en la cancha!
          </li>
          <li>
            <strong>Bombos (Grupos de Sorteo):</strong> Aseguran que los equipos queden equilibrados. El <strong>Bombo 1 (5 Estrellas)</strong> agrupa a los jugadores de élite, y así sucesivamente hasta el <strong>Bombo 5 (1 Estrella)</strong>. ¡Juega bien en los partidos, gana el MVP, y subirás de Bombo y de OVR!
          </li>
          <li>
            <strong>Significado de los Colores (Cartas):</strong> El color de tu carta refleja tu clasificación de Bombo actual:
            <ul style={{ marginTop: '0.5rem', listStyleType: 'circle', paddingLeft: '1.5rem', color: 'var(--dark-text-muted)' }}>
              <li><strong style={{ color: 'white' }}>Carta Blanca (Icon):</strong> Exclusiva para el Bombo 1 (Élite).</li>
              <li><strong style={{ color: '#00ccff' }}>Carta Azul (Ultimate):</strong> Exclusiva para el Bombo 2.</li>
              <li><strong style={{ color: '#a0a0a0' }}>Carta Negra (TOTW):</strong> Exclusiva para el Bombo 3.</li>
              <li><strong style={{ color: '#ffd700' }}>Carta Oro (Rare):</strong> Exclusiva para el Bombo 4.</li>
              <li><strong style={{ color: '#cd7f32' }}>Carta Bronce:</strong> Asignada al Bombo 5.</li>
            </ul>
          </li>
          <li>
            <strong>Goles y Asistencias:</strong> Se suman automáticamente de todas las jornadas oficiales gracias a los registros del VAR en vivo. ¡Cada estadística cuenta para la gala de premios de fin de año!
          </li>
        </ul>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel-dark" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        {/* Search with suggestions */}
        <div style={{ position: 'relative', marginBottom: showFilters ? '1rem' : 0 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-text-muted)' }} />
              <input
                className="input-dark"
                placeholder="Buscar jugador por nombre o apodo..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--dark-bg)', border: '1px solid var(--dark-glass-border)', borderRadius: '8px', zIndex: 50, marginTop: '4px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                  {suggestions.map(s => (
                    <div key={s.id} style={{ padding: '10px 14px', cursor: 'pointer', color: 'white', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onClick={() => { setSearchText(s.label); }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-dark" style={{ padding: '0.6rem 1rem', border: '1px solid var(--dark-glass-border)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} /> Filtros
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Tipo de Carta</label>
              <select className="input-dark" value={filterCard} onChange={(e) => setFilterCard(e.target.value)} style={{ padding: '0.5rem' }}>
                <option value="all">Todas</option>
                <option value="white">⚪ Blanca (Icon) – Bombo 1</option>
                <option value="blue">🔵 Azul (Ultimate) – Bombo 2</option>
                <option value="black">⚫ Negra (TOTW) – Bombo 3</option>
                <option value="gold">🟡 Oro (Rare) – Bombo 4</option>
                <option value="bronze">🟤 Bronce – Bombo 5</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Posición</label>
              <select className="input-dark" value={filterPos} onChange={(e) => setFilterPos(e.target.value)} style={{ padding: '0.5rem' }}>
                <option value="all">Todas</option>
                {allPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Ordenar por</label>
              <select className="input-dark" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem' }}>
                <option value="name">Nombre (A–Z)</option>
                <option value="ovr_desc">OVR (Mayor a Menor)</option>
                <option value="ovr_asc">OVR (Menor a Mayor)</option>
                <option value="stars_desc">Estrellas (Mayor)</option>
                <option value="goals">Más Goles</option>
                <option value="assists">Más Asistencias</option>
                <option value="championships">Más Campeonatos</option>
              </select>
            </div>
            {(filterCard !== 'all' || filterPos !== 'all' || searchText) && (
              <button className="btn" style={{ background: 'var(--accent-danger)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '16px' }}
                onClick={() => { setFilterCard('all'); setFilterPos('all'); setSearchText(''); setSortBy('name'); }}>
                Limpiar Filtros
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>
          Mostrando {filteredPlayers.length} de {players.length} jugadores
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', padding: '1rem' }}>
        {filteredPlayers.map((player) => {
          const stars = player.stars || 3;
          let cardTheme = player.cardType || 'default';
          
          if (cardTheme === 'default') {
            if (stars >= 5) cardTheme = 'white';
            else if (stars === 4) cardTheme = 'blue';
            else if (stars === 3) cardTheme = 'black';
            else if (stars === 2) cardTheme = 'gold';
            else cardTheme = 'bronze';
          }

          let bgImage = `/cards/${cardTheme}.png`;
          let textColor = '#3b2511';
          let maskGradient = 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.95))';
          
          if (cardTheme === 'white') {
            textColor = '#333333';
            maskGradient = 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,1))';
          } else if (cardTheme === 'blue') {
            textColor = '#e8c678';
            maskGradient = 'linear-gradient(to bottom, rgba(15,24,71,0.8), rgba(10,15,40,0.95))';
          } else if (cardTheme === 'black') {
            textColor = '#cccccc';
            maskGradient = 'linear-gradient(to bottom, rgba(30,30,30,0.8), rgba(10,10,10,0.95))';
          } else if (cardTheme === 'gold') {
            textColor = '#4a3810';
            maskGradient = 'linear-gradient(to bottom, rgba(220,180,80,0.8), rgba(200,160,60,0.95))';
          } else if (cardTheme === 'bronze') {
            textColor = '#4a2511';
            maskGradient = 'linear-gradient(to bottom, rgba(150,80,40,0.8), rgba(100,50,20,0.95))';
          }

          const extraStyle = {};

          const ovr = Math.round((player.stars / 5) * 99) || 50;
          const pos = player.position || 'MCO';
          
          const base = ovr - 5;
          const getStat = (offset) => Math.min(99, Math.max(1, base + offset));
          
          let pac=base, sho=base, pas=base, dri=base, def=base, phy=base;
          if(pos==='DEL' || pos==='DC' || pos==='EI' || pos==='ED') { pac=getStat(8); sho=getStat(10); dri=getStat(5); def=getStat(-20); }
          else if(pos==='MCO' || pos==='MC' || pos==='MI' || pos==='MD') { pas=getStat(10); dri=getStat(8); sho=getStat(5); def=getStat(-5); }
          else if(pos==='MCD' || pos==='DEF' || pos==='DFC' || pos==='LI' || pos==='LD') { def=getStat(12); phy=getStat(10); pac=getStat(-5); sho=getStat(-15); }
          else if(pos==='POR' || pos==='PO') { pac=getStat(-10); sho=getStat(-20); pas=getStat(5); dri=getStat(15); def=getStat(5); phy=getStat(5); }
          
          const fullName = `${player.firstName} ${player.lastName}`.trim();
          const nameLen = fullName.length;
          let nameFontSize = 'clamp(0.9rem, 4vw, 1.3rem)';
          if (nameLen > 18) nameFontSize = 'clamp(0.65rem, 2.5vw, 0.9rem)';
          else if (nameLen > 14) nameFontSize = 'clamp(0.75rem, 3vw, 1.05rem)';

          return (
          <div 
            key={player.id} 
            className="fifa-card" 
            onClick={() => setSelectedPlayer(player)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', zIndex: 1, ...extraStyle }}></div>
            {/* Eraser Overlay for baked-in text */}
            <div style={{ position: 'absolute', top: '48%', left: '10%', width: '80%', height: '45%', background: maskGradient, backdropFilter: 'blur(4px)', borderRadius: '10px', zIndex: 1 }}></div>

            <div className="fifa-card-content" style={{ zIndex: 2 }}>
              
              {/* Top Left OVR & Position */}
              <div className="fifa-card-top-left" style={{ color: textColor }}>
                <div className="fifa-card-ovr-new">{ovr}</div>
                <div className="fifa-card-pos-new">{pos}</div>
                <img src="https://flagcdn.com/w40/ec.png" alt="Ecuador" className="fifa-card-flag" />
              </div>

              {/* Player Image */}
              <div className="fifa-card-image-new">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.firstName} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: textColor, fontWeight: 'bold' }}>
                    {player.firstName[0]}
                  </div>
                )}
              </div>

              {/* Name & Stats */}
              <div className="fifa-card-bottom-new">
                <div className="fifa-card-name-new" style={{ fontSize: nameFontSize, color: cardTheme === 'white' ? '#222' : 'white', textShadow: cardTheme === 'white' ? 'none' : '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {fullName}
                </div>
                
                {/* Stats Grid */}
                <div className="fifa-card-stats-grid" style={{ color: textColor, textShadow: cardTheme === 'white' ? 'none' : '0 1px 3px rgba(0,0,0,0.8)' }}>
                  <div className="stat-col">
                    <div className="stat-row"><span>{pac}</span> <span>RIT</span></div>
                    <div className="stat-row"><span>{sho}</span> <span>TIR</span></div>
                    <div className="stat-row"><span>{pas}</span> <span>PAS</span></div>
                  </div>
                  <div className="stat-divider" style={{ background: textColor }}></div>
                  <div className="stat-col">
                    <div className="stat-row"><span>{dri}</span> <span>REG</span></div>
                    <div className="stat-row"><span>{def}</span> <span>DEF</span></div>
                    <div className="stat-row"><span>{phy}</span> <span>FÍS</span></div>
                  </div>
                </div>

                {/* Real App Stats (Goals, Assists, Camp) at very bottom as a pill or removed? 
                    User asked to replace stats with the FIFA layout. I will add the real app stats as a small pill at the bottom so they don't lose that data. */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '5px', fontSize: '0.65rem', color: textColor, opacity: 0.8, fontWeight: 'bold' }}>
                    <span>{player.historicalGoals || 0} G</span>
                    <span>{player.historicalAssists || 0} A</span>
                    {(player.historicalChampionships || 0) > 0 && (
                      <span style={{ display: 'flex', gap: '2px', alignItems: 'center', color: '#ffb300' }}>
                        {Array.from({ length: player.historicalChampionships }).map((_, i) => (
                          <Star key={i} size={10} fill="#ffb300" />
                        ))}
                      </span>
                    )}
                  </div>

              </div>
              
            </div>
          </div>
          );
        })}
      </div>

      {/* ═══════════════ CAPTAINS SECTION ═══════════════ */}
      <div style={{ marginTop: '4rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
        
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '3rem 2rem', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '4px', fontSize: '2.5rem', fontWeight: '900', color: '#e1c16e', textShadow: '0 4px 20px rgba(225,193,110,0.3)' }}>
            ⚽ LOS CAPITANES ⚽
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Los pilares de La Catedral del Fútbol</p>
        </div>

        {/* C1 — FABRICIO SÁNCHEZ (Negro) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          <div style={{ flex: '1 1 300px', minHeight: '400px' }}>
            <img src="/captains/fabricio.jpg" alt="Fabricio Sánchez" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: '1 1 300px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ background: '#e1c16e', color: 'black', padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>C1</span>
              <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#e1c16e', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>FABRICIO SÁNCHEZ</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem', letterSpacing: '1px' }}>🎙️ Voz engolada, con pausas dramáticas y arrastrando las 'rr'</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
              "¡Atención, Ecuador! ¡Aquí está Fabricio Sánchez, señoras y señores! No es un simple mortal, ¡es <strong style={{ color: '#e1c16e' }}>'RAUNALDO'</strong>, el titán que viste la túnica de la noche! Es el <strong style={{ color: '#e1c16e' }}>'Artillero del Gol'</strong>, poseedor de una paciencia inquebrantable, una fe que mueve montañas. ¿Y qué si de cien intentos, la pelota solo besa la red una vez? <strong style={{ color: '#e1c16e' }}>¡Ese único grito sagrado vale por una epopeya entera!</strong> Porque cuando 'Raunaldo' la emboca, no es un gol cualquiera, ¡es un <strong style={{ color: '#e1c16e' }}>GOL CON BIGOTE!</strong> Un grito con jerarquía, un testarazo al destino que lleva la estampa de la virilidad balompédica. Moldeado en el crisol del sufrimiento y la disciplina por el <strong style={{ color: '#e1c16e' }}>Profe Dave</strong> —ese escultor de músculos y voluntades—, y bendecido por los lazos sagrados de la administración. Fabricio Sánchez, <strong style={{ color: '#e1c16e' }}>¡UNA LEYENDA QUE SE ESCRIBE GOL A GOL, AUNQUE EL CAMINO SEA LARGO!</strong>"
            </p>
          </div>
        </div>

        {/* C2 — SANTIAGO ICAZA (Verde) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1 1 300px', minHeight: '400px' }}>
            <img src="/captains/santiago.jpg" alt="Santiago Icaza" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: '1 1 300px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ background: '#e1c16e', color: 'black', padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>C2</span>
              <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#e1c16e', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>SANTIAGO ICAZA</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem', letterSpacing: '1px' }}>🎙️ Tono solemne, reverente, casi poético</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
              "¡Pónganse de pie para recibir a Santiago Icaza! Envuélvete, cantera, en el manto verde de la esperanza, porque aquí camina <strong style={{ color: '#e1c16e' }}>'El Santi'</strong>. No busquen simplemente a un futbolista; busquen al <strong style={{ color: '#e1c16e' }}>CAPITÁN POR EXCELENCIA</strong>. Un señor, un lord de la cancha, un caballero que trata a la pelota con la dulzura de un primer amor y al rival con el respeto de un viejo amigo. Icaza es el faro en la tormenta, la palabra calma en la batalla. De sus labios brotó la sentencia más noble, el himno de los soñadores: <strong style={{ color: '#e1c16e' }}>'AUNQUE SEAMOS MALITOS, AQUÍ VENIMOS TODOS A DESESTRESARNOS'</strong>. ¡Qué frase, Dios mío, qué declaración de amor puro al juego! Es entender que la victoria no está en el marcador, sino en el abrazo fraterno tras el pitazo final. <strong style={{ color: '#e1c16e' }}>¡SANTIAGO ICAZA, EL ALMA MISMA DE ESTE DEPORTE!</strong>"
            </p>
          </div>
        </div>

        {/* C3 — CARLOS RAÚL ALVARADO (Azul) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', background: 'linear-gradient(135deg, #0a1172 0%, #1338be 100%)' }}>
          <div style={{ flex: '1 1 300px', minHeight: '400px' }}>
            <img src="/captains/carlos.jpg" alt="Carlos Raúl Alvarado" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: '1 1 300px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ background: '#e1c16e', color: 'black', padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>C3</span>
              <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#e1c16e', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>CARLOS RAÚL ALVARADO</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem', letterSpacing: '1px' }}>🎙️ Tono pasional, crescendo vocal, casi agónico</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
              "¡Escuchen ese estruendo! ¡Es Carlos Raúl Alvarado, <strong style={{ color: '#e1c16e' }}>'EL GRITO DEL GOL'</strong>! Un hombre que no juega al fútbol, <strong style={{ color: '#e1c16e' }}>¡LO PADECE, LO SUFRE, LO GRITA DESDE LAS ENTRAÑAS!</strong> Su garganta es un volcán en erupción que se anticipa a la jugada, un trueno que resuena antes que el balón toque la red. ¿Cabello? ¡Bah, detalles! Su pasión es tan inmensa que la melena le queda chica. Dicen los puristas que tiene el alma dividida, que su espíritu está más cerca del silbato del árbitro que del botín del goleador. Un visionario de las faltas, un <strong style={{ color: '#e1c16e' }}>PROFETA DEL OFFSIDE</strong> que imparte justicia a viva voz mientras corre detrás de la de gajos. <strong style={{ color: '#e1c16e' }}>¡CARLOS RAÚL ALVARADO, EL GRITO QUE DESGARRA LA TARDE, LA PASIÓN DESBOCADA QUE NOS RECUERDA QUE EL FÚTBOL ES SENTIMIENTO PURO!</strong>"
            </p>
          </div>
        </div>

        {/* C4 — LUCHO PULLEY (Concho de vino) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', background: 'linear-gradient(135deg, #4a1942 0%, #6b2d5b 100%)', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1 1 300px', minHeight: '400px' }}>
            <img src="/captains/lucho.jpg" alt="Lucho Pulley" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: '1 1 300px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ background: '#e1c16e', color: 'black', padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>C4</span>
              <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#e1c16e', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>LUCHO PULLEY</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem', letterSpacing: '1px' }}>🎙️ Tono misterioso, con un toque de complicidad y humor</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
              "¡Abran paso, que llega el <strong style={{ color: '#e1c16e' }}>'INFANTINO DEL PELOTEO'</strong>! Lucho Pulley, envuelto en el color concho de vino de las grandes gestas y las mejores cosechas. Un estratega del destino, señoras y señores. Es esa fuerza magnética donde el azar y la 'casualidad' se rinden ante su presencia. ¿Un rebote extraño? Va a los pies de Lucho. ¿Una falta dudosa? Siempre a favor del Infantino. Todo conspira, todo se alinea para que su equipo sonría. Pero no se confundan, detrás de ese misticismo dirigencial, late un <strong style={{ color: '#e1c16e' }}>CORAZÓN DE ORO</strong>, una bondad inabarcable que solo se compara con su amor por el deporte... <strong style={{ color: '#e1c16e' }}>¡Y POR UN BUEN CORTE DE CARNE A LA PARRILLA!</strong> Lucho Pulley, el hombre que domina el reglamento con una mano y el asador con la otra. <strong style={{ color: '#e1c16e' }}>¡UN MITO VIVIENTE!</strong>"
            </p>
          </div>
        </div>
      </div>

      {/* SPONSORS SECTION - VIP BANNER */}
      <div style={{ marginTop: '4rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
        
        {/* HEADER VIBRANTE */}
        <div style={{ background: 'linear-gradient(to bottom, #e1c16e 0%, #b39100 100%)', padding: '4rem 2rem 2rem 2rem', textAlign: 'center', color: 'black' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '2px', fontSize: '2.5rem', fontWeight: '900' }}>
            AGRADECIMIENTO ESPECIAL
          </h3>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.5', fontWeight: '500' }}>
            La <span style={{ fontStyle: 'italic' }}>magia</span> de <strong>La Catedral del Fútbol</strong> no sería posible sin el invaluable y generoso apoyo de nuestros patrocinadores. A ustedes, que confían en nuestra visión y hacen posible que el balón siga rodando con <strong>pasión</strong> cada semana: <br/><br/><span style={{ fontSize: '1.4rem', fontWeight: '900', fontStyle: 'italic' }}>¡GRACIAS POR SER PARTE DE NUESTRA FAMILIA!</span>
          </p>
        </div>

        {/* OLA (WAVE) TRANSICIÓN A BLANCO */}
        <div style={{ background: 'white' }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px', marginTop: '-1px' }}>
            <path fill="#b39100" d="M0,0 C320,100 420,100 720,50 C1020,0 1120,0 1440,100 L1440,0 Z"></path>
          </svg>
        </div>

        {/* CONTENEDOR DE LOGOS */}
        <div style={{ background: 'white', padding: '2rem 2rem 6rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(120, 300 - (sponsorsConfig?.length || 0) * 15)}px, 1fr))`, gap: '2.5rem', alignItems: 'center', justifyItems: 'center' }}>
            
            {sponsorsConfig && sponsorsConfig.length > 0 ? sponsorsConfig.map((sponsor, idx) => (
              <div key={sponsor.id || idx} style={{ width: '100%', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', transition: 'transform 0.3s' }} className="sponsor-card">
                <img src={sponsor.url} alt={sponsor.name || 'Auspiciante'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )) : (
              <p style={{ color: 'gray', fontStyle: 'italic', gridColumn: '1 / -1' }}>No hay auspiciantes cargados aún.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Estadísticas */}
      {selectedPlayer && (() => {
        const stars = selectedPlayer.stars || 3;
        let cardTheme = selectedPlayer.cardType || 'default';
        if (cardTheme === 'default') {
          if (stars >= 5) cardTheme = 'white';
          else if (stars === 4) cardTheme = 'blue';
          else if (stars === 3) cardTheme = 'black';
          else if (stars === 2) cardTheme = 'gold';
          else cardTheme = 'bronze';
        }
        
        let modalBg = 'var(--dark-glass)';
        let accentColor = 'var(--accent-neon)';
        let textColor = 'white';
        let secondaryBg = 'rgba(255,255,255,0.05)';
        let mutedText = 'var(--dark-text-muted)';
        
        if (cardTheme === 'white') {
          modalBg = 'rgba(245, 245, 245, 0.95)';
          accentColor = '#b9975b';
          textColor = '#222';
          secondaryBg = 'rgba(0,0,0,0.05)';
          mutedText = '#666';
        } else if (cardTheme === 'blue') {
          modalBg = 'rgba(10, 15, 40, 0.95)';
          accentColor = '#00ccff';
        } else if (cardTheme === 'black') {
          modalBg = 'rgba(20, 20, 20, 0.95)';
          accentColor = '#a0a0a0';
        } else if (cardTheme === 'gold') {
          modalBg = 'rgba(40, 30, 10, 0.95)';
          accentColor = '#ffd700';
        } else if (cardTheme === 'bronze') {
          modalBg = 'rgba(50, 25, 10, 0.95)';
          accentColor = '#cd7f32';
        }

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedPlayer(null)}>
            <div style={{ background: modalBg, border: `1px solid ${accentColor}`, borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '100%', position: 'relative', boxShadow: `0 10px 40px rgba(0,0,0,0.8)` }} onClick={e => e.stopPropagation()}>
              <button style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: textColor, fontSize: '1.8rem', cursor: 'pointer', opacity: 0.8 }} onClick={() => setSelectedPlayer(null)}>×</button>
              
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {selectedPlayer.photoUrl ? (
                  <img src={selectedPlayer.photoUrl} alt={selectedPlayer.firstName} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accentColor}`, marginBottom: '1rem' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: secondaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: accentColor, fontWeight: 'bold', margin: '0 auto 1rem auto', border: `3px solid ${accentColor}` }}>
                    {selectedPlayer.firstName[0]}
                  </div>
                )}
                <h3 style={{ margin: 0, color: textColor, fontSize: '1.8rem', textTransform: 'uppercase' }}>{selectedPlayer.firstName} {selectedPlayer.lastName}</h3>
                {selectedPlayer.nickname && <p style={{ margin: 0, color: accentColor, fontSize: '1.1rem', fontStyle: 'italic' }}>"{selectedPlayer.nickname}"</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: secondaryBg, padding: '0.8rem 1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${accentColor}` }}>
                  <span style={{ color: mutedText, fontSize: '0.9rem' }}>Posición Principal</span>
                  <span style={{ color: textColor, fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPlayer.position || 'MCO'}</span>
                </div>
                <div style={{ background: secondaryBg, padding: '0.8rem 1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: mutedText, fontSize: '0.9rem' }}>Partidos Jugados (Valorados)</span>
                  <span style={{ color: textColor, fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPlayer.ratings?.length || 0}</span>
                </div>
                <div style={{ background: secondaryBg, padding: '0.8rem 1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: mutedText, fontSize: '0.9rem' }}>Goles Históricos</span>
                  <span style={{ color: textColor, fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPlayer.historicalGoals || 0} ⚽</span>
                </div>
                <div style={{ background: secondaryBg, padding: '0.8rem 1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: mutedText, fontSize: '0.9rem' }}>Asistencias Totales</span>
                  <span style={{ color: textColor, fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPlayer.historicalAssists || 0} 👟</span>
                </div>
                <div style={{ background: secondaryBg, padding: '0.8rem 1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: `4px solid ${cardTheme === 'white' ? '#d4af37' : 'var(--accent-warning)'}` }}>
                  <span style={{ color: cardTheme === 'white' ? '#d4af37' : 'var(--accent-warning)', fontSize: '0.9rem', fontWeight: 'bold' }}>Campeonatos</span>
                  <span style={{ color: cardTheme === 'white' ? '#d4af37' : 'var(--accent-warning)', fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedPlayer.historicalChampionships || 0} 🏆</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
