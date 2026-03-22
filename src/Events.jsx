import React, { useState, useEffect } from "react";
import Particles from "./Particles";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import "./index.css";

function Events({ setPage, currentUser }) {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [viewType, setViewType] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [events, setEvents] = useState([]);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const isAdmin = currentUser?.role === "admin";

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    image: "",
  });

  // Load events from Firestore
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (fetched.length === 0) {
        seedDefaultEvents();
      } else {
        setEvents(fetched);
      }
      setLoadingEvents(false);
    });
    return () => unsub();
  }, []);

  // Load enrolled events for this user
  useEffect(() => {
    if (!currentUser) return;
    const q = collection(db, "users", currentUser.uid, "enrolledEvents");
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEnrolledEvents(fetched);
    });
    return () => unsub();
  }, [currentUser]);

  const seedDefaultEvents = async () => {
    const defaults = [
      {
        title: "TECH INNOVATE FEST 2024",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        date: "2024-10-25",
        time: "9:00 AM",
        location: "College Auditorium & Labs",
        description: "Join us for coding, innovation, competitions and networking.",
        createdAt: Date.now(),
      },
      {
        title: "ART & CRAFT NIGHT",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        date: "2024-10-26",
        time: "6:00 PM",
        location: "College Auditorium & Labs",
        description: "Creative event with workshops and exhibitions.",
        createdAt: Date.now(),
      },
      {
        title: "STARTUP SYMPOSIUM",
        image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
        date: "2024-10-20",
        time: "10:00 AM",
        location: "College Auditorium & Labs",
        description: "Meet founders and pitch your ideas.",
        createdAt: Date.now(),
      },
      {
        title: "CULTURAL GALA 2024",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
        date: "2024-10-28",
        time: "7:00 PM",
        location: "College Auditorium & Labs",
        description: "Music, dance and cultural celebration night.",
        createdAt: Date.now(),
      },
    ];
    for (const event of defaults) {
      await addDoc(collection(db, "events"), event);
    }
  };

  const handleAddEvent = async () => {
    if (!form.title || !form.date || !form.location) {
      alert("Please fill in Title, Date, and Location at minimum.");
      return;
    }
    await addDoc(collection(db, "events"), {
      ...form,
      createdAt: Date.now(),
      createdBy: currentUser?.uid || "admin",
    });
    setForm({ title: "", date: "", time: "", location: "", description: "", image: "" });
    setPosterPreview(null);
    setShowAddForm(false);
  };

  const handleEnroll = async (event) => {
    if (!currentUser) {
      alert("Please login to enroll.");
      return;
    }
    const alreadyEnrolled = enrolledEvents.some((e) => e.id === event.id);
    if (alreadyEnrolled) {
      alert("You are already enrolled in this event.");
      return;
    }
    await setDoc(
      doc(db, "users", currentUser.uid, "enrolledEvents", event.id),
      { ...event, enrolledAt: Date.now() }
    );
  };

  const handleUnenroll = async (eventId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, "users", currentUser.uid, "enrolledEvents", eventId));
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectURL = URL.createObjectURL(file);
    setPosterPreview(objectURL);
    setForm({ ...form, image: objectURL });
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setPosterPreview(null);
  };

  const enrolledIds = enrolledEvents.map((e) => e.id);

  let filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) &&
      !enrolledIds.includes(event.id)
  );

  if (sortType === "newest") filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortType === "oldest") filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sortType === "az") filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
  if (sortType === "za") filteredEvents.sort((a, b) => b.title.localeCompare(a.title));

  const displayEvents = viewType === "all" ? filteredEvents : enrolledEvents;

  return (
    <div className="events-root">

      <div className="events-particles">
        <Particles particleColors={["#ffffff"]} particleCount={120} speed={0.3} />
      </div>

      <div className="events-wrapper">

        {/* NAVBAR */}
        <div className="events-navbar">
          <div className="events-navbar-brand">
            <h2>CAMPUS EVENTS HUB</h2>
            <small>College Event Portal</small>
          </div>

          <div className="events-navbar-actions">
            <button onClick={() => setPage("home")}>Back to Dashboard</button>

            <button
              className={`events-btn-tab ${viewType === "all" ? "active" : "inactive"}`}
              onClick={() => setViewType("all")}
            >
              All Events
            </button>

            <button
              className={`events-btn-tab ${viewType === "enrolled" ? "active" : "inactive"}`}
              onClick={() => setViewType("enrolled")}
            >
              Enrolled Events ({enrolledEvents.length})
            </button>

            {/* ✅ Only admin can see Add Event button */}
            {isAdmin && (
              <button
                className="events-btn-add"
                onClick={() => { setShowAddForm(true); setViewType("all"); }}
              >
                + Add Event
              </button>
            )}
          </div>
        </div>

        <div className="events-body">

          <div className="events-sidebar">
            <h3>SEARCH</h3>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <h3>Sort By</h3>
            <p><input type="radio" name="sort" onChange={() => setSortType("newest")} /> Date: Newest</p>
            <p><input type="radio" name="sort" onChange={() => setSortType("oldest")} /> Date: Oldest</p>
            <p><input type="radio" name="sort" onChange={() => setSortType("az")} /> Name A-Z</p>
            <p><input type="radio" name="sort" onChange={() => setSortType("za")} /> Name Z-A</p>
          </div>

          <div className="events-content">

            {/* ADD EVENT FORM — admin only */}
            {showAddForm && isAdmin && (
              <div className="events-add-form">
                <div className="events-add-form-header">
                  <h2>Add New Event</h2>
                  <button className="events-add-form-close" onClick={handleCloseForm}>x</button>
                </div>

                <div className="events-add-form-grid">
                  <div className="events-form-field">
                    <label>Event Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Sports Day"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="events-form-field">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>

                  <div className="events-form-field">
                    <label>Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                  </div>

                  <div className="events-form-field">
                    <label>Location *</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Auditorium"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>

                  <div className="events-form-field full-width">
                    <label>Description</label>
                    <textarea
                      placeholder="Brief description of the event..."
                      value={form.description}
                      rows={3}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="events-form-field full-width">
                    <label>Event Poster</label>
                    <label className="events-poster-upload-label">
                      Choose Poster from Files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                    {posterPreview && (
                      <div className="events-poster-preview-wrapper">
                        <img src={posterPreview} alt="Poster Preview" />
                        <button
                          className="events-poster-remove-btn"
                          onClick={() => { setPosterPreview(null); setForm({ ...form, image: "" }); }}
                        >
                          x
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="events-add-form-actions">
                  <button className="events-btn-publish" onClick={handleAddEvent}>
                    Publish Event
                  </button>
                  <button className="events-btn-cancel" onClick={handleCloseForm}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <h1 style={{ marginBottom: "30px" }}>
              {viewType === "all" ? "EXPLORE UPCOMING COLLEGE EVENTS" : "YOUR ENROLLED EVENTS"}
            </h1>

            {loadingEvents ? (
              <p className="events-empty">Loading events...</p>
            ) : (
              <div className="events-grid">
                {displayEvents.map((event) => (
                  <div key={event.id} className="events-card">
                    <img
                      src={event.image || "https://via.placeholder.com/140x180?text=No+Poster"}
                      alt="poster"
                    />
                    <div className="events-card-info">
                      <h3>{event.title}</h3>
                      <p><strong>Date:</strong> {event.date}</p>
                      {event.time && <p><strong>Time:</strong> {event.time}</p>}
                      <p><strong>Location:</strong> {event.location}</p>
                      <p>{event.description}</p>

                      {viewType === "all" && !isAdmin && (
                        <button
                          className="events-btn-enroll"
                          onClick={() => handleEnroll(event)}
                        >
                          Enroll Now
                        </button>
                      )}

                      {viewType === "enrolled" && (
                        <button
                          className="events-btn-enroll"
                          style={{ background: "#e74c3c" }}
                          onClick={() => handleUnenroll(event.id)}
                        >
                          Unenroll
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {displayEvents.length === 0 && (
                  <p className="events-empty">
                    {viewType === "enrolled"
                      ? "You have not enrolled in any events yet."
                      : "No events found."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;