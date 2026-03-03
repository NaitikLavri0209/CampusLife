import React from "react";
import Particles from "./Particles";

function About({ setPage }) {
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
        <h1>About Us</h1>
        <p>CampusLife is an AI-driven campus platform.</p>

        <button onClick={() => setPage("home")}>Back to Home</button>
      </div>
    </div>
  );
}

export default About;
