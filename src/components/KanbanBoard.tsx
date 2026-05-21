import { useState } from "react";
import {
  type Application,
  type Status,
  STATUS_COLUMNS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../types";
import {
  deleteApplication,
  correctApplication,
  demoteApplication,
  promoteEmail,
} from "../api";
import type { ThreadEmail } from "../types";
import { ApplicationCard } from "./ApplicationCard";
import { EmailModal } from "./EmailModal";

interface Props {
  applications: Application[];
  onRefresh: () => void;
}

export function KanbanBoard({ applications, onRefresh }: Props) {
  const [selected, setSelected] = useState<Application | null>(null);

  async function handleDelete(stageId: number) {
    await deleteApplication(stageId);
    onRefresh();
  }

  async function handleCorrect(stageId: number, status: Status) {
    await correctApplication(stageId, status);
    onRefresh();
  }

  async function handleDemote(stageId: number) {
    await demoteApplication(stageId);
    onRefresh();
  }

  async function handlePromote(
    email: ThreadEmail,
    applicationId: number,
    status: Status,
  ) {
    await promoteEmail(email.thread_id, applicationId, status, email.thread_id);
    onRefresh();
  }

  const reviewItems = applications.filter((app) =>
    app.stages.some((s) => s.needs_review),
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Review notification */}
      {reviewItems.length > 0 && (
        <div style={{ padding: "0 32px 16px" }}>
          <div
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "12px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b" }}
              >
                {reviewItems.length}{" "}
                {reviewItems.length === 1 ? "entry needs" : "entries need"}{" "}
                review
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginLeft: "8px",
                }}
              >
                {reviewItems.map((a) => a.company).join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
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
          const columnCards = applications.filter(
            (app) =>
              app.stages.some((s) => s.status === status) &&
              app.stages.findIndex((s) => s.status === status) !== -1,
          );
          const colors = STATUS_COLORS[status];

          return (
            <div
              key={status}
              style={{
                flex: "0 0 220px",
                width: "220px",
                minWidth: 0,
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
                  {columnCards.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ flex: 1 }}>
                {columnCards.length === 0 ? (
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
                  columnCards.map((app) => (
                    <ApplicationCard
                      key={
                        app.stages.find((s) => s.status === status)?.id ??
                        `${app.company}|${app.role}|${status}`
                      }
                      application={app}
                      columnStatus={status}
                      onClick={() => setSelected(app)}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {selected && (
          <EmailModal
            application={selected}
            onClose={() => setSelected(null)}
            onRefresh={onRefresh}
            onDelete={handleDelete}
            onCorrect={handleCorrect}
            onDemote={handleDemote}
            onPromote={handlePromote}
          />
        )}
      </div>
    </div>
  );
}
