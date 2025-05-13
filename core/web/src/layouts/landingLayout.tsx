import React from "react";

export default function LandingLayout(props: any){
  const { children } = props;

  

  return(
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        minHeight: '85vh',
        width: '100%',
        background: 'linear-gradient(180deg, #00BFB3 0%, #0091D5 100%)',
        position: 'relative',
        margin: 0,
        padding: 0
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          padding: '20px'
        }}>
          <header style={{
            marginBottom: '20px',
            paddingBottom: '20px'
          }}>
            <h1 style={{ color: 'white' }}>Whisper Trend</h1>
          </header>
          <main>
            {children}
          </main>
        </div>
      </div>
      <div style={{
        minHeight: '25vh',
        width: '100%',
        backgroundColor: 'white',
        position: 'relative',
        margin: '-10vh 0 0 0',
        padding: 0
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          padding: '20px'
        }}>
        </div>
      </div>
    </div>
  );
}