import React from 'react';

export default function Landing({ onEnter }) {
  return (
    <div className="night-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      
      {/* Logo */}
      <div style={{ marginBottom: '3rem', animation: 'fadeInDown 1s ease-out' }}>
        <img 
          src="/logo.png" 
          alt="La Catedral del Fútbol" 
          style={{ width: '280px', maxWidth: '80vw', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} 
        />
      </div>

      {/* Main text */}
      <h1 style={{ 
        fontFamily: 'var(--font-heading)', 
        fontSize: '2.8rem', 
        fontWeight: '900', 
        textTransform: 'uppercase',
        lineHeight: '1.2',
        marginBottom: '4rem',
        background: 'linear-gradient(to bottom, #ffffff, var(--accent-warning))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'fadeInUp 1s ease-out 0.5s both'
      }}>
        ¿Estás listo para chocolatear y reír?
      </h1>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '350px', animation: 'fadeInUp 1s ease-out 1s both' }}>
        <button 
          className="btn" 
          style={{ 
            background: 'var(--accent-warning)', 
            color: 'black', 
            fontSize: '1.2rem', 
            padding: '1.5rem', 
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 10px 20px rgba(232,185,49,0.3)',
            borderRadius: '16px',
            cursor: 'pointer',
            border: 'none'
          }}
          onClick={onEnter}
        >
          Sí, estoy listo
        </button>
        
        <button 
          className="btn" 
          style={{ 
            background: 'rgba(0,0,0,0.5)', 
            border: '2px solid var(--accent-warning)',
            color: 'var(--accent-warning)', 
            fontSize: '1.1rem', 
            padding: '1.5rem', 
            fontWeight: '700',
            textTransform: 'uppercase',
            borderRadius: '16px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            cursor: 'pointer'
          }}
          onClick={onEnter}
        >
          Sí estoy listo, pero con bielas
        </button>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
