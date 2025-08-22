import React from "react";
import "../App.css";
function GhostLoader({ width, height, radius, theme }) {
  return (
    <div
      style={{
        width: width,
        height: height,
        borderRadius: radius || "var(--irada-radius)",
      }}
      className="ghost-loader"
    ></div>
  );
}

export default GhostLoader;
