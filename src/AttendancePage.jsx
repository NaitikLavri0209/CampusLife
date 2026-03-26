import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, onSnapshot, doc, updateDoc, getDoc,
} from "firebase/firestore";

function AttendancePage({ event, currentUser, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    const ref = collection(db, "events", event.id, "enrollments");
    const unsub = onSnapshot(ref, (snap) => {
      setStudents(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [event.id]);

  const toggleAttendance = async (student) => {
    const ref = doc(db, "events", event.id, "enrollments", student.uid);
    await updateDoc(ref, { attended: !student.attended });
  };

  const downloadCSV = () => {
    if (students.length === 0) { alert("No students enrolled."); return; }
    const headers = ["#", "Name", "Student ID", "Attended"];
    const rows = students.map((s, i) => [i + 1, s.name, s.studentId, s.attended ? "Yes" : "No"]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}_attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCertificate = async (student) => {
    if (!event.certificateTemplate) {
      alert("No certificate template was uploaded for this event.");
      return;
    }
    setGenerating((prev) => ({ ...prev, [student.uid]: true }));
    try {
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

      // Draw template
      ctx.drawImage(img, 0, 0);

      // AI-style name placement: centered, ~52% down vertically
      const nameY = canvas.height * 0.52;
      const fontSize = Math.max(36, Math.floor(canvas.width * 0.045));
      ctx.font = `bold ${fontSize}px Georgia, serif`;
      ctx.fillStyle = "#2c3e50";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow for elegance
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(student.name, canvas.width / 2, nameY);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Download
      const link = document.createElement("a");
      link.download = `${event.title}_certificate_${student.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to generate certificate. Please check the certificate template image.");
    }
    setGenerating((prev) => ({ ...prev, [student.uid]: false }));
  };

  const attended = students.filter((s) => s.attended).length;
  const absent = students.length - attended;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#fff", padding: "32px", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
        <button
          onClick={onBack}
          style={{ padding: "10px 20px", background: "#1e1e2e", border: "1px solid #444", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "14px" }}
        >
          ← Back to Events
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", color: "#a78bfa" }}>{event.title}</h1>
          <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>📅 {event.date} &nbsp; 📍 {event.location}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Total Enrolled", value: students.length, color: "#6c63ff" },
          { label: "Attended", value: attended, color: "#2ecc71" },
          { label: "Absent", value: absent, color: "#e74c3c" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#1a1a2e", border: `1px solid ${color}33`, borderRadius: "12px", padding: "16px 28px", minWidth: "130px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={downloadCSV}
          style={{ padding: "10px 20px", background: "#6c63ff", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
        >
          ⬇ Download Attendance CSV
        </button>
        {!event.certificateTemplate && (
          <p style={{ color: "#888", fontSize: "13px", alignSelf: "center", margin: 0 }}>
            ⚠️ No certificate template uploaded for this event.
          </p>
        )}
      </div>

      {/* Student Table */}
      {loading ? (
        <p style={{ color: "#aaa" }}>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={{ color: "#aaa" }}>No students enrolled in this event.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#1a1a2e", borderRadius: "12px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#12122a" }}>
                {["#", "Name", "Student ID", "Attendance", "Certificate"].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#a78bfa", fontWeight: "600", fontSize: "14px", borderBottom: "1px solid #333" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr key={student.uid} style={{ borderBottom: "1px solid #2a2a3e", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1e1e32"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", color: "#888", fontSize: "14px" }}>{i + 1}</td>
                  <td style={{ padding: "14px 16px", fontWeight: "500", fontSize: "15px" }}>{student.name}</td>
                  <td style={{ padding: "14px 16px", color: "#aaa", fontFamily: "monospace", fontSize: "14px" }}>{student.studentId || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => toggleAttendance(student)}
                      style={{
                        padding: "7px 16px",
                        background: student.attended ? "#1a3a1a" : "#2a1a1a",
                        border: `1px solid ${student.attended ? "#2ecc71" : "#e74c3c"}`,
                        borderRadius: "20px",
                        color: student.attended ? "#2ecc71" : "#e74c3c",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        minWidth: "100px",
                        transition: "all 0.2s",
                      }}
                    >
                      {student.attended ? "✓ Present" : "✗ Absent"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {student.attended ? (
                      <button
                        onClick={() => generateCertificate(student)}
                        disabled={generating[student.uid]}
                        style={{
                          padding: "7px 16px",
                          background: generating[student.uid] ? "#1a1a2e" : "#16213e",
                          border: "1px solid #a78bfa",
                          borderRadius: "20px",
                          color: "#a78bfa",
                          cursor: generating[student.uid] ? "not-allowed" : "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          transition: "all 0.2s",
                        }}
                      >
                        {generating[student.uid] ? "Generating..." : "🎓 Generate Certificate"}
                      </button>
                    ) : (
                      <span style={{ color: "#555", fontSize: "13px" }}>Mark present first</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;