import React from 'react';
import './styles/Navbar.css';
import logo from '../assets/Wtw1.png';

export default function Navbar() {
  return(
    <div className="navbar-styles">
      <div className="logo-container">
        <img src={logo} alt="Whisper Trend Logo" />
        <p>Whisper Trend</p>
      </div>
    </div>
  );
}