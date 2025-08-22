import React from "react";
import "../App.css";
function Loader({ theme }) {
  return (
    <div className="ir-loader-div">
      <div className="ir-dot-spinner">
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
        <div className="ir-dot-spinner__dot"></div>
      </div>
    </div>
  );
}

export default Loader;
