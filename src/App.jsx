import React, { useState, useEffect, useRef } from "react";
import Particles from "./Particles";
import ElectricBorder from "./ElectricBorder";
import Login from "./Login";
import Signup from "./SignUp";
import LoadingScreen from "./LoadingScreen";
import Home from "./Home";
import Help from "./Help";
import About from "./About";
import Events from "./Events";
import AdminPanel from "./AdminPanel";
import CampusReviews from "./CampusReviews";
import CampusArcade from "./CampusArcade";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// ── Landing Page ───────────────────────────────────────────────────────────────
function LandingPage({ setPage }) {
  const sectionsRef = useRef(null);

  const scrollToSections = () => {
    sectionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const segments = [
    {
      icon: "🎯",
      title: "Campus Events",
      subtitle: "Never miss a moment",
      desc: "Browse all upcoming college events — fests, workshops, seminars, and more. Enroll with one tap and track everything you've signed up for.",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      tag: "EVENTS",
    },
    {
      icon: "☕",
      title: "Campus Tea",
      subtitle: "Spill the tea on campus",
      desc: "A social feed built for students. Share photos, drop your thoughts, like and comment on posts from your campus community in real-time.",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
      tag: "SOCIAL",
    },
    {
      icon: "🎮",
      title: "Campus Arcade",
      subtitle: "Play with your campus",
      desc: "Real-time multiplayer games with fellow students. Challenge someone to Rock Paper Scissors and climb to 10 points first. More games coming soon.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
      tag: "GAMES",
    },
  ];

  return (
    <div className="landing-root">

      {/* Particles */}
      <div className="landing-particles">
        <Particles particleColors={["#ffffff"]} particleCount={160} speed={0.08} />
      </div>

      {/* ── TOP NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">CampusLife</div>
        <div className="landing-nav-links">
          <button className="landing-nav-btn" onClick={() => setPage("help")}>Help</button>
          <button className="landing-nav-btn" onClick={() => setPage("about")}>About Us</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-badge">AI Integrated Campus Portal</div>
          <h1 className="landing-hero-title">
            CAMPUS<span className="landing-hero-accent">LIFE</span>
          </h1>
          <p className="landing-hero-desc">
            One platform for your entire college experience —
            events, social moments, and real-time games.
            Built for students, by students.
          </p>

          <div className="landing-hero-btns">
            <ElectricBorder>
              <button
                className="landing-btn-primary"
                onClick={() => setPage("login")}
              >
                Login
              </button>
            </ElectricBorder>
            <ElectricBorder>
              <button
                className="landing-btn-primary"
                onClick={() => setPage("signup")}
              >
                Sign Up
              </button>
            </ElectricBorder>
          </div>

          <button className="landing-scroll-hint" onClick={scrollToSections}>
            <span>Scroll to explore</span>
            <span className="landing-scroll-arrow">↓</span>
          </button>
        </div>
      </section>

      {/* ── SEGMENTS ── */}
      <section className="landing-segments" ref={sectionsRef}>
        <div className="landing-segments-inner">

          <div className="landing-segments-header">
            <h2 className="landing-segments-title">Everything in one place</h2>
            <p className="landing-segments-sub">
              Three powerful sections designed to make your campus life better.
            </p>
          </div>

          {segments.map((s, i) => (
            <div
              key={s.title}
              className={`landing-segment-row ${i % 2 !== 0 ? "landing-segment-row-reverse" : ""}`}
            >
              {/* Image */}
              <div className="landing-segment-img-wrap">
                <div className="landing-segment-tag">{s.tag}</div>
                <img src={s.image} alt={s.title} className="landing-segment-img" />
              </div>

              {/* Text */}
              <div className="landing-segment-text">
                <span className="landing-segment-icon">{s.icon}</span>
                <p className="landing-segment-subtitle">{s.subtitle}</p>
                <h3 className="landing-segment-title">{s.title}</h3>
                <p className="landing-segment-desc">{s.desc}</p>
                <button
                  className="landing-segment-cta"
                  onClick={() => setPage("login")}
                >
                  Get Started →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <p>CampusLife · Built with ❤️ by Naitik, Mihir & Zeel · Charusat University · 2024</p>
        <div className="landing-footer-links">
          <button onClick={() => setPage("help")}>Help</button>
          <button onClick={() => setPage("about")}>About</button>
        </div>
      </footer>

    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "TECH INNOVATE FEST 2024",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      date: "2024-10-25",
      time: "9:00 AM",
      location: "College Auditorium",
      description: "Coding & Innovation Fest",
      createdBy: "admin",
    },
  ]);

  const [enrolledEvents, setEnrolledEvents] = useState([]);

  const enrollEvent = (event) => {
    setEnrolledEvents([...enrolledEvents, event]);
    setEvents(events.filter((e) => e.id !== event.id));
  };

  const addEvent = (newEvent) => setEvents([...events, newEvent]);
  const updateEvent = (updatedEvent) =>
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));

  return (
    <div className="w-full min-h-screen relative bg-black overflow-hidden text-white">
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} setCurrentUser={setCurrentUser} />}
      {page === "signup" && <Signup setPage={setPage} setCurrentUser={setCurrentUser} />}
      {page === "loading" && <LoadingScreen setPage={setPage} />}
      {page === "home" && <Home setPage={setPage} currentUser={currentUser} />}
      {page === "help" && <Help setPage={setPage} />}
      {page === "about" && <About setPage={setPage} />}
      {page === "reviews" && <CampusReviews setPage={setPage} currentUser={currentUser} />}
      {page === "events" && <Events setPage={setPage} currentUser={currentUser} />}
      {page === "admin" && (
        <AdminPanel
          setPage={setPage}
          events={events}
          addEvent={addEvent}
          updateEvent={updateEvent}
        />
      )}
      {page === "games" && <CampusArcade setPage={setPage} currentUser={currentUser} />}
    </div>
  );
}

export default App;