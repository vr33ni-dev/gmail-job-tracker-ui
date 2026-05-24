import { useEffect, useState } from "react";
import type { Application, ApplicationFilter, NewApplication } from "./types";
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
  const [companyInput, setCompanyInput] = useState("");
  const [filter, setFilter] = useState<ApplicationFilter>({});

  // debounce company input into filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({ ...prev, company: companyInput || undefined }));
    }, 400);
    return () => clearTimeout(timer);
  }, [companyInput]);

  const load = async (f?: ApplicationFilter) => {
    try {
      const data = await fetchApplications(f ?? filter);
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleAdd = async (app: NewApplication) => {
    const created = await createApplication(app);
    setApplications((prev) => [created, ...prev]);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerSync();
      await new Promise((r) => setTimeout(r, 2000)); // give backend time to process
      await load(filter);
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

      {/* Filters */}
      <div
        style={{
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search company..."
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "inherit",
            width: "180px",
          }}
        />
        <input
          type="date"
          value={filter.from ?? ""}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              from: e.target.value || undefined,
            }))
          }
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        />
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>to</span>
        <input
          type="date"
          value={filter.to ?? ""}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, to: e.target.value || undefined }))
          }
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        />
        <select
          value={filter.sort_by ?? "company"}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              sort_by: e.target.value as "company" | "applied_at",
            }))
          }
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        >
          <option value="company">Sort: Company</option>
          <option value="applied_at">Sort: Date Applied</option>
        </select>
        <select
          value={filter.sort_dir ?? "asc"}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              sort_dir: e.target.value as "asc" | "desc",
            }))
          }
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        >
          <option value="asc">↑ Asc</option>
          <option value="desc">↓ Desc</option>
        </select>
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
            fetchApplications(filter).then(setApplications);
          }}
        />
      )}

      {showAdd && (
        <AddModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
