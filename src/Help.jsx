import React, { useState } from "react";
import Particles from "./Particles";

const faqs = [
  {
    q: "What is CampusLife?",
    a: "CampusLife is an AI-driven campus portal that brings together Events, Campus Tea, and Campus Arcade — all in one place for students of Charusat University.",
  },
  {
    q: "How do I enroll in an event?",
    a: "Go to the Events section, browse upcoming events, and click 'Enroll Now' on any event card. You can view your enrolled events under the 'Enrolled Events' tab.",
  },
  {
    q: "What is Campus Tea?",
    a: "Campus Tea is your campus social feed. Share photos and moments from college life, like and comment on posts, and stay connected with your peers.",
  },
  {
    q: "How does Campus Arcade work?",
    a: "Campus Arcade lets you play real-time multiplayer games with fellow students. Click 'Find Opponent' in Rock Paper Scissors and you'll be matched with someone instantly.",
  },
  {
    q: "Who can delete posts in Campus Tea?",
    a: "Students can delete their own posts and comments. Admins can delete any post or comment on the platform.",
  },
  {
    q: "How do I logout?",
    a: "Click the 'Logout' button in the top right corner of the Dashboard to securely sign out of your account.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="help-faq-item"
      onClick={() => setOpen(!open)}
    >
      <div className="help-faq-question">
        <span>{q}</span>
        <span className="help-faq-icon">{open ? "▲" : "▼"}</span>
      </div>
      {open && <p className="help-faq-answer">{a}</p>}
    </div>
  );
}

function Help({ setPage, currentUser }) {  return (
    <div className="help-root">

      {/* Particles */}
      <div className="help-particles">
        <Particles particleColors={["#ffffff"]} particleCount={150} speed={0.1} />
      </div>

      <div className="help-page">

        {/* Navbar */}
        <div className="help-navbar">
          <div>
            <h2 className="help-navbar-title">HELP & SUPPORT</h2>
            <small className="help-navbar-sub">Everything you need to know about CampusLife</small>
          </div>
          <button className="help-back-btn" onClick={() => setPage(currentUser ? "home" : "landing")}>
  {currentUser ? "Back to Dashboard" : "Back to Home"}
</button>
        </div>

        {/* Hero */}
        <div className="help-hero">
          <h1 className="help-hero-title">How can we help you?</h1>
          <p className="help-hero-sub">
            Browse the FAQ below or reach out directly to the CampusLife team.
          </p>
        </div>

        {/* Quick Links */}
        <div className="help-quick-links">
          {[
  { label: "Events", icon: "🎯", page: "events" },
  { label: "Campus Tea", icon: "☕", page: "reviews" },
  { label: "Campus Arcade", icon: "🎮", page: "games" },
].map((item) => (
  <button
    key={item.page}
    className="help-quick-card"
    onClick={() => {
      if (currentUser) {
        setPage(item.page);
      } else {
        setPage("login");
      }
    }}
  >
    <span className="help-quick-icon">{item.icon}</span>
    <span className="help-quick-label">{item.label}</span>
    <span className="help-quick-arrow">→</span>
  </button>
))}
        </div>

        {/* FAQ */}
        <div className="help-section">
          <h3 className="help-section-title">Frequently Asked Questions</h3>
          <div className="help-faq-list">
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="help-section">
          <h3 className="help-section-title">Meet the Team</h3>
          <div className="help-team-grid">

            <div className="help-team-card help-team-lead">
              <div className="help-team-avatar">NL</div>
              <div className="help-team-info">
                <p className="help-team-name">Naitik Lavri</p>
                <p className="help-team-role">Project Lead & Developer</p>
                <a href="mailto:24it042@charusat.edu.in" className="help-team-email">
                  24it042@charusat.edu.in
                </a>
              </div>
            </div>

            <div className="help-team-card">
              <div className="help-team-avatar">MI</div>
              <div className="help-team-info">
                <p className="help-team-name">Mihir</p>
                <p className="help-team-role">Team Member</p>
                <a href="mailto:24it030@charusat.edu.in" className="help-team-email">
                  24it030@charusat.edu.in
                </a>
              </div>
            </div>

            <div className="help-team-card">
              <div className="help-team-avatar">ZE</div>
              <div className="help-team-info">
                <p className="help-team-name">Zeel</p>
                <p className="help-team-role">Team Member</p>
                <a href="mailto:24it023@charusat.edu.in" className="help-team-email">
                  24it023@charusat.edu.in
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Contact */}
        <div className="help-section">
          <div className="help-contact-box">
            <h3 className="help-contact-title">Still need help?</h3>
            <p className="help-contact-sub">
              Reach out to the project lead directly and we'll get back to you.
            </p>
            <a href="mailto:24it042@charusat.edu.in" className="help-contact-btn">
              Contact Us
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="help-footer">
          <p>CampusLife — Built with ❤️ by Naitik, Mihir & Zeel · Charusat University · 2024</p>
        </div>

      </div>
    </div>
  );
}

export default Help;