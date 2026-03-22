import React, { useState } from "react";
import ElectricBorder from "./ElectricBorder";
import Particles from "./Particles";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Signup({ setPage, setCurrentUser }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Save display name to Firebase Auth profile
      await updateProfile(user, { displayName: name });

      // Save user details to Firestore users collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        studentId: studentId,
        email: email,
        role: "student",
        createdAt: Date.now(),
      });

      setCurrentUser({
        uid: user.uid,
        name: name,
        email: email,
        role: "student",
      });

      setPage("loading");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") setError("This email is already registered.");
      else if (err.code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen relative flex justify-center items-center bg-black">

      <div className="absolute inset-0">
        <Particles particleColors={["#ffffff"]} particleCount={120} />
      </div>

      <div className="relative flex flex-col items-center text-white" style={{ zIndex: 5 }}>

        <h2 className="text-4xl font-bold mb-8 text-[#B19EEF]">Sign Up</h2>

        <ElectricBorder color="#FFFFFF" speed={1} chaos={0.12} thickness={2} style={{ borderRadius: 16 }}>
          <form onSubmit={handleSignup} className="p-8 flex flex-col gap-6 w-80">

            <div className="flex flex-col">
              <label className="mb-1 text-[#FFFFFF]">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[#FFFFFF]">Student ID</label>
              <input
                type="text"
                required
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[#FFFFFF]">Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[#FFFFFF]">Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-[#FFFFFF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
              />
            </div>

            {error && (
              <p style={{ color: "#ff6b6b", fontSize: "13px", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-[#FFFFFF]/20 border border-[#FFFFFF] rounded py-2 hover:bg-[#FFFFFF]/30 transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <button
              type="button"
              onClick={() => setPage("landing")}
              className="text-sm mt-2 underline text-[#FFFFFF]"
            >
              Back
            </button>

          </form>
        </ElectricBorder>
      </div>
    </div>
  );
}

export default Signup;