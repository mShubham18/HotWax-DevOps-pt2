import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const emptyForm = {
  title: "",
  details: "",
  category: "task",
  status: "todo",
  priority: "medium",
  due_date: "",
  tags: "",
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const loadEntries = async () => {
    const res = await fetch(`${API_BASE_URL}/entries`);
    const data = await res.json();
    setEntries(data);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const queryMatch =
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        (entry.details || "").toLowerCase().includes(query.toLowerCase()) ||
        (entry.tags || "").toLowerCase().includes(query.toLowerCase());
      const statusMatch = statusFilter === "all" || entry.status === statusFilter;
      const categoryMatch =
        categoryFilter === "all" || entry.category === categoryFilter;
      const priorityMatch =
        priorityFilter === "all" || entry.priority === priorityFilter;
      return queryMatch && statusMatch && categoryMatch && priorityMatch;
    });
  }, [entries, query, statusFilter, categoryFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = entries.length;
    const completed = entries.filter((entry) => entry.status === "done").length;
    const active = entries.filter((entry) => entry.status === "in_progress").length;
    return { total, completed, active };
  }, [entries]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      due_date: form.due_date || null,
      tags: form.tags.trim() || null,
    };

    if (editingId) {
      await fetch(`${API_BASE_URL}/entries/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    loadEntries();
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      details: entry.details || "",
      category: entry.category,
      status: entry.status,
      priority: entry.priority,
      due_date: entry.due_date || "",
      tags: entry.tags || "",
    });
  };

  const handleDelete = async (entryId) => {
    await fetch(`${API_BASE_URL}/entries/${entryId}`, { method: "DELETE" });
    loadEntries();
  };

  const handleStatus = async (entry, status) => {
    await fetch(`${API_BASE_URL}/entries/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, status }),
    });
    loadEntries();
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <span className="pill">Atlas Workspace</span>
          <h1>Plan work, capture ideas, and close the loop.</h1>
          <p>
            Track tasks and notes with clarity, priority, and momentum. Keep
            everything you need for the day in one focused view.
          </p>
        </div>
        <div className="hero-card">
          <div>
            <p className="label">Total entries</p>
            <p className="stat">{stats.total}</p>
          </div>
          <div>
            <p className="label">In progress</p>
            <p className="stat">{stats.active}</p>
          </div>
          <div>
            <p className="label">Completed</p>
            <p className="stat">{stats.completed}</p>
          </div>
        </div>
      </header>

      <section className="card form-card">
        <div className="card-header">
          <div>
            <h2>{editingId ? "Update entry" : "New entry"}</h2>
            <p className="muted">Capture a task or jot down a note.</p>
          </div>
          {editingId && (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="Quarterly planning review"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="details">Details</label>
            <textarea
              id="details"
              value={form.details}
              onChange={(event) => updateForm("details", event.target.value)}
              placeholder="Meeting prep, agenda links, and key outcomes."
              rows={3}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Type</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
              >
                <option value="task">Task</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={form.priority}
                onChange={(event) => updateForm("priority", event.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="due">Due</label>
              <input
                id="due"
                type="date"
                value={form.due_date}
                onChange={(event) => updateForm("due_date", event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              value={form.tags}
              onChange={(event) => updateForm("tags", event.target.value)}
              placeholder="launch, marketing, leadership"
            />
          </div>
          <button type="submit">{editingId ? "Save changes" : "Add entry"}</button>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Workspace</h2>
            <p className="muted">Filter, search, and keep everything in motion.</p>
          </div>
          <div className="filters">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search entries"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All types</option>
              <option value="task">Tasks</option>
              <option value="note">Notes</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All status</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="all">All priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <h3>No entries yet</h3>
            <p>Create your first task or note to get started.</p>
          </div>
        ) : (
          <ul className="list">
            {filteredEntries.map((entry) => (
              <li key={entry.id} className="list-item">
                <div className="entry">
                  <div>
                    <div className="entry-title">
                      <span className={`badge badge-${entry.status}`}>
                        {entry.status.replace("_", " ")}
                      </span>
                      <span className={`badge badge-${entry.priority}`}>
                        {entry.priority}
                      </span>
                      <span className="badge badge-category">{entry.category}</span>
                    </div>
                    <h3>{entry.title}</h3>
                    <p className="muted">
                      {entry.details || "No details yet."}
                    </p>
                    <div className="meta">
                      <span>{entry.due_date ? `Due ${entry.due_date}` : "No due date"}</span>
                      <span>
                        {entry.tags
                          ? entry.tags.split(",").map((tag) => tag.trim()).filter(Boolean).join(" | ")
                          : "No tags"}
                      </span>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="ghost" onClick={() => handleEdit(entry)}>
                      Edit
                    </button>
                    <button
                      className="ghost"
                      onClick={() => handleStatus(entry, "in_progress")}
                    >
                      Start
                    </button>
                    <button className="ghost" onClick={() => handleStatus(entry, "done")}>
                      Complete
                    </button>
                    <button className="danger" onClick={() => handleDelete(entry.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
