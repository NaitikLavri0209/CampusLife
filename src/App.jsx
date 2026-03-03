import React, { useState } from "react";
import LiquidEther from "./LiquidEther";
import ElectricBorder from "./ElectricBorder";
import Login from "./Login";
import Signup from "./SignUp";
import LoadingScreen from "./LoadingScreen";
import Home from "./Home";
import Help from "./Help";
import About from "./About";
import Events from "./Events";
import AdminPanel from "./AdminPanel";

function App() {
  const [page, setPage] = useState("landing");

  // 🔥 GLOBAL EVENTS STATE
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

  const addEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const updateEvent = (updatedEvent) => {
    setEvents(
      events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  };

  return (
    <div className="w-full min-h-screen relative bg-black overflow-hidden text-white">

      {page === "landing" && (
        <>
          <div style={{ position: "absolute", inset: 0 }}>
            <LiquidEther
              colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
              mouseForce={20}
              cursorSize={100}
              isViscous
              viscous={30}
              resolution={0.5}
              autoDemo
              autoSpeed={0.5}
            />
          </div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <h1 className="font-bold text-6xl mb-10">
              CampusLife: AI Integrated
            </h1>

            <div className="flex gap-8">
              <ElectricBorder>
                <button
                  className="font-bold py-4 px-10 text-lg"
                  onClick={() => setPage("login")}
                >
                  Login
                </button>
              </ElectricBorder>

              <ElectricBorder>
                <button
                  className="font-bold py-4 px-10 text-lg"
                  onClick={() => setPage("signup")}
                >
                  Signup
                </button>
              </ElectricBorder>
            </div>
          </div>
        </>
      )}

      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "loading" && <LoadingScreen setPage={setPage} />}
      {page === "home" && <Home setPage={setPage} />}
      {page === "help" && <Help setPage={setPage} />}
      {page === "about" && <About setPage={setPage} />}

      {page === "events" && (
        <Events
          setPage={setPage}
          events={events}
          enrolledEvents={enrolledEvents}
          enrollEvent={enrollEvent}
        />
      )}

      {page === "admin" && (
        <AdminPanel
          setPage={setPage}
          events={events}
          addEvent={addEvent}
          updateEvent={updateEvent}
        />
      )}
    </div>
  );
}

export default App;