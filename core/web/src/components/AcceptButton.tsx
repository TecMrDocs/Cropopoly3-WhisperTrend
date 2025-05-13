import React from "react";
import './styles/AcceptButton.css';


export default function AcceptButton(props:any){
  return(
    <div>
      <button className="accept-button">{props.text}</button>
    </div>
  );
}