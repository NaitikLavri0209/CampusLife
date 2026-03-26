import React from "react";
import Particles from "./Particles";

const features = [
  {
    icon: "🎯",
    title: "Campus Events",
    desc: "Browse and enroll in all college events in one place. Admins can publish new events with posters, dates, and locations.",
  },
  {
    icon: "☕",
    title: "Campus Tea",
    desc: "A social feed where students share campus moments, photos, and experiences. Like, comment, and connect with peers.",
  },
  {
    icon: "🎮",
    title: "Campus Arcade",
    desc: "Real-time multiplayer games with fellow students. Challenge someone to Rock Paper Scissors and more coming soon.",
  },
];

const team = [
  {
    initials: "NL",
    name: "Naitik Lavri",
    role: "Project Lead & Full Stack Developer",
    email: "24it042@charusat.edu.in",
    lead: true,
  },
  {
    initials: "MI",
    name: "Mihir",
    role: "Developer",
    email: "24it030@charusat.edu.in",
    lead: false,
  },
  {
    initials: "ZE",
    name: "Zeel",
    role: "Developer",
    email: "24it023@charusat.edu.in",
    lead: false,
  },
];

function About({ setPage, currentUser }) {
  return (
    <div className="about-root">

      {/* Particles */}
      <div className="about-particles">
        <Particles particleColors={["#ffffff"]} particleCount={150} speed={0.1} />
      </div>

      <div className="about-page">

        {/* Navbar */}
        <div className="about-navbar">
          <div>
            <h2 className="about-navbar-title">ABOUT US</h2>
            <small className="about-navbar-sub">The story behind CampusLife</small>
          </div>
         <button className="about-back-btn" onClick={() => setPage(currentUser ? "home" : "landing")}>
  {currentUser ? "Back to Dashboard" : "Back to Home"}
</button>
        </div>

        {/* Hero */}
        <div className="about-hero">
          <div className="about-hero-badge">Made at Charusat University</div>
          <h1 className="about-hero-title">
            CAMPUSLIFE
          </h1>
          <p className="about-hero-tagline">AI Driven Campus Portal</p>
          <p className="about-hero-desc">
            CampusLife was built to bring the entire college experience into one
            unified platform — events, social moments, and fun games, all
            connected and real-time.
          </p>
        </div>

        {/* Mission */}
        <div className="about-section">
          <div className="about-mission-box">
            <h3 className="about-mission-title">Our Mission</h3>
            <p className="about-mission-text">
              To make campus life more connected, engaging, and fun by giving
              students a single platform to discover events, share their college
              journey, and play with their peers — powered by modern web
              technology and real-time data.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="about-section">
          <h3 className="about-section-title">What We Built</h3>
          <div className="about-features-grid">
            {features.map((f) => (
              <div key={f.title} className="about-feature-card">
                <span className="about-feature-icon">{f.icon}</span>
                <h4 className="about-feature-title">{f.title}</h4>
                <p className="about-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="about-section">
          <h3 className="about-section-title">Tech Stack</h3>
          <div className="about-tech-grid">
            {["React", "Firebase", "Firestore", "Cloudinary", "CSS3", "JavaScript"].map((t) => (
              <div key={t} className="about-tech-pill">{t}</div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="about-section">
          <h3 className="about-section-title">The Team</h3>
          <div className="about-team-grid">
            {team.map((m) => (
              <div key={m.email} className={`about-team-card ${m.lead ? "about-team-lead" : ""}`}>
                <div className={`about-team-avatar ${m.lead ? "about-team-avatar-lead" : ""}`}>
                  {m.initials}
                </div>
                <div className="about-team-info">
                  <p className="about-team-name">{m.name}</p>
                  {m.lead && <span className="about-team-badge">Lead</span>}
                  <p className="about-team-role">{m.role}</p>
                  <a href={`mailto:${m.email}`} className="about-team-email">
                    {m.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <p>CampusLife · Built with ❤️ by Naitik, Mihir & Zeel · Charusat University · 2024</p>
        </div>

      </div>
    </div>
  );
}

export default About;