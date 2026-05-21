import type { Application } from "../types";
import {
  type Status,
  STATUS_COLORS,
  STATUS_LABELS,
  isInferredApplied,
  sortStages,
} from "../types";

interface Props {
  application: Application;
  onClick: () => void;
  columnStatus: Status;
  onDelete: (stageId: number) => void;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (!dateStr || date.getFullYear() < 2000) return "unknown";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 0) return "just now";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function ApplicationCard({
  application: app,
  onClick,
  columnStatus,
  onDelete,
}: Props) {
  const colors = STATUS_COLORS[columnStatus];
  const stages = sortStages(app.stages ?? []);
  const statusCount = stages.filter((s) => s.status === columnStatus).length;
  const hasTimeline = stages.length > 1;
  const stageDate =
    stages.find((s) => s.status === columnStatus)?.applied_at ?? app.applied_at;
  const lastUpdateDate = (() => {
    // Use the most recent valid `applied_at` from stages; fallback to app.applied_at only if none.
    let latestStageDate = "";
    for (const s of stages) {
      const currentTime = new Date(s.applied_at).getTime();
      if (isNaN(currentTime)) continue;
      const latestTime = latestStageDate
        ? new Date(latestStageDate).getTime()
        : NaN;
      if (isNaN(latestTime) || currentTime > latestTime) {
        latestStageDate = s.applied_at;
      }
    }
    if (latestStageDate) return latestStageDate;
    return app.applied_at;
  })();
  const columnStage = stages.find((s) => s.status === columnStatus);
  const needsReview = columnStage?.needs_review ?? false;
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "8px",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {app.company}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              marginTop: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {app.role}
          </div>
          {needsReview && (
            <span
              style={{
                fontSize: "10px",
                color: "#f59e0b",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "20px",
                padding: "2px 8px",
                marginTop: "6px",
                display: "inline-block",
              }}
            >
              ⚠ needs review
            </span>
          )}
        </div>
        {statusCount > 1 && (
          <span
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: "10px",
              fontWeight: 700,
              borderRadius: "20px",
              padding: "2px 8px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ×{statusCount}
          </span>
        )}
      </div>

      {/* Timeline dots */}
      {hasTimeline && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "10px",
          }}
        >
          {stages.map((stage, i) => {
            const c = STATUS_COLORS[stage.status] ?? STATUS_COLORS["applied"];
            const inferred = isInferredApplied(stage);
            return (
              <div
                key={stage.id}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <div
                  title={
                    inferred
                      ? "Applied (estimated) – no confirmation email found"
                      : STATUS_LABELS[stage.status]
                  }
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: inferred ? "transparent" : c.text,
                    border: inferred ? `1.5px dashed ${c.text}` : "none",
                    opacity: inferred ? 0.5 : 1,
                    flexShrink: 0,
                  }}
                />
                {i < stages.length - 1 && (
                  <div
                    style={{
                      width: "12px",
                      height: "1px",
                      background: "var(--border)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
          {timeAgo(stageDate)}
          {lastUpdateDate && lastUpdateDate !== stageDate && (
            <span
              style={{
                marginLeft: "8px",
                color: "var(--muted)",
                fontSize: "10px",
              }}
            >
              · last update: {timeAgo(lastUpdateDate)}
            </span>
          )}
        </span>
      </div>

      {app.url && (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginTop: "8px",
            fontSize: "10px",
            color: "var(--accent)",
            textDecoration: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          ↗ {app.url}
        </a>
      )}

      {columnStage && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(columnStage.id);
          }}
          style={{
            display: "block",
            marginTop: "8px",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: "10px",
            color: "var(--muted)",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
          }}
        >
          Not a job
        </button>
      )}
    </div>
  );
}
