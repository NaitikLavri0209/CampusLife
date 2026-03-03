import React, { useEffect, useState } from "react";
import Particles from "./Particles";

function LoadingScreen({ setPage }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setCount(current);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setPage("home");
        }, 300);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [setPage]);

  return (
    <div
      style={{
        position: "fixed",   // 🔥 THIS IS IMPORTANT
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,        // 🔥 FORCE ABOVE LIQUID
        backgroundColor: "black"
      }}
    >
      {/* Particles Background */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "72px",
          fontWeight: "bold"
        }}
      >
        {count}%
      </div>
    </div>
  );
}

export default LoadingScreen;
