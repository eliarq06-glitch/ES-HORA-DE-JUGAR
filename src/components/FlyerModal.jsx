import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function FlyerModal({ session, onClose }) {
  const flyerRef = useRef(null);

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    const canvas = await html2canvas(flyerRef.current, { scale: 2, useCORS: true });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Convocatoria-${session.name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  if (!session) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'auto' }}>
      
      {/* Container to be captured */}
      <div 
        ref={flyerRef}
        style={{ 
          width: '400px', 
          height: '700px', 
          flexShrink: 0, // Prevent distortion on narrow mobile screens
          backgroundColor: '#111827',
          position: 'relative', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        {/* Safe radial glow for html2canvas */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 20%, rgba(232,185,49,0.15) 0%, transparent 60%)', zIndex: 1 }}></div>

        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: '2px solid rgba(232,185,49,0.3)' }}></div>
        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '1px solid rgba(232,185,49,0.1)' }}></div>

        <img src="/logo.png" alt="LCDF" style={{ width: '130px', filter: 'drop-shadow(0 0 20px rgba(232,185,49,0.5))', marginBottom: '1rem', zIndex: 2 }} crossOrigin="anonymous" />
        
        <h1 style={{ fontSize: '2.8rem', margin: 0, color: 'var(--accent-neon)', textTransform: 'uppercase', textShadow: '0 4px 20px rgba(232,185,49,0.5)', zIndex: 2, textAlign: 'center', lineHeight: '1' }}>
          ES HORA DE JUGAR
        </h1>
        
        <div style={{ background: 'var(--accent-neon)', color: 'black', padding: '4px 12px', fontWeight: '900', letterSpacing: '2px', fontSize: '0.9rem', marginTop: '1rem', zIndex: 2, transform: 'skew(-10deg)' }}>
          <span style={{ display: 'block', transform: 'skew(10deg)' }}>LA CATEDRAL DEL FÚTBOL</span>
        </div>

        <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '0.5rem', color: 'white', zIndex: 2, textAlign: 'center', textTransform: 'uppercase', fontWeight: '900', padding: '0 10%' }}>
          {session.name}
        </h2>
        
        <p style={{ fontSize: '1.1rem', color: '#e2e8f0', margin: '0 0 1.5rem 0', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📅 {session.date}
        </p>

        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 2, width: '80%', textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'gray', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 'bold' }}>Apertura de Convocatoria</p>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: 'white', lineHeight: '1', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {session.openTime || '18:00'}
          </div>
        </div>

        <div style={{ width: '85%', textAlign: 'center', zIndex: 2, padding: '0 10px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.4' }}>
            Atento como <strong style={{ fontStyle: 'normal', color: 'var(--accent-warning)' }}>GELO</strong>, 
            veloz como <strong style={{ fontStyle: 'normal', color: 'var(--accent-warning)' }}>BOCHITO</strong>, 
            fuerte como <strong style={{ fontStyle: 'normal', color: 'var(--accent-warning)' }}>AGUCHO</strong>, 
            y sobre todo <strong style={{ fontStyle: 'normal', color: 'var(--accent-warning)' }}>JAMÁS BAJES LAS MANOS</strong> 
            (dijo el maestrito), porque te puedes quedar fuera! <br/><br/>
            <strong style={{ fontStyle: 'normal', color: 'var(--accent-danger)', fontSize: '0.95rem', textTransform: 'uppercase' }}>¡PONTE PILAS PICANTE!</strong>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn btn-neon" onClick={handleDownload}>
          Descargar Flyer
        </button>
        <button className="btn btn-dark" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
