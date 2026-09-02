import React, { useState } from 'react';
import { Lock, User, Mail, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login({ onBack }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Registro
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.toUpperCase(),
            }
          }
        });
        if (signUpError) throw signUpError;
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark-text-muted)' }}><User size={16} /> Nombre Completo</label>
            <input 
              type="text" 
              className="input-dark" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Ej. Juan Pérez"
              required={isRegistering}
            />
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
