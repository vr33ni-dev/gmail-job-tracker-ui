import { type Application, STATUS_COLORS, STATUS_LABELS } from "../types";

interface Props {
  application: Application;
  onClick: () => void;
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

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: "💼",
  upwork: "🔧",
  email: "📧",
  direct: "🌐",
  other: "📋",
};

export function ApplicationCard({ application: app, onClick }: Props) {
  const colors = STATUS_COLORS[app.status];

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "8px",
        cursor: "default",
        transition: "border-color 0.2s, transform 0.2s",
        animation: "slideIn 0.2s ease",
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
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <span style={{ fontSize: "12px" }}>
          {PLATFORM_ICONS[app.platform] || "📋"}{" "}
          <span style={{ color: "var(--muted)", fontSize: "10px" }}>
            {app.platform}
          </span>
        </span>
        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
          {timeAgo(app.applied_at)}
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
    </div>
  );
}
