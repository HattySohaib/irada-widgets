import React from "react";
import "../App.css";
function Loader({ theme }) {
  return (
    <div className="ir-loader-div" style={{ width: "100%", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
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
        <p
          style={{
            marginTop: "1rem",
            color: "var(--irada-text)",
            fontSize: "1rem",
            fontFamily: "var(--irada-font-family)",
            opacity: 0.8,
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}

export default Loader;
