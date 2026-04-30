import { useState } from "react";
import type { NewApplication, Status } from "../types";

interface Props {
  onAdd: (app: NewApplication) => Promise<void>;
  onClose: () => void;
}

const PLATFORMS = [
  "linkedin",
  "upwork",
  "greenhouse",
  "lever",
  "direct",
  "other",
];

export function AddModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState<NewApplication>({
    company: "",
    role: "",
    platform: "linkedin",
    url: "",
    status: "applied",
    applied_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);

  const set = (field: keyof NewApplication, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.company || !form.role) return;
    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "28px",
          width: "420px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: "0 0 24px",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Add Application
        </h2>

        {[
          {
            label: "Company *",
            field: "company" as const,
            placeholder: "Acme Corp",
          },
          {
            label: "Role *",
            field: "role" as const,
            placeholder: "Senior Engineer",
          },
          { label: "URL", field: "url" as const, placeholder: "https://..." },
        ].map(({ label, field, placeholder }) => (
          <div key={field} style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              {label}
            </label>
            <input
              value={form[field] as string}
              onChange={(e) => set(field, e.target.value)}
              placeholder={placeholder}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "var(--text)",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => set("platform", e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "var(--text)",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "var(--text)",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {(
                [
                  "applied",
                  "screening",
                  "interview",
                  "offer",
                  "rejected",
                ] as Status[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              borderRadius: "8px",
              padding: "9px 18px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: "var(--accent)",
              border: "none",
              color: "white",
              borderRadius: "8px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Adding..." : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
