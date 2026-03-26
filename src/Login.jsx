import React, { useState } from "react";
import ElectricBorder from "./ElectricBorder";
import Particles from "./Particles";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Login({ setPage, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Fetch user doc from Firestore to get actual role and studentId
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const actualRole = userData.role || role;

      // If selected role doesn't match Firestore role, block login
      if (actualRole !== role) {
        setError(`This account is not registered as ${role === "admin" ? "an Admin" : "a Student"}.`);
        setLoading(false);
        return;
      }

      setCurrentUser({
        uid: user.uid,
        name: userData.name || user.displayName || user.email.split("@")[0],
        email: user.email,
        role: actualRole,
        studentId: userData.studentId || "",
      });

      setPage("loading");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") setError("No account found with this email.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotMsg("Password reset email sent. Please check your inbox.");
      setForgotEmail("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") setForgotError("No account found with this email.");
      else if (err.code === "auth/invalid-email") setForgotError("Invalid email address.");
      else setForgotError("Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full h-screen relative flex justify-center items-center bg-black">

      <div className="absolute inset-0">
        <Particles particleColors={["#ffffff"]} particleCount={120} />
      </div>

      <div className="relative flex flex-col items-center text-white" style={{ zIndex: 5 }}>

        <h2 className="text-4xl font-bold mb-8 text-[#B19EEF]">Login</h2>

        <ElectricBorder color="#FFFFFF" speed={1} chaos={0.12} thickness={2} style={{ borderRadius: 16 }}>

          {/* ── FORGOT PASSWORD PANEL ── */}
          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="p-8 flex flex-col gap-6 w-80">
              <h3 style={{ margin: 0, color: "#B19EEF", fontSize: "18px" }}>
                Reset Password
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                Enter your registered email and we will send you a reset link.
              </p>

              <div className="flex flex-col">
                <label className="mb-1 text-[#FFFFFF]">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition"
                />
              </div>

              {forgotMsg && (
                <p style={{ color: "#6bffb8", fontSize: "13px", margin: 0 }}>
                  {forgotMsg}
                </p>
              )}
              {forgotError && (
                <p style={{ color: "#ff6b6b", fontSize: "13px", margin: 0 }}>
                  {forgotError}
                </p>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="mt-2 bg-[#FFFFFF]/20 border border-[#FFFFFF] rounded py-2 hover:bg-[#FFFFFF]/30 transition"
              >
                {forgotLoading ? "Sending..." : "Send Reset Email"}
              </button>

              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotMsg(""); setForgotError(""); }}
                className="text-sm underline text-[#B19EEF]"
              >
                Back to Login
              </button>
            </form>

          ) : (

            /* ── MAIN LOGIN FORM ── */
            <form onSubmit={handleLogin} className="p-8 flex flex-col gap-6 w-80">

              {/* Role Selector */}
              <div className="flex flex-col">
                <label className="mb-2 text-[#FFFFFF]">Login As</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: role === "student" ? "2px solid #B19EEF" : "1px solid rgba(255,255,255,0.3)",
                      background: role === "student" ? "rgba(177,158,239,0.2)" : "rgba(255,255,255,0.05)",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: role === "student" ? "bold" : "normal",
                      transition: "all 0.2s",
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: role === "admin" ? "2px solid #B19EEF" : "1px solid rgba(255,255,255,0.3)",
                      background: role === "admin" ? "rgba(177,158,239,0.2)" : "rgba(255,255,255,0.05)",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: role === "admin" ? "bold" : "normal",
                      transition: "all 0.2s",
                    }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-1 text-[#FFFFFF]">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="mb-1 text-[#FFFFFF]">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition"
                />
              </div>

              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={() => { setShowForgot(true); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#B19EEF",
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "right",
                  padding: 0,
                  textDecoration: "underline",
                  marginTop: "-16px",
                }}
              >
                Forgot Password?
              </button>

              {error && (
                <p style={{ color: "#ff6b6b", fontSize: "13px", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-[#FFFFFF]/20 border border-[#FFFFFF] rounded py-2 hover:bg-[#FFFFFF]/30 transition"
              >
                {loading ? "Logging in..." : `Login as ${role === "admin" ? "Admin" : "Student"}`}
              </button>

              <button
                type="button"
                onClick={() => setPage("landing")}
                className="text-sm underline text-[#FFFFFF]"
              >
                Back
              </button>

            </form>
          )}

        </ElectricBorder>
      </div>
    </div>
  );
}

export default Login;