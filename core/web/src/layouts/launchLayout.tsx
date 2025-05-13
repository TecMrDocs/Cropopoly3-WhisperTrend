import React from "react";
import Navbar from "../components/Navbar";
import './styles/launchLayout.css';


export default function MainLayout(props:any) {
  return(
    <div className="launch-layout">
      <Navbar />
      <div className="launch-content">
        {props.children}
      </div>
    </div>
  );
}