import React from "react";
import Navbar from "../components/Navbar";
import './styles/mainLayout.css';


export default function MainLayout(props:any) {
  return(
    <div className="main-layout">
      <Navbar />
      <div className="main-content">
        {props.children}
      </div>
    </div>
  );
}