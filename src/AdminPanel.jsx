import React, { useState } from "react";
import Particles from "./Particles";

function AdminPanel({ setPage, events, addEvent, updateEvent }) {
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    id: "",
    title: "",
    image: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

  const handleAdd = () => {
    addEvent({
      ...form,
      id: Date.now(),
      createdBy: "admin",
    });
    setTab("all");
  };

  const handleEdit = (event) => {
    setEditing(event.id);
    setForm(event);
    setTab("add");
  };

  const handleUpdate = () => {
    updateEvent(form);
    setEditing(null);
    setTab("all");
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", color: "white" }}>
      
      <div style={{ position: "absolute", inset: 0 }}>
        <Particles particleColors={["#ffffff"]} particleCount={120} />
      </div>

      <div style={{ position: "relative", zIndex: 5, padding: 40 }}>
        
        <button onClick={() => setPage("home")}>← Back</button>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => setTab("all")}>All Events</button>
          <button onClick={() => setTab("add")}>Add Event</button>
        </div>

        {tab === "all" &&
          events.map((e) => (
            <div key={e.id} style={{ marginTop: 20 }}>
              <h3>{e.title}</h3>
              <button onClick={() => handleEdit(e)}>Edit</button>
            </div>
          ))}

        {tab === "add" && (
          <div style={{ marginTop: 20 }}>
            <input placeholder="Title" onChange={(e)=>setForm({...form,title:e.target.value})}/>
            <input placeholder="Image URL" onChange={(e)=>setForm({...form,image:e.target.value})}/>
            <input placeholder="Date" onChange={(e)=>setForm({...form,date:e.target.value})}/>
            <input placeholder="Time" onChange={(e)=>setForm({...form,time:e.target.value})}/>
            <input placeholder="Location" onChange={(e)=>setForm({...form,location:e.target.value})}/>
            <textarea placeholder="About Event" onChange={(e)=>setForm({...form,description:e.target.value})}/>
            
            {editing ? (
              <button onClick={handleUpdate}>Update Event</button>
            ) : (
              <button onClick={handleAdd}>Add Event</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;