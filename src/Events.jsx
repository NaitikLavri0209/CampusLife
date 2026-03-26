import React, { useState, useEffect, useRef } from "react";
import Particles from "./Particles";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, doc, setDoc,
  deleteDoc, query, orderBy, getDocs, getDoc, updateDoc,
} from "firebase/firestore";
import "./index.css";

function isEventPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate < today;
}

function Events({ setPage, currentUser, onOpenAttendance }) {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [viewType, setViewType] = useState("all");
  const [enrolledTab, setEnrolledTab] = useState("upcoming");
  const [adminEventsTab, setAdminEventsTab] = useState("upcoming");
  const [showAddForm, setShowAddForm] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [events, setEvents] = useState([]);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventEnrollments, setEventEnrollments] = useState({});
  const [expandedEnrollments, setExpandedEnrollments] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const menuRef = useRef(null);

  const isAdmin = currentUser?.role === "admin";

  const [form, setForm] = useState({
    title: "", date: "", time: "", location: "", description: "", image: "", certificateTemplate: "",
  });
  const [editForm, setEditForm] = useState({
    title: "", date: "", time: "", location: "", description: "",
  });

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (fetched.length === 0) seedDefaultEvents();
      else setEvents(fetched);
      setLoadingEvents(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = collection(db, "users", currentUser.uid, "enrolledEvents");
    const unsub = onSnapshot(q, (snapshot) => {
      setEnrolledEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribers = [];
    const loadEnrollments = async () => {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      eventsSnapshot.forEach((eventDoc) => {
        const eventData = eventDoc.data();
        if (eventData.createdBy !== currentUser.uid) return;
        const eventId = eventDoc.id;
        const enrollRef = collection(db, "events", eventId, "enrollments");
        const unsub = onSnapshot(enrollRef, (snap) => {
          setEventEnrollments((prev) => ({ ...prev, [eventId]: snap.docs.map((d) => d.data()) }));
        });
        unsubscribers.push(unsub);
      });
    };
    loadEnrollments();
    return () => unsubscribers.forEach((u) => u());
  }, [isAdmin, events]);

  const seedDefaultEvents = async () => {
    const defaults = [
      { title: "TECH INNOVATE FEST 2024", image: "https://images.unsplash.com/photo-1518770660439-4636190af475", date: "2024-10-25", time: "9:00 AM", location: "College Auditorium & Labs", description: "Join us for coding, innovation, competitions and networking.", createdAt: Date.now() },
      { title: "ART & CRAFT NIGHT", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", date: "2024-10-26", time: "6:00 PM", location: "College Auditorium & Labs", description: "Creative event with workshops and exhibitions.", createdAt: Date.now() },
      { title: "STARTUP SYMPOSIUM", image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7", date: "2024-10-20", time: "10:00 AM", location: "College Auditorium & Labs", description: "Meet founders and pitch your ideas.", createdAt: Date.now() },
      { title: "CULTURAL GALA 2024", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745", date: "2024-10-28", time: "7:00 PM", location: "College Auditorium & Labs", description: "Music, dance and cultural celebration night.", createdAt: Date.now() },
    ];
    for (const event of defaults) await addDoc(collection(db, "events"), event);
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
    setForm({ title: "", date: "", time: "", location: "", description: "", image: "", certificateTemplate: "" });
    setPosterPreview(null);
    setCertPreview(null);
    setShowAddForm(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    await deleteDoc(doc(db, "events", eventId));
    setOpenMenuId(null);
  };

  const handleOpenEdit = (event) => {
    setEditForm({ title: event.title, date: event.date, time: event.time || "", location: event.location, description: event.description || "" });
    setEditingEvent(event);
    setOpenMenuId(null);
  };

 const handleSaveEdit = async () => {
  if (!editForm.title || !editForm.date || !editForm.location) {
    alert("Title, Date, and Location are required.");
    return;
  }

  // Update main event
  await updateDoc(doc(db, "events", editingEvent.id), { ...editForm });

  // Update copy in every enrolled student's subcollection
  const enrollmentsSnap = await getDocs(
    collection(db, "events", editingEvent.id, "enrollments")
  );
  const updatePromises = enrollmentsSnap.docs.map((enrollDoc) =>
    updateDoc(
      doc(db, "users", enrollDoc.id, "enrolledEvents", editingEvent.id),
      { ...editForm }
    )
  );
  await Promise.all(updatePromises);

  setEditingEvent(null);
};

  const handleEnroll = async (event) => {
    if (!currentUser) { alert("Please login to enroll."); return; }
    if (enrolledEvents.some((e) => e.id === event.id)) { alert("Already enrolled."); return; }
    const userSnap = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userSnap.exists() ? userSnap.data() : {};
    await setDoc(doc(db, "users", currentUser.uid, "enrolledEvents", event.id), { ...event, enrolledAt: Date.now() });
    await setDoc(doc(db, "events", event.id, "enrollments", currentUser.uid), {
      uid: currentUser.uid,
      name: userData.name || currentUser.name || "Unknown",
      studentId: userData.studentId || "",
      enrolledAt: Date.now(),
    });
  };

  const handleUnenroll = async (eventId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, "users", currentUser.uid, "enrolledEvents", eventId));
    await deleteDoc(doc(db, "events", eventId, "enrollments", currentUser.uid));
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectURL = URL.createObjectURL(file);
    setPosterPreview(objectURL);
    setForm({ ...form, image: objectURL });
  };

  const handleCertUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCertPreview(ev.target.result);
      setForm({ ...form, certificateTemplate: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCSV = (event) => {
    const enrollments = eventEnrollments[event.id] || [];
    if (enrollments.length === 0) { alert("No students enrolled yet."); return; }
    const headers = ["#", "Name", "Student ID", "Enrolled At"];
    const rows = enrollments.map((s, i) => [i + 1, s.name, s.studentId, s.enrolledAt ? new Date(s.enrolledAt).toLocaleString() : ""]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}_enrollments.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleEnrollmentList = (eventId) => {
    setExpandedEnrollments((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const enrolledIds = enrolledEvents.map((e) => e.id);

  let filteredEvents = events.filter(
    (e) => e.title.toLowerCase().includes(search.toLowerCase()) && !enrolledIds.includes(e.id) && !isEventPast(e.date)
  );
  if (sortType === "newest") filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortType === "oldest") filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sortType === "az") filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
  if (sortType === "za") filteredEvents.sort((a, b) => b.title.localeCompare(a.title));

  const upcomingEnrolled = enrolledEvents.filter((e) => !isEventPast(e.date));
  const completedEnrolled = enrolledEvents.filter((e) => isEventPast(e.date));
  const enrolledDisplay = enrolledTab === "upcoming" ? upcomingEnrolled : completedEnrolled;

  let adminAllEvents = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
  if (sortType === "newest") adminAllEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortType === "oldest") adminAllEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sortType === "az") adminAllEvents.sort((a, b) => a.title.localeCompare(b.title));
  if (sortType === "za") adminAllEvents.sort((a, b) => b.title.localeCompare(a.title));

  const adminUpcoming = adminAllEvents.filter((e) => !isEventPast(e.date));
  const adminPast = adminAllEvents.filter((e) => isEventPast(e.date));
  const adminDisplay = adminEventsTab === "upcoming" ? adminUpcoming : adminPast;

  const displayEvents = isAdmin ? adminDisplay : viewType === "all" ? filteredEvents : enrolledDisplay;


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
            {!isAdmin && (
              <>
                <button className={`events-btn-tab ${viewType === "all" ? "active" : "inactive"}`} onClick={() => setViewType("all")}>All Events</button>
                <button className={`events-btn-tab ${viewType === "enrolled" ? "active" : "inactive"}`} onClick={() => setViewType("enrolled")}>Enrolled Events ({enrolledEvents.length})</button>
              </>
            )}
            {isAdmin && (
              <button className="events-btn-add" onClick={() => setShowAddForm(true)}>+ Add Event</button>
            )}
          </div>
        </div>

        <div className="events-body">
          <div className="events-sidebar">
            <h3>SEARCH</h3>
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <h3>Sort By</h3>
            <p><input type="radio" name="sort" onChange={() => setSortType("newest")} /> Date: Newest</p>
            <p><input type="radio" name="sort" onChange={() => setSortType("oldest")} /> Date: Oldest</p>
            <p><input type="radio" name="sort" onChange={() => setSortType("az")} /> Name A-Z</p>
            <p><input type="radio" name="sort" onChange={() => setSortType("za")} /> Name Z-A</p>
          </div>

          <div className="events-content">

            {/* EDIT EVENT MODAL */}
            {editingEvent && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#1a1a2e", border: "1px solid #444", borderRadius: "12px", padding: "32px", width: "480px", maxWidth: "95vw" }}>
                  <h2 style={{ color: "#fff", marginBottom: "20px" }}>Edit Event</h2>
                  {[
                    { label: "Event Title *", key: "title", type: "text", placeholder: "e.g. Annual Sports Day" },
                    { label: "Date *", key: "date", type: "date" },
                    { label: "Time", key: "time", type: "time" },
                    { label: "Location *", key: "location", type: "text", placeholder: "e.g. Main Auditorium" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} style={{ marginBottom: "14px" }}>
                      <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "4px" }}>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder || ""}
                        value={editForm[key]}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        style={{ width: "100%", padding: "10px", background: "#0d0d1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "4px" }}>Description</label>
                    <textarea
                      value={editForm.description}
                      rows={3}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "#0d0d1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button onClick={() => setEditingEvent(null)} style={{ padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleSaveEdit} style={{ padding: "10px 20px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}

            {/* ADD EVENT FORM */}
            {showAddForm && isAdmin && (
              <div className="events-add-form">
                <div className="events-add-form-header">
                  <h2>Add New Event</h2>
                  <button className="events-add-form-close" onClick={() => { setShowAddForm(false); setPosterPreview(null); setCertPreview(null); }}>x</button>
                </div>
                <div className="events-add-form-grid">
                  {[
                    { label: "Event Title *", key: "title", type: "text", placeholder: "e.g. Annual Sports Day" },
                    { label: "Date *", key: "date", type: "date" },
                    { label: "Time", key: "time", type: "time" },
                    { label: "Location *", key: "location", type: "text", placeholder: "e.g. Main Auditorium" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="events-form-field">
                      <label>{label}</label>
                      <input type={type} placeholder={placeholder || ""} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div className="events-form-field full-width">
                    <label>Description</label>
                    <textarea placeholder="Brief description..." value={form.description} rows={3} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="events-form-field full-width">
                    <label>Event Poster</label>
                    <label className="events-poster-upload-label">
                      Choose Poster from Files
                      <input type="file" accept="image/*" onChange={handlePosterUpload} style={{ display: "none" }} />
                    </label>
                    {posterPreview && (
                      <div className="events-poster-preview-wrapper">
                        <img src={posterPreview} alt="Poster Preview" />
                        <button className="events-poster-remove-btn" onClick={() => { setPosterPreview(null); setForm({ ...form, image: "" }); }}>x</button>
                      </div>
                    )}
                  </div>
                  {/* Certificate Template Upload */}
                  <div className="events-form-field full-width">
                    <label>🎓 Certificate Template <span style={{ fontSize: "12px", color: "#aaa" }}>(student name will be auto-placed)</span></label>
                    <label className="events-poster-upload-label" style={{ background: "#1a3a1a", borderColor: "#2d6a2d" }}>
                      Upload Certificate Template
                      <input type="file" accept="image/*" onChange={handleCertUpload} style={{ display: "none" }} />
                    </label>
                    {certPreview && (
                      <div className="events-poster-preview-wrapper">
                        <img src={certPreview} alt="Certificate Template" style={{ maxHeight: "120px" }} />
                        <button className="events-poster-remove-btn" onClick={() => { setCertPreview(null); setForm({ ...form, certificateTemplate: "" }); }}>x</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="events-add-form-actions">
                  <button className="events-btn-publish" onClick={handleAddEvent}>Publish Event</button>
                  <button className="events-btn-cancel" onClick={() => { setShowAddForm(false); setPosterPreview(null); setCertPreview(null); }}>Cancel</button>
                </div>
              </div>
            )}

            <h1 style={{ marginBottom: "20px" }}>
              {isAdmin ? "ALL COLLEGE EVENTS" : viewType === "all" ? "EXPLORE UPCOMING COLLEGE EVENTS" : "YOUR ENROLLED EVENTS"}
            </h1>

            {/* Admin tabs */}
            {isAdmin && (
              <div className="events-enrolled-tabs">
                <button className={`events-enrolled-tab ${adminEventsTab === "upcoming" ? "active" : ""}`} onClick={() => setAdminEventsTab("upcoming")}>Upcoming ({adminUpcoming.length})</button>
                <button className={`events-enrolled-tab ${adminEventsTab === "past" ? "active" : ""}`} onClick={() => setAdminEventsTab("past")}>Past ({adminPast.length})</button>
              </div>
            )}

            {/* Student enrolled sub-tabs */}
            {!isAdmin && viewType === "enrolled" && (
              <div className="events-enrolled-tabs">
                <button className={`events-enrolled-tab ${enrolledTab === "upcoming" ? "active" : ""}`} onClick={() => setEnrolledTab("upcoming")}>Upcoming ({upcomingEnrolled.length})</button>
                <button className={`events-enrolled-tab ${enrolledTab === "completed" ? "active" : ""}`} onClick={() => setEnrolledTab("completed")}>Completed ({completedEnrolled.length})</button>
              </div>
            )}

            {loadingEvents ? (
              <p className="events-empty">Loading events...</p>
            ) : (
              <div className="events-grid">
                {displayEvents.map((event) => {
                  const isMyEvent = event.createdBy === currentUser?.uid;
                  const enrollments = eventEnrollments[event.id] || [];
                  const isExpanded = expandedEnrollments[event.id] || false;
                  const isPast = isEventPast(event.date);
                  const generateStudentCertificate = async (event) => {
  if (!event.certificateTemplate) {
    alert("No certificate template for this event.");
    return;
  }

  const studentName = currentUser?.name || "Student";

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = event.certificateTemplate;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);

  const nameY = canvas.height * 0.52;
  const fontSize = Math.max(36, Math.floor(canvas.width * 0.045));
  ctx.font = `bold ${fontSize}px Georgia, serif`;
  ctx.fillStyle = "#2c3e50";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(studentName, canvas.width / 2, nameY);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  const link = document.createElement("a");
  link.download = `${event.title}_certificate_${studentName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

                  return (
                    <div key={event.id} className="events-card" style={{ opacity: isPast && !isAdmin && viewType === "enrolled" && enrolledTab === "completed" ? 0.7 : 1, position: "relative" }}>

                      {/* THREE DOTS MENU — admin only, own events */}
                      {isAdmin && isMyEvent && (
                        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }} ref={openMenuId === event.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid #555", borderRadius: "6px", color: "#fff", fontSize: "18px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                          >
                            ⋮
                          </button>
                          {openMenuId === event.id && (
                            <div style={{ position: "absolute", right: 0, top: "36px", background: "#1e1e2e", border: "1px solid #444", borderRadius: "8px", minWidth: "160px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                              <button
                                onClick={() => handleOpenEdit(event)}
                                style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", color: "#fff", cursor: "pointer", textAlign: "left", fontSize: "14px" }}
                                onMouseEnter={(e) => e.target.style.background = "#2a2a3e"}
                                onMouseLeave={(e) => e.target.style.background = "transparent"}
                              >✏️ Edit Event</button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", color: "#e74c3c", cursor: "pointer", textAlign: "left", fontSize: "14px" }}
                                onMouseEnter={(e) => e.target.style.background = "#2a2a3e"}
                                onMouseLeave={(e) => e.target.style.background = "transparent"}
                              >🗑️ Delete Event</button>
                              {isPast && (
                                <button
                                  onClick={() => { onOpenAttendance(event); setOpenMenuId(null); }}
                                  style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", color: "#2ecc71", cursor: "pointer", textAlign: "left", fontSize: "14px" }}
                                  onMouseEnter={(e) => e.target.style.background = "#2a2a3e"}
                                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                                >📋 Attendance</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ position: "relative" }}>
                        <img src={event.image || "https://via.placeholder.com/140x180?text=No+Poster"} alt="poster" />
                        {isPast && !isAdmin && viewType === "enrolled" && enrolledTab === "completed" && (
                          <div className="events-completed-badge">Completed</div>
                        )}
                        {isAdmin && isPast && <div className="events-completed-badge">Past</div>}
                      </div>

                      <div className="events-card-info">
                        <h3>{event.title}</h3>
                        <p><strong>Date:</strong> {event.date}</p>
                        {event.time && <p><strong>Time:</strong> {event.time}</p>}
                        <p><strong>Location:</strong> {event.location}</p>
                        <p>{event.description}</p>

                        {!isAdmin && viewType === "all" && (
                          <button className="events-btn-enroll" onClick={() => handleEnroll(event)}>Enroll Now</button>
                        )}
                        {!isAdmin && viewType === "enrolled" && enrolledTab === "upcoming" && (
                          <button className="events-btn-enroll" style={{ background: "#e74c3c" }} onClick={() => handleUnenroll(event.id)}>Unenroll</button>
                        )}
                        {!isAdmin && viewType === "enrolled" && enrolledTab === "completed" && (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
    <div className="events-attended-badge">✓ Attended</div>
    {event.certificateTemplate ? (
      <button
        className="events-btn-enroll"
        style={{ background: "#6c63ff", fontSize: "13px", padding: "8px 14px" }}
        onClick={() => generateStudentCertificate(event)}
      >
        🎓 Download Certificate
      </button>
    ) : (
      <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>No certificate available</p>
    )}
  </div>
)}

                        {isAdmin && isMyEvent && (
                          <div className="events-enrollments-panel">
                            <button className="events-enrollments-toggle" onClick={() => toggleEnrollmentList(event.id)}>
                              {enrollments.length} Enrolled Student{enrollments.length !== 1 ? "s" : ""} {isExpanded ? "▲" : "▼"}
                            </button>
                            {isExpanded && (
                              <div className="events-enrollments-list">
                                {enrollments.length === 0 ? (
                                  <p className="events-enrollments-empty">No students enrolled yet.</p>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleDownloadCSV(event)}
                                      style={{ marginBottom: "8px", padding: "6px 14px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                                    >Download as CSV</button>
                                    <table className="events-enrollments-table">
                                      <thead><tr><th>#</th><th>Name</th><th>Student ID</th></tr></thead>
                                      <tbody>
                                        {enrollments.map((s, i) => (
                                          <tr key={s.uid}><td>{i + 1}</td><td>{s.name}</td><td>{s.studentId}</td></tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {isAdmin && !isMyEvent && (
                          <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>Added by another admin</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {displayEvents.length === 0 && (
                  <p className="events-empty">
                    {isAdmin ? adminEventsTab === "upcoming" ? "No upcoming events." : "No past events."
                      : viewType === "enrolled" ? enrolledTab === "upcoming" ? "No upcoming enrolled events." : "No completed events yet."
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