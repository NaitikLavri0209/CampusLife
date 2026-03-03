import React from "react";
import Particles from "./Particles";

function Help({ setPage }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Particles particleColors={["#ffffff"]} particleCount={200} speed={0.1} />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "100px",
          textAlign: "center",
        }}
      >
        <h1>Help Page</h1>
        <p>This is the help section of CampusLife.</p>

        <button onClick={() => setPage("home")}>Back to Home</button>
      </div>
    </div>
  );
}

export default Help;
