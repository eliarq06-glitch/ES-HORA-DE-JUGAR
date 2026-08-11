import React, { useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Lock, CreditCard, Users, Landmark } from 'lucide-react';

export default function Finances({ sessions, setSessions, activeSessionId, allPlayers, initialFund, setInitialFund }) {
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'global'
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const confirmedPlayers = activeSession ? activeSession.confirmedIds.map(id => allPlayers.find(p => p.id === id)).filter(p => p) : [];

  const updateActiveSession = (updatedData) => {
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, ...updatedData } : s));
  };

  const handleUpdateCost = (cost) => {
    updateActiveSession({ pitchCost: parseFloat(cost) || 0 });
  };

  const handleUpdatePlayerCost = (cost) => {
    updateActiveSession({ playerCost: parseFloat(cost) || 0 });
  };

  const handleUpdatePayment = (playerId, amount) => {
    const currentPayments = activeSession.payments || {};
    const newPayments = { ...currentPayments, [playerId]: parseFloat(amount) || 0 };
    updateActiveSession({ payments: newPayments });
  };

  const handleCloseSession = () => {
    if(window.confirm('¿Estás seguro de cerrar la caja de esta jornada? Las deudas pendientes pasarán al historial de Deudas Globales.')) {
      updateActiveSession({ isClosed: true });
    }
  };

  // --- GLOBAL DEBTS LOGIC ---
  const calculateGlobalDebts = () => {
    const debts = {}; // { playerId: amount }
    let historicalCajaChica = 0;
    
    const closedSessions = sessions.filter(s => s.isClosed).sort((a,b) => a.id - b.id); // Oldest first
    
    closedSessions.forEach(session => {
      const pCost = session.playerCost || 0;
      let sessionCollected = 0;
      session.confirmedIds.forEach(pid => {
        const paid = (session.payments && session.payments[pid]) ? session.payments[pid] : 0;
        sessionCollected += paid;
        const owes = pCost - paid;
        if (owes > 0) {
          debts[pid] = (debts[pid] || 0) + owes;
        }
      });
      historicalCajaChica += (sessionCollected - (session.pitchCost || 0));
    });
    return { debts, historicalCajaChica };
  };

  const handlePayGlobalDebt = (playerId, amount) => {
    let paymentLeft = parseFloat(amount) || 0;
    if (paymentLeft <= 0) return;

    if(!window.confirm(`¿Abonar $${paymentLeft} a las deudas de este jugador? Se descontará de sus jornadas más antiguas.`)) return;

    const newSessions = [...sessions];
    // Sort oldest first
    const closedSessions = newSessions.filter(s => s.isClosed).sort((a,b) => a.id - b.id);

    for (let session of closedSessions) {
      if (paymentLeft <= 0) break;
      if (session.confirmedIds.includes(playerId)) {
        const pCost = session.playerCost || 0;
        const alreadyPaid = (session.payments && session.payments[playerId]) ? session.payments[playerId] : 0;
        const owes = pCost - alreadyPaid;
        
        if (owes > 0) {
          const toPayHere = Math.min(owes, paymentLeft);
          if (!session.payments) session.payments = {};
          session.payments[playerId] = alreadyPaid + toPayHere;
          paymentLeft -= toPayHere;
        }
      }
    }

    setSessions(newSessions);
    alert('¡Abono registrado correctamente!');
  };

  if (!activeSession && activeTab === 'current') {
    return <div className="glass-panel-dark" style={{ textAlign: 'center' }}>No hay ninguna jornada activa.</div>;
  }

  const pitchCost = activeSession?.pitchCost || 0;
  const playerCost = activeSession?.playerCost || 0;
  const payments = activeSession?.payments || {};
  const totalCollected = Object.values(payments).reduce((acc, curr) => acc + curr, 0);
  const cajaChica = totalCollected - pitchCost;
  const isClosed = activeSession?.isClosed;

  const { debts: globalDebts, historicalCajaChica } = calculateGlobalDebts();
  const debtors = Object.keys(globalDebts).map(id => ({ player: allPlayers.find(p => p.id === parseInt(id)), debt: globalDebts[id] })).filter(d => d.debt > 0);
  const totalCajaFuerte = historicalCajaChica + (initialFund || 0);

  return (
    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className={`btn ${activeTab === 'current' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.75rem 2rem' }} onClick={() => setActiveTab('current')}>
           <DollarSign size={18} style={{ marginRight: '8px' }} /> Jornada Actual
        </button>
        <button className={`btn ${activeTab === 'global' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.75rem 2rem' }} onClick={() => setActiveTab('global')}>
           <Landmark size={18} style={{ marginRight: '8px' }} /> Deudas Globales
        </button>
      </div>

      {activeTab === 'current' && (
        <>
          <div className="glass-panel-dark" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>Cuota por Jugador</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'white' }}>$</span>
                <input type="number" className="input-dark" style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0.5rem', width: '100%' }} value={playerCost || ''} onChange={(e) => handleUpdatePlayerCost(e.target.value)} disabled={isClosed} placeholder="0.00" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>Costo de Cancha</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'white' }}>$</span>
                <input type="number" className="input-dark" style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0.5rem', width: '100%' }} value={pitchCost || ''} onChange={(e) => handleUpdateCost(e.target.value)} disabled={isClosed} placeholder="0.00" />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>Recaudado</h3>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-neon)' }}>
                ${totalCollected.toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>Caja Chica</h3>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: cajaChica >= 0 ? 'var(--accent-neon)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {cajaChica >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                ${cajaChica.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="glass-panel-dark">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Users color="var(--accent-primary)" /> Control de Pagos ({activeSession.name})
              </h2>
              {isClosed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-warning)', fontWeight: 'bold', padding: '0.5rem 1rem', background: 'rgba(255,193,7,0.1)', borderRadius: '8px' }}>
                   <Lock size={18} /> CAJA CERRADA
                </div>
              ) : (
                <button className="btn btn-warning" style={{ padding: '0.5rem 1rem', background: 'var(--accent-warning)', color: 'black', border: 'none' }} onClick={handleCloseSession}>
                  <Lock size={16} style={{ marginRight: '8px' }} /> Cerrar Caja
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {confirmedPlayers.map(player => {
                const paid = payments[player.id] || 0;
                const hasPaidFull = paid >= playerCost && playerCost > 0;
                return (
                  <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: hasPaidFull ? '4px solid var(--accent-neon)' : '4px solid var(--accent-danger)' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar-placeholder">{player.firstName.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{player.firstName} {player.lastName}</div>
                        <div style={{ fontSize: '0.8rem', color: hasPaidFull ? 'var(--accent-neon)' : 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {hasPaidFull ? <><CheckCircle2 size={14} /> Pagado</> : <><AlertCircle size={14} /> {paid > 0 ? `Abonó $${paid}` : 'Pendiente'}</>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--dark-text-muted)' }}>Monto: $</span>
                      <input 
                        type="number" 
                        className="input-dark" 
                        style={{ width: '80px', textAlign: 'right', padding: '0.5rem', fontSize: '1.1rem' }} 
                        placeholder="0.00"
                        value={payments[player.id] || ''}
                        onChange={(e) => handleUpdatePayment(player.id, e.target.value)}
                        disabled={isClosed}
                      />
                    </div>
                    
                  </div>
                )
              })}
              {confirmedPlayers.length === 0 && (
                <div style={{ color: 'var(--dark-text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No hay jugadores confirmados para esta jornada.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'global' && (
        <>
          <div className="glass-panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <TrendingUp color="var(--accent-neon)" /> Caja Fuerte Global
            </h2>
            <p style={{ color: 'var(--dark-text-muted)' }}>
              Total de dinero recaudado históricamente, incluyendo saldo anterior de otras apps o temporadas.
            </p>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>Saldo Inicial Manual</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', color: 'white' }}>$</span>
                  <input 
                    type="number" 
                    className="input-dark" 
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0.5rem', width: '100%' }} 
                    value={initialFund || ''} 
                    onChange={(e) => setInitialFund(parseFloat(e.target.value) || 0)} 
                    placeholder="0.00" 
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>Ahorro de Jornadas Cerradas</h3>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: historicalCajaChica >= 0 ? 'var(--accent-neon)' : 'white' }}>
                  ${historicalCajaChica.toFixed(2)}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(204,255,0,0.1)', border: '1px solid var(--accent-neon)', borderRadius: '12px', flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--accent-neon)', fontSize: '0.9rem', fontWeight: 'bold' }}>Total en Caja Fuerte</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-neon)' }}>
                  ${totalCajaFuerte.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel-dark">
            <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Landmark color="var(--accent-warning)" /> Cuentas por Cobrar
            </h2>
            <p style={{ color: 'var(--dark-text-muted)', marginBottom: '2rem' }}>
             Aquí se muestran las deudas acumuladas de todas las jornadas que ya tienen la <strong>caja cerrada</strong>. Al abonar un pago, el sistema descontará automáticamente el dinero de las deudas más antiguas del jugador.
           </p>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {debtors.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--accent-neon)', padding: '3rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                   <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                   ¡Excelente! No hay deudas pendientes históricas.
                </div>
              ) : (
                debtors.map(d => (
                  <div key={d.player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--accent-danger)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div className="avatar-placeholder">{d.player.firstName.charAt(0)}</div>
                       <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{d.player.firstName} {d.player.lastName}</div>
                          <div style={{ color: 'var(--accent-danger)', fontWeight: 'bold', marginTop: '4px' }}>Deuda Total: ${d.debt.toFixed(2)}</div>
                       </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="number" id={`pay_${d.player.id}`} className="input-dark" style={{ width: '100px', padding: '0.75rem' }} placeholder="Abono ($)" />
                        <button className="btn btn-neon" style={{ padding: '0.75rem 1rem' }} onClick={() => {
                          const val = document.getElementById(`pay_${d.player.id}`).value;
                          handlePayGlobalDebt(d.player.id, val);
                          document.getElementById(`pay_${d.player.id}`).value = '';
                        }}>
                           <CreditCard size={18} /> Pagar
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

    </div>
  );
}
