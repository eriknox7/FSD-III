import { useState, useMemo } from "react";

// ---------- Sample seed data ----------
const seedStudents = [
  { id: 1, name: "Ananya Sharma", roll: "CSE21001", course: "B.Tech CSE", year: "3rd Year", email: "ananya.sharma@mail.edu", grade: "A" },
  { id: 2, name: "Rohan Patil", roll: "CSE21014", course: "B.Tech CSE", year: "3rd Year", email: "rohan.patil@mail.edu", grade: "B+" },
  { id: 3, name: "Fatima Khan", roll: "CSE21027", course: "B.Tech CSE", year: "3rd Year", email: "fatima.khan@mail.edu", grade: "A+" },
  { id: 4, name: "Vikram Desai", roll: "CSE21033", course: "B.Tech IT", year: "2nd Year", email: "vikram.desai@mail.edu", grade: "B" },
  { id: 5, name: "Sara Sheikh", roll: "CSE21041", course: "B.Tech AI/DS", year: "1st Year", email: "sara.sheikh@mail.edu", grade: "A" },
];

const blankForm = { name: "", roll: "", course: "", year: "", email: "", grade: "" };

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function avatarHue(name) {
  const hues = ["#2F6F4E", "#B7791F", "#3B6FA0", "#8B4A62", "#5B5F97"];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return hues[sum % hues.length];
}

