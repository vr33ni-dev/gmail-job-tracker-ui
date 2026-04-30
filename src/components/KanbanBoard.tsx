import { useState } from "react";
import {
  type Application,
  STATUS_COLUMNS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Status,
} from "../types";
import { ApplicationCard } from "./ApplicationCard";
import { EmailModal } from "./EmailModal";

interface Props {
  applications: Application[];
}

export function KanbanBoard({ applications }: Props) {
  const [selected, setSelected] = useState<Application | null>(null); // must be here
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "0 32px 32px",
        overflowX: "auto",
        flex: 1,
        alignItems: "flex-start",
      }}
    >
      {STATUS_COLUMNS.map((status) => {
        const cards = applications.filter((a) => a.status === status);
        const colors = STATUS_COLORS[status];

        return (
          <div
            key={status}
            style={{
              flex: "0 0 260px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Column header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                padding: "10px 14px",
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: colors.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {STATUS_LABELS[status]}
              </span>
              <span
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "20px",
                  padding: "2px 8px",
                }}
              >
                {cards.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ flex: 1 }}>
              {cards.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed var(--border)",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: "12px",
                  }}
                >
                  No applications
                </div>
              ) : (
                cards.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={() => setSelected(app)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
      {selected && (
        <EmailModal application={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
