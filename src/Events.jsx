import React, { useState } from "react";
import Particles from "./Particles";

function Events({ setPage }) {
  const role = localStorage.getItem("role") || "student";

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [viewType, setViewType] = useState("all");
  const [enrolledEvents, setEnrolledEvents] = useState([]);

  const [events] = useState([
    {
      id: 1,
      title: "TECH INNOVATE FEST 2024",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
      date: "2024-10-25",
      location: "College Auditorium & Labs",
      description:
        "Join us for coding, innovation, competitions and networking.",
    },
    {
      id: 2,
      title: "ART & CRAFT NIGHT",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      date: "2024-10-26",
      location: "College Auditorium & Labs",
      description:
        "Creative event with workshops and exhibitions.",
    },
    {
      id: 3,
      title: "STARTUP SYMPOSIUM",
      image:
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
      date: "2024-10-20",
      location: "College Auditorium & Labs",
      description:
        "Meet founders and pitch your ideas.",
    },
    {
      id: 4,
      title: "CULTURAL GALA 2024",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      date: "2024-10-28",
      location: "College Auditorium & Labs",
      description:
        "Music, dance and cultural celebration night.",
    },
  ]);

  // 🔎 SEARCH
  let filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) &&
      !enrolledEvents.some((e) => e.id === event.id)
  );

  // 🔄 SORTING
  if (sortType === "newest") {
    filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  if (sortType === "oldest") {
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  if (sortType === "az") {
    filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortType === "za") {
    filteredEvents.sort((a, b) => b.title.localeCompare(a.title));
  }

  const handleEnroll = (event) => {
    setEnrolledEvents([...enrolledEvents, event]);
  };

  const displayEvents =
    viewType === "all" ? filteredEvents : enrolledEvents;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* PARTICLES */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Particles
          particleColors={["#ffffff"]}
          particleCount={120}
          speed={0.3}
        />
      </div>

      {/* MAIN WRAPPER */}
      <div
  style={{
    position: "relative",
    zIndex: 5,
    background: "transparent",
    minHeight: "100vh",
    color: "black"
  }}
>
        {/* TOP NAVBAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "20px 40px",
            borderBottom: "1px solid #ccc",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>CAMPUS EVENTS HUB</h2>
            <small>College Event Portal</small>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <button onClick={() => setPage("home")}>
              ← Back to Dashboard
            </button>

            <button
              onClick={() => setViewType("all")}
              style={{
                background: viewType === "all" ? "black" : "white",
                color: viewType === "all" ? "white" : "black",
                padding: "8px 15px",
              }}
            >
              All Events
            </button>

            <button
              onClick={() => setViewType("enrolled")}
              style={{
                background: viewType === "enrolled" ? "black" : "white",
                color: viewType === "enrolled" ? "white" : "black",
                padding: "8px 15px",
              }}
            >
              Enrolled Events ({enrolledEvents.length})
            </button>
          </div>
        </div>

        {/* BODY */}
        <div
          style={{
            display: "flex",
            padding: "40px",
            gap: "40px",
          }}
        >
          {/* SIDEBAR */}
          <div
            style={{
              width: "260px",
              background: "rgba(255,255,255,0.95)",
              color: "black",
              padding: "20px",
              borderRadius: "10px",
              height: "fit-content",
            }}
          >
            <h3>SEARCH</h3>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
            />

            <h3>Sort By</h3>
            <p><input type="radio" onChange={() => setSortType("newest")} /> Date: Newest</p>
            <p><input type="radio" onChange={() => setSortType("oldest")} /> Date: Oldest</p>
            <p><input type="radio" onChange={() => setSortType("az")} /> Name A-Z</p>
            <p><input type="radio" onChange={() => setSortType("za")} /> Name Z-A</p>
          </div>

          {/* EVENTS GRID */}
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: "30px" }}>
              {viewType === "all"
                ? "EXPLORE UPCOMING COLLEGE EVENTS"
                : "YOUR ENROLLED EVENTS"}
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
              }}
            >
              {displayEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: "flex",
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={event.image}
                    alt="poster"
                    style={{
                      width: "140px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginRight: "15px",
                    }}
                  />

                  <div>
                    <h3>{event.title}</h3>
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p>{event.description}</p>

                    {viewType === "all" && (
                      <button
                        onClick={() => handleEnroll(event)}
                        style={{
                          background: "black",
                          color: "white",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "none",
                          marginTop: "10px"
                        }}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {displayEvents.length === 0 && (
              <p style={{ marginTop: "20px" }}>No events found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;