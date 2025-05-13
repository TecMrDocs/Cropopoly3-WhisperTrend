import React from "react";

export default function LandingLayout(props: any){
  const { children } = props;

  return(
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <header style={{
        borderBottom: '1px solid #eaeaea',
        marginBottom: '20px',
        paddingBottom: '20px'
      }}>
        <h1>Landing page</h1>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}