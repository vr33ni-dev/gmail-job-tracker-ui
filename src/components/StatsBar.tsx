import type { Application } from "../types";

interface Props {
  applications: Application[];
}

export function StatsBar({ applications }: Props) {
  const total = applications.length;
  const active = applications.filter((a) =>
    ["applied", "screening", "interview"].includes(a.status),
  ).length;
  const interviews = applications.filter(
    (a) => a.status === "interview",
  ).length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const responseRate =
    total === 0
      ? 0
      : Math.round(
          (applications.filter(
            (a) => a.status !== "applied" && a.status !== "no_response",
          ).length /
            total) *
            100,
        );

  const stats = [
    { label: "Total", value: total },
    { label: "Active", value: active },
    { label: "Interviews", value: interviews },
    { label: "Offers", value: offers },
    { label: "Response Rate", value: `${responseRate}%` },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "0 32px 24px",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: "6px",
              fontWeight: 500,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
