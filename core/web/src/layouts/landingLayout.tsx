import React from "react";
import './styles/landingLayout.css';
export default function LandingLayout(props: any){
  const { children } = props;



  return(
    <div className="page-container">
      <div className="page-gradient">
        <div className="title-container">
          <header className="header-container">
            <h1 className="title-style">Whisper Trend</h1>
          </header>
          <main>
            {children}
          </main>
        </div>
      </div>
      <div className="bottom-container">
        <div className="bottom-content-container">
        </div>
      </div>
    </div>
  );
}