// ---------- StatCard ----------
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ---------- SlideOver form: add / edit ----------
function SlideOverForm({ open, formData, onChange, onSubmit, onClose, isEditing, errors }) {
  return (
    <div className={`overlay ${open ? "open" : ""}`} onClick={onClose}>
      <div className={`slide-panel ${open ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="slide-header">
          <h2>{isEditing ? "Edit student" : "Add student"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={onSubmit} className="slide-form">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={formData.name} onChange={onChange} placeholder="e.g. Meera Iyer" autoFocus />
            {errors.name && <span className="err">{errors.name}</span>}
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="roll">Roll number</label>
              <input id="roll" name="roll" value={formData.roll} onChange={onChange} placeholder="CSE21045" />
              {errors.roll && <span className="err">{errors.roll}</span>}
            </div>
            <div className="field">
              <label htmlFor="grade">Grade</label>
              <input id="grade" name="grade" value={formData.grade} onChange={onChange} placeholder="A" />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="course">Course</label>
              <input id="course" name="course" value={formData.course} onChange={onChange} placeholder="B.Tech CSE" />
              {errors.course && <span className="err">{errors.course}</span>}
            </div>
            <div className="field">
              <label htmlFor="year">Year</label>
              <input id="year" name="year" value={formData.year} onChange={onChange} placeholder="2nd Year" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" value={formData.email} onChange={onChange} placeholder="meera.iyer@mail.edu" />
            {errors.email && <span className="err">{errors.email}</span>}
          </div>

          <div className="slide-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{isEditing ? "Save changes" : "Add student"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- StudentRow ----------
function StudentRow({ student, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="row">
      <div className="row-main">
        <div className="avatar" style={{ background: avatarHue(student.name) }}>{initials(student.name)}</div>
        <div className="row-id">
          <div className="row-name">{student.name}</div>
          <div className="row-email">{student.email || "No email on file"}</div>
        </div>
      </div>
      <div className="row-cell roll">{student.roll}</div>
      <div className="row-cell">{student.course || "—"}</div>
      <div className="row-cell">{student.year || "—"}</div>
      <div className="row-cell">
        {student.grade ? <span className="grade-badge">{student.grade}</span> : <span className="dim">—</span>}
      </div>
      <div className="row-menu">
        <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Actions">⋯</button>
        {menuOpen && (
          <div className="menu" onMouseLeave={() => setMenuOpen(false)}>
            <button onClick={() => { onEdit(student); setMenuOpen(false); }}>Edit</button>
            <button className="danger" onClick={() => { onDelete(student.id); setMenuOpen(false); }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function StudentManagementSystem() {
  const [students, setStudents] = useState(seedStudents);
  const [formData, setFormData] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2200);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(data) {
    const next = {};
    if (!data.name.trim()) next.name = "Name is required.";
    if (!data.roll.trim()) next.roll = "Roll number is required.";
    if (!data.course.trim()) next.course = "Course is required.";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) next.email = "Enter a valid email.";
    const duplicateRoll = students.some(
      (s) => s.roll.toLowerCase() === data.roll.trim().toLowerCase() && s.id !== editingId
    );
    if (duplicateRoll) next.roll = "This roll number already exists.";
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (editingId !== null) {
      setStudents((prev) => prev.map((s) => (s.id === editingId ? { ...formData, id: editingId } : s)));
      showToast("Changes saved");
    } else {
      setStudents((prev) => [...prev, { ...formData, id: Date.now() }]);
      showToast("Student added");
    }
    closePanel();
  }

  function openAddPanel() {
    setFormData(blankForm);
    setEditingId(null);
    setErrors({});
    setPanelOpen(true);
  }

  function openEditPanel(student) {
    setFormData({
      name: student.name,
      roll: student.roll,
      course: student.course,
      year: student.year,
      email: student.email,
      grade: student.grade,
    });
    setEditingId(student.id);
    setErrors({});
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  function handleDelete(id) {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) closePanel();
    showToast("Student removed");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
    );
  }, [students, search]);

  const avgGrade = useMemo(() => {
    const map = { "A+": 4.3, A: 4, "B+": 3.3, B: 3, "C+": 2.3, C: 2, D: 1 };
    const scored = students.map((s) => map[s.grade]).filter((v) => v !== undefined);
    if (scored.length === 0) return "—";
    return (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1);
  }, [students]);

  const courseCount = useMemo(() => new Set(students.map((s) => s.course).filter(Boolean)).size, [students]);

  return (
    <div className="sms-root">
      <style>{`
        .sms-root {
          --bg: #F4F5F7;
          --surface: #FFFFFF;
          --border: #E6E8EC;
          --ink: #16181D;
          --ink-soft: #6B7280;
          --ink-faint: #9CA3AF;
          --accent: #2F6F4E;
          --accent-soft: #E7F0EA;
          --accent-dark: #1F4F37;
          --danger: #B4413A;
          --danger-soft: #FBEAE8;
          --radius: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          padding: 2.5rem 1.5rem 4rem;
        }
        .sms-inner { max-width: 980px; margin: 0 auto; }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .top-bar h1 {
          font-size: 22px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .top-bar p {
          margin: 3px 0 0;
          font-size: 14px;
          color: var(--ink-soft);
        }
        .btn-primary {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-primary:hover { background: var(--accent-dark); }
        .btn-secondary {
          background: var(--surface);
          color: var(--ink);
          border: 1px solid var(--border);
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover { border-color: #C9CDD4; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px 18px;
        }
        .stat-value { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
        .stat-label { font-size: 13px; color: var(--ink-soft); margin-top: 2px; }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.9rem;
          gap: 12px;
        }
        .search-input {
          width: 100%;
          max-width: 320px;
          padding: 9px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          background: var(--surface);
        }
        .search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

        .list-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .list-head {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 0.9fr 0.7fr 40px;
          gap: 8px;
          padding: 10px 18px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-faint);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border-bottom: 1px solid var(--border);
        }
        .row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 0.9fr 0.7fr 40px;
          gap: 8px;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .row:last-child { border-bottom: none; }
        .row:hover { background: #FAFAFB; }
        .row-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .row-id { min-width: 0; }
        .row-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .row-email { font-size: 12px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .row-cell { font-size: 13.5px; color: var(--ink); }
        .row-cell.roll { font-variant-numeric: tabular-nums; color: var(--ink-soft); }
        .dim { color: var(--ink-faint); }
        .grade-badge {
          display: inline-block;
          background: var(--accent-soft);
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .row-menu { position: relative; display: flex; justify-content: flex-end; }
        .icon-btn {
          background: none;
          border: none;
          font-size: 16px;
          color: var(--ink-soft);
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover { background: #EFEFF1; }
        .menu {
          position: absolute;
          top: 32px;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(20,20,25,0.08);
          z-index: 5;
          min-width: 120px;
          overflow: hidden;
        }
        .menu button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 9px 12px;
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink);
        }
        .menu button:hover { background: #F5F5F6; }
        .menu button.danger { color: var(--danger); }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--ink-soft);
        }
        .empty-state p:first-child { font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .empty-state p { margin: 0; font-size: 13.5px; }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 17, 21, 0);
          pointer-events: none;
          transition: background 0.2s ease;
          z-index: 20;
        }
        .overlay.open { background: rgba(15, 17, 21, 0.32); pointer-events: auto; }
        .slide-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: 380px;
          max-width: 92vw;
          background: var(--surface);
          box-shadow: -8px 0 32px rgba(20,20,25,0.12);
          transform: translateX(100%);
          transition: transform 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .slide-panel.open { transform: translateX(0); }
        .slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid var(--border);
        }
        .slide-header h2 { font-size: 17px; font-weight: 600; margin: 0; }
        .slide-form { padding: 20px 22px; overflow-y: auto; flex: 1; }
        .field { margin-bottom: 16px; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--ink-soft); margin-bottom: 5px; }
        .field input {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 11px;
          border: 1px solid var(--border);
          border-radius: 7px;
          font-size: 14px;
          background: #FCFCFD;
          color: var(--ink);
        }
        .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .err { display: block; color: var(--danger); font-size: 12px; margin-top: 4px; }
        .slide-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ink);
          color: #fff;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          z-index: 30;
        }

        @media (max-width: 680px) {
          .stats-row { grid-template-columns: 1fr; }
          .list-head { display: none; }
          .row {
            grid-template-columns: 1fr 40px;
            grid-template-areas: "main menu" "meta meta";
            row-gap: 6px;
          }
          .row-main { grid-area: main; }
          .row-menu { grid-area: menu; }
          .row-cell { display: inline-flex; margin-right: 10px; }
          .row-cell::before { content: attr(data-label); color: var(--ink-faint); margin-right: 4px; font-size: 11px; }
        }
      `}</style>

      <div className="sms-inner">
        <div className="top-bar">
          <div>
            <h1>Student management system</h1>
            <p>Add, update, and remove student records</p>
          </div>
          <button className="btn-primary" onClick={openAddPanel}>+ Add student</button>
        </div>

        <div className="stats-row">
          <StatCard label="Total students" value={students.length} />
          <StatCard label="Courses offered" value={courseCount} />
          <StatCard label="Average grade points" value={avgGrade} />
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or roll number"
          />
        </div>

        <div className="list-container">
          {filtered.length > 0 && (
            <div className="list-head">
              <span>Student</span>
              <span>Roll no.</span>
              <span>Course</span>
              <span>Year</span>
              <span>Grade</span>
              <span></span>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No matching records</p>
              <p>Try a different search, or add a new student.</p>
            </div>
          ) : (
            filtered.map((s) => (
              <StudentRow key={s.id} student={s} onEdit={openEditPanel} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      <SlideOverForm
        open={panelOpen}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={closePanel}
        isEditing={editingId !== null}
        errors={errors}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
