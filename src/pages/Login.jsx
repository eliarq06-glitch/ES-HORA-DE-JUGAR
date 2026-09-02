import React, { useState } from 'react';
import { Lock, User, Mail, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login({ onBack, allPlayers = [], setPlayersDB, activeSession, updateConfirmedPlayers }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!selectedPlayerId) {
          throw new Error('Debes seleccionar quién eres en la liga. Si no estás en la lista, un Admin debe agregarte a la Plantilla General primero.');
        }
        
        const player = allPlayers.find(p => p.id === parseInt(selectedPlayerId));
        const derivedFullName = `${player.firstName} ${player.lastName}`.trim().toUpperCase();

        // Registro
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: derivedFullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (setPlayersDB) {
           setPlayersDB(prev => prev.map(p => p.id === player.id ? { ...p, email } : p));
        }

        // AUTO-CONFIRM IN ACTIVE SESSION
        if (activeSession && updateConfirmedPlayers) {
           if (!activeSession.confirmedIds.includes(player.id)) {
              updateConfirmedPlayers([...activeSession.confirmedIds, player.id]);
           }
        }

        alert('¡Registro exitoso! Has sido confirmado automáticamente para la jornada.');
        setIsRegistering(false);
      } else {
        // Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        // El onAuthStateChange de App.jsx manejará la redirección
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel-dark login-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
          {isRegistering ? <UserPlus size={32} color="var(--accent-neon)" /> : <Lock size={32} color="var(--accent-neon)" />}
        </div>
        <h2 className="title-main" style={{ fontSize: '2rem' }}>{isRegistering ? 'Crear Cuenta' : 'Acceso'}</h2>
        <p className="subtitle">{isRegistering ? 'Regístrate como jugador' : 'Inicia sesión para continuar'}</p>
      </div>
      
      {error && (
        <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {isRegistering && (
          <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><User size={16} /> Selecciona tu Jugador</label>
            <select
              className="input-dark" 
              value={selectedPlayerId} 
              onChange={(e) => setSelectedPlayerId(e.target.value)} 
              required={isRegistering}
              style={{ width: '100%' }}
            >
              <option value="">-- ¿Quién eres en la liga? --</option>
              {allPlayers.filter(p => !p.email).sort((a,b) => a.firstName.localeCompare(b.firstName)).map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.nickname ? `("${p.nickname}")` : ''}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><Mail size={16} /> Correo Electrónico</label>
          <input 
            type="email" 
            className="input-dark" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="tu@correo.com"
            required
            autoFocus
          />
        </div>

        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><Lock size={16} /> Contraseña</label>
          <input 
            type="password" 
            className="input-dark" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-neon" disabled={loading}>
            {loading ? 'Procesando...' : (isRegistering ? 'Registrarme' : 'Ingresar')}
          </button>
          
          <button type="button" className="btn btn-dark" style={{ background: 'transparent', fontSize: '0.9rem' }} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>

          {onBack && (
            <button type="button" className="btn btn-dark" style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }} onClick={onBack}>
              Volver al Inicio
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
