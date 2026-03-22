import React from "react";
import Particles from "./Particles";
import CardSwap, { Card } from "./CardSwap";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

function Home({ setPage, currentUser }) {

  const menuButtonStyle = {
    padding: "8px 20px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid white",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    backdropFilter: "blur(5px)",
  };

  const mainButtonStyle = {
    padding: "12px 28px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid white",
    color: "white",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "20px"
  };

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  };

  // ✅ Proper Firebase logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPage("landing");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      {/* PARTICLES */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
        />
      </div>

      {/* TOP MENU */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "40px",
          zIndex: 20,
          color: "white",
          fontSize: "14px",
          opacity: 0.7,
        }}
      >
        {/* ✅ Show logged in user name */}
        {currentUser && `Welcome, ${currentUser.name}`}
      </div>

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "40px",
          display: "flex",
          gap: "20px",
          zIndex: 20,
        }}
      >
        <button onClick={() => setPage("help")} style={menuButtonStyle}>
          Help
        </button>

        <button onClick={() => setPage("about")} style={menuButtonStyle}>
          About Us
        </button>

        <button onClick={handleLogout} style={menuButtonStyle}>
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8%",
          height: "100%",
          color: "white",
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ width: "45%", marginTop: "-80px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
            CAMPUSLIFE:
            <br />
            AI DRIVEN CAMPUS
          </h1>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <button
              style={mainButtonStyle}
              onClick={() => setPage("events")}
            >
              EVENTS
            </button>

            {/* ✅ Now connected to reviews page */}
            <button
              style={mainButtonStyle}
              onClick={() => setPage("reviews")}
            >
              CAMPUS REVIEW
            </button>

            <button
              style={mainButtonStyle}
              onClick={() => setPage("games")}
            >
              CAMPUS GAMES
            </button>
          </div>
        </div>

        {/* RIGHT CARDS */}
        <div style={{ width: "45%", height: "600px" }}>
          <CardSwap cardDistance={60} verticalDistance={70} pauseOnHover>
            <Card>
              <div style={cardStyle}>
                <h2>Events</h2>
                <p>All campus events in one AI powered platform.</p>
              </div>
            </Card>

            <Card>
              <div style={cardStyle}>
                <h2>CampusGames</h2>
                <p>Play with your campus community.</p>
              </div>
            </Card>

            <Card>
              <div style={cardStyle}>
                <h2>Reviews</h2>
                <p>Students review campus experiences.</p>
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </div>
  );
}

export default Home;
