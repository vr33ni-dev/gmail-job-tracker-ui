import { useState } from "react";
import type { Application, ApplicationStage } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../types";

interface Props {
  application: Application;
  onClose: () => void;
}

export function EmailModal({ application: app, onClose }: Props) {
  const stages = app.stages ?? [];
  const colors = STATUS_COLORS[app.current_status];
  const [selectedStage, setSelectedStage] = useState<ApplicationStage | null>(
    stages.length > 0 ? stages[stages.length - 1] : null,
  );

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
          width: "580px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {app.company}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "var(--muted)",
              }}
            >
              {app.role}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "20px",
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              {STATUS_LABELS[app.current_status]}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: "2px",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            padding: "12px",
            background: "var(--bg)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          <span>📅 {new Date(app.applied_at).toLocaleDateString()}</span>
          <span>🔗 {app.platform}</span>
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              ↗ Job posting
            </a>
          )}
        </div>

        {/* Journey */}
        {stages.length > 1 && (
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px",
              }}
            >
              Journey
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {stages.map((stage) => {
                const c =
                  STATUS_COLORS[stage.status] ?? STATUS_COLORS["applied"];
                const isSelected = selectedStage?.id === stage.id;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      background: isSelected
                        ? "rgba(91,141,238,0.1)"
                        : "var(--bg)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      border: isSelected
                        ? "1px solid var(--accent)"
                        : "1px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: c.bg,
                        color: c.text,
                        border: `1px solid ${c.border}`,
                        fontSize: "10px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {STATUS_LABELS[stage.status]}
                    </span>
                    <span
                      style={{
                        color: "var(--muted)",
                        flex: 1,
                        fontSize: "11px",
                      }}
                    >
                      {new Date(stage.applied_at).toLocaleDateString()}
                    </span>
                    {stage.email_body && (
                      <span style={{ color: "var(--muted)", fontSize: "10px" }}>
                        📧
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Email body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bg)",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "13px",
            color: "var(--text)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            border: "1px solid var(--border)",
          }}
        >
          {selectedStage?.email_body || (
            <span style={{ color: "var(--muted)" }}>
              No email content available.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
