import React from "react";
import './styles/BackButton.css';

export default function BackButton(props:any){
  return(
    <button className="back-button ">{props.text}</button>    
  );
}