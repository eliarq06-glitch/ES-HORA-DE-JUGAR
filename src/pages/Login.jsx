import React, { useState } from 'react';
import { Lock, User, Mail, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login({ onBack, allPlayers = [], setPlayersDB, activeSession, updateConfirmedPlayers }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('MCO');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!firstName || !lastName || !nickname) {
           throw new Error("Nombre, Apellido y Apodo son obligatorios para registrarse.");
        }

        const derivedFullName = `${firstName} ${lastName}`.trim().toUpperCase();

        // Registro
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              full_name: derivedFullName,
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('Este correo ya está registrado. Por favor selecciona la opción "Inicia sesión".');
          }
          throw signUpError;
        }

        // Si el registro fue exitoso, creamos el jugador o actualizamos si ya existe
        let player = allPlayers.find(p => p.email && p.email.toLowerCase().trim() === email.toLowerCase().trim());
        
        if (!player) {
           const newId = Date.now();
           player = {
             id: newId,
             firstName: firstName.toUpperCase(),
             lastName: lastName.toUpperCase(),
             nickname: nickname.toUpperCase(),
             email: email.toLowerCase().trim(),
             position,
             ratings: [],
             stars: 3,
             status: 'active'
           };
           if (setPlayersDB) {
              setPlayersDB(prev => [...prev, player]);
           }
        } else {
           if (setPlayersDB) {
              setPlayersDB(prev => prev.map(p => p.id === player.id ? { ...p, position, nickname: nickname.toUpperCase() } : p));
           }
        }

        // AUTO-CONFIRM IN ACTIVE SESSION
        if (activeSession && updateConfirmedPlayers) {
           if (!activeSession.confirmedIds.includes(player.id)) {
              updateConfirmedPlayers([...activeSession.confirmedIds, player.id]);
           }
        }

        alert('¡Registro exitoso! Tu perfil ha sido creado. Has sido confirmado automáticamente para la jornada si hay una activa.');
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

  const handleResetPassword = async () => {
    if (!email) {
      alert("Por favor, ingresa tu correo arriba primero para enviarte el enlace de recuperación.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      alert("¡Enlace de recuperación enviado! Revisa tu bandeja de entrada o la carpeta de Spam.");
    } catch (err) {
      alert("Error enviando enlace: " + err.message);
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
          <div className="form-group" style={{ margin: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><User size={16} /> Tu Nombre (En mayúsculas)</label>
              <input type="text" className="input-dark" value={firstName} onChange={e => setFirstName(e.target.value.toUpperCase())} required={isRegistering} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><User size={16} /> Tu Apellido (En mayúsculas)</label>
              <input type="text" className="input-dark" value={lastName} onChange={e => setLastName(e.target.value.toUpperCase())} required={isRegistering} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><User size={16} /> Apodo (Cómo te dicen en la cancha)</label>
              <input type="text" className="input-dark" value={nickname} onChange={e => setNickname(e.target.value.toUpperCase())} required={isRegistering} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><User size={16} /> Tu Posición Principal</label>
              <select
                className="input-dark" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
                required={isRegistering}
                style={{ width: '100%' }}
              >
                <option value="POR">Portero (POR)</option>
                <option value="DEF">Defensa Central (DEF)</option>
                <option value="LD">Lateral Derecho (LD)</option>
                <option value="LI">Lateral Izquierdo (LI)</option>
                <option value="MCD">Medio Centro Defensivo (MCD)</option>
                <option value="MC">Medio Centro (MC)</option>
                <option value="MCO">Medio Centro Ofensivo (MCO)</option>
                <option value="ED">Extremo Derecho (ED)</option>
                <option value="EI">Extremo Izquierdo (EI)</option>
                <option value="DC">Delantero Centro (DC)</option>
              </select>
            </div>
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

            {!isRegistering && (
              <button type="button" className="btn btn-dark" style={{ background: 'transparent', fontSize: '0.8rem', color: 'var(--dark-text-muted)', textDecoration: 'underline' }} onClick={handleResetPassword}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
  
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
