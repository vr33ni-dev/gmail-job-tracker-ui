import { useEffect, useState } from "react";
import type { Application, NewApplication } from "./types";
import { fetchApplications, createApplication, triggerSync } from "./api";
import { KanbanBoard } from "./components/KanbanBoard";
import { StatsBar } from "./components/StatsBar";
import { AddModal } from "./components/AddModal";

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await fetchApplications();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (app: NewApplication) => {
    const created = await createApplication(app);
    setApplications((prev) => [created, ...prev]);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerSync();
      await new Promise((r) => setTimeout(r, 2000)); // give backend time to process
      await load();
      setLastSync(new Date().toLocaleTimeString());
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "24px 32px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "var(--accent)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          📬
        </div>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            JobTracker
          </h1>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
            {lastSync
              ? `Last synced ${lastSync}`
              : "Gmail-powered application tracker"}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: syncing ? "var(--muted)" : "var(--text)",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: syncing ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
        >
          <span
            style={{
              display: "inline-block",
              animation: syncing ? "spin 1s linear infinite" : "none",
            }}
          >
            ⟳
          </span>
          {syncing ? "Syncing..." : "Sync Gmail"}
        </button>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "var(--accent)",
            border: "none",
            color: "white",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Add
        </button>
      </header>

      {/* Stats */}
      <div style={{ padding: "24px 32px 0" }}>
        <StatsBar applications={applications} />
      </div>

      {/* Board */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
          }}
        >
          Loading...
        </div>
      ) : (
        <KanbanBoard
          applications={applications}
          onRefresh={() => {
            fetchApplications().then(setApplications);
          }}
        />
      )}

      {showAdd && (
        <AddModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
