import { useEffect, useState } from "react";
import type { Application, StageJourney, ThreadEmail } from "../types";
import {
  type Status,
  STATUS_COLORS,
  STATUS_COLUMNS,
  STATUS_LABELS,
  isInferredApplied,
  sortStages,
} from "../types";
import {
  markReviewed,
  fetchJourney,
  suggestRule,
  addCorrectionRule,
} from "../api";

interface Props {
  application: Application;
  onClose: () => void;
  onRefresh: () => void;
  onDelete: (stageId: number) => void;
  onCorrect: (stageId: number, status: Status) => void;
  onDemote: (stageId: number) => void;
  onPromote: (
    email: ThreadEmail,
    applicationId: number,
    status: Status,
  ) => void;
}

const PREVIEW_LINES = 4;
const PREVIEW_CHARS = 250;

function toggleSet<T>(prev: Set<T>, item: T): Set<T> {
  const next = new Set(prev);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: "💼",
  upwork: "🔧",
  email: "📧",
  direct: "🌐",
  other: "📋",
  greenhouse: "🌱",
  lever: "⚙️",
  softgarden: "🌿",
};

function EmailBody({
  body,
  expandKey,
  expanded,
  onToggle,
}: {
  body: string;
  expandKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
}) {
  const lines = body.split("\n");
  const isLong = lines.length > PREVIEW_LINES || body.length > PREVIEW_CHARS;

  let displayText = body;
  if (isLong && !expanded) {
    const byLines = lines.slice(0, PREVIEW_LINES).join("\n");
    displayText =
      byLines.length <= PREVIEW_CHARS
        ? byLines
        : body.slice(0, PREVIEW_CHARS).trimEnd() + "…";
  }

  return (
    <div>
      <div
        style={{
          background: "var(--bg)",
          borderRadius: "8px",
          padding: "14px",
          fontSize: "12px",
          color: "var(--text)",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          border: "1px solid var(--border)",
        }}
      >
        {displayText}
      </div>
      {isLong && (
        <button
          onClick={() => onToggle(expandKey)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            color: "var(--accent)",
            padding: "4px 0 0",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export function EmailModal({
  application: app,
  onClose,
  onRefresh,
  onDelete,
  onCorrect,
  onDemote,
  onPromote,
}: Props) {
  const stages = sortStages(app.stages ?? []);
  const colors = STATUS_COLORS[app.current_status];
  const [journeys, setJourneys] = useState<StageJourney[] | null>(null);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openStage, setOpenStage] = useState<number | null>(null);
  const [openConversations, setOpenConversations] = useState<Set<number>>(
    new Set(),
  );
  const [promoteStatusByEmail, setPromoteStatusByEmail] = useState<
    Record<string, Status>
  >({});

  type RuleModalState = {
    stageId: number;
    wrongStatus: string;
    correctStatus: string;
    action: "delete" | "correct";
    rule: string;
    loading: boolean;
  };
  const [ruleModal, setRuleModal] = useState<RuleModalState | null>(null);

  const toggleExpanded = (key: string) =>
    setExpanded((prev) => toggleSet(prev, key));
  const toggleStage = (id: number) =>
    setOpenStage((prev) => (prev === id ? null : id));
  const toggleConversation = (id: number) =>
    setOpenConversations((prev) => toggleSet(prev, id));

  useEffect(() => {
    if (!app.id) return;
    let cancelled = false;
    fetchJourney(app.id)
      .then((data) => {
        if (!cancelled) {
          setJourneys(data);
          setJourneyError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJourneys(null);
          setJourneyError("Failed to load email content.");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkReviewed = async (stageId: number) => {
    await markReviewed(stageId);
    onClose();
    onRefresh();
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
          width: "620px",
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
            marginBottom: "20px",
            padding: "12px",
            background: "var(--bg)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          <span>📅 {new Date(app.applied_at).toLocaleDateString()}</span>
          <span style={{ fontSize: "12px" }}>
            {PLATFORM_ICONS[app.platform] || "📋"}{" "}
            <span style={{ color: "var(--muted)", fontSize: "12px" }}>
              {app.platform}
            </span>
          </span>
          {app.gmail_url && (
            <a
              href={app.gmail_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              ✉️ Gmail
            </a>
          )}
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

        {/* Full timeline — iterates app.stages so all stages always show */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {journeyError && (
            <div
              style={{
                fontSize: "12px",
                color: "#f87171",
                marginBottom: "4px",
              }}
            >
              {journeyError}
            </div>
          )}
          {stages.map((appStage, stageIdx) => {
            const j = journeys?.find((jj) => jj.stage.stage_id === appStage.id);
            const c = STATUS_COLORS[appStage.status];
            const body = j?.stage.body || appStage.email_body;
            const inferred = isInferredApplied(appStage);

            const isStageOpen = openStage === appStage.id;

            return (
              <div key={appStage.id}>
                {/* Stage header */}
                <div
                  onClick={() => toggleStage(appStage.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                    cursor: inferred ? "default" : "pointer",
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
                      opacity: 1,
                    }}
                  >
                    {STATUS_LABELS[appStage.status]}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                    {new Date(appStage.applied_at).toLocaleDateString()}
                    {inferred ? " (estimated) " : ""}
                  </span>
                  {appStage.last_email_id && (
                    <a
                      href={`https://mail.google.com/mail/u/0/#inbox/${appStage.last_email_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--accent)",
                        fontSize: "10px",
                        textDecoration: "none",
                      }}
                    >
                      ↗ Gmail
                    </a>
                  )}
                  {!inferred && (
                    <select
                      defaultValue=""
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const correctStatus =
                          val === "__delete__" ? "conversation" : val;
                        const action =
                          val === "__delete__" ? "delete" : "correct";
                        setRuleModal({
                          stageId: appStage.id,
                          wrongStatus: appStage.status,
                          correctStatus,
                          action,
                          rule: "",
                          loading: true,
                        });
                        suggestRule(appStage.id, appStage.status, correctStatus)
                          .then((rule: string) =>
                            setRuleModal((prev) =>
                              prev ? { ...prev, rule, loading: false } : null,
                            ),
                          )
                          .catch(() =>
                            setRuleModal((prev) =>
                              prev ? { ...prev, loading: false } : null,
                            ),
                          );
                      }}
                      style={{
                        fontSize: "10px",
                        background: "var(--surface)",
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "2px 4px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="" disabled>
                        Correct…
                      </option>
                      <option value="__delete__">
                        ✕ Conversation only (remove)
                      </option>
                      <option disabled>──────────</option>
                      {STATUS_COLUMNS.filter((s) => s !== appStage.status).map(
                        (s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ),
                      )}
                    </select>
                  )}
                  {!inferred && stageIdx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDemote(appStage.id);
                        onClose();
                      }}
                      title="Demote to conversation of preceding stage"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "10px",
                        color: "var(--muted)",
                        padding: "2px 4px",
                        whiteSpace: "nowrap",
                        textDecoration: "underline",
                        textDecorationStyle: "dotted",
                      }}
                    >
                      ↓ Demote
                    </button>
                  )}
                  {!inferred && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "10px",
                        color: "var(--muted)",
                      }}
                    >
                      {isStageOpen ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Inferred applied notice — shown inline, no expansion */}
                {inferred && isStageOpen && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg)",
                      border: "1px dashed var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginBottom: "4px",
                    }}
                  >
                    No confirmation email found — date is estimated.
                  </div>
                )}

                {/* Needs review banner */}
                {!inferred && isStageOpen && appStage.needs_review && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f59e0b",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      ⚠ Auto-created — no confirmation email found. Please
                      review.
                    </span>
                    <button
                      onClick={() => handleMarkReviewed(appStage.id)}
                      style={{
                        background: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        color: "#f59e0b",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
                      }}
                    >
                      ✓ Mark reviewed
                    </button>
                  </div>
                )}

                {/* Stage email body + conversation — only when open and not inferred */}
                {!inferred && isStageOpen && (
                  <>
                    {!journeys && !journeyError ? (
                      <div
                        style={{
                          background: "var(--bg)",
                          borderRadius: "8px",
                          padding: "14px",
                          fontSize: "12px",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        Loading…
                      </div>
                    ) : body ? (
                      <EmailBody
                        body={body}
                        expandKey={`s-${appStage.id}`}
                        expanded={expanded.has(`s-${appStage.id}`)}
                        onToggle={toggleExpanded}
                      />
                    ) : (
                      <div
                        style={{
                          background: "var(--bg)",
                          borderRadius: "8px",
                          padding: "14px",
                          fontSize: "12px",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        No email content.
                      </div>
                    )}

                    {j && j.conversation.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleConversation(appStage.id);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "11px",
                            color: "var(--accent)",
                            padding: 0,
                            textDecoration: "underline",
                            textDecorationStyle: "dotted",
                          }}
                        >
                          {openConversations.has(appStage.id)
                            ? "Hide conversation"
                            : `Show conversation (${j.conversation.length} email${j.conversation.length > 1 ? "s" : ""})`}
                        </button>

                        {openConversations.has(appStage.id) &&
                          j.conversation.map((email, i) => (
                            <div
                              key={email.email_id || String(i)}
                              style={{
                                borderLeft: "2px solid var(--border)",
                                paddingLeft: "12px",
                                marginTop: "12px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "6px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--muted)",
                                  }}
                                >
                                  {email.email_date
                                    ? new Date(
                                        email.email_date,
                                      ).toLocaleDateString()
                                    : ""}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  <select
                                    value={
                                      promoteStatusByEmail[email.thread_id] ??
                                      appStage.status
                                    }
                                    onChange={(event) => {
                                      const value = event.target
                                        .value as Status;
                                      setPromoteStatusByEmail((prev) => ({
                                        ...prev,
                                        [email.thread_id]: value,
                                      }));
                                    }}
                                    style={{
                                      fontSize: "10px",
                                      color: "var(--muted)",
                                      border: "1px solid var(--border)",
                                      borderRadius: "6px",
                                      padding: "2px 6px",
                                      background: "var(--surface)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {STATUS_COLUMNS.map((status) => (
                                      <option key={status} value={status}>
                                        {STATUS_LABELS[status]}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => {
                                      const selectedStatus =
                                        promoteStatusByEmail[email.thread_id] ??
                                        appStage.status;
                                      onPromote(email, app.id, selectedStatus);
                                      onClose();
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: "10px",
                                      color: "var(--muted)",
                                      textDecoration: "underline",
                                      textDecorationStyle: "dotted",
                                      padding: 0,
                                    }}
                                  >
                                    ↑ Promote to stage
                                  </button>
                                </div>
                              </div>
                              {email.body ? (
                                <EmailBody
                                  body={email.body}
                                  expandKey={`c-${email.email_id || i}`}
                                  expanded={expanded.has(
                                    `c-${email.email_id || i}`,
                                  )}
                                  onToggle={toggleExpanded}
                                />
                              ) : (
                                <div
                                  style={{
                                    background: "var(--bg)",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    fontSize: "12px",
                                    color: "var(--muted)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  No email content.
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {ruleModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1001,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "24px",
              width: "480px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              Add a correction rule?
            </h3>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              Rules teach the classifier to avoid similar mistakes on future
              emails. Edit or clear the suggestion below.
            </p>
            {ruleModal.loading ? (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  padding: "12px 0",
                }}
              >
                Thinking…
              </div>
            ) : (
              <textarea
                value={ruleModal.rule}
                onChange={(e) =>
                  setRuleModal((prev) =>
                    prev ? { ...prev, rule: e.target.value } : null,
                  )
                }
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "12px",
                  color: "var(--text)",
                  resize: "vertical",
                  marginBottom: "14px",
                }}
                placeholder="Edit or clear the rule suggestion…"
              />
            )}
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                disabled={ruleModal.loading}
                onClick={() => {
                  if (ruleModal.action === "delete")
                    onDelete(ruleModal.stageId);
                  else
                    onCorrect(
                      ruleModal.stageId,
                      ruleModal.correctStatus as Status,
                    );
                  setRuleModal(null);
                  onClose();
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Skip, just {ruleModal.action === "delete" ? "remove" : "correct"}
              </button>
              <button
                disabled={ruleModal.loading}
                onClick={async () => {
                  if (ruleModal.rule.trim()) {
                    try {
                      await addCorrectionRule(ruleModal.rule.trim());
                    } catch {
                      // best-effort
                    }
                  }
                  if (ruleModal.action === "delete")
                    onDelete(ruleModal.stageId);
                  else
                    onCorrect(
                      ruleModal.stageId,
                      ruleModal.correctStatus as Status,
                    );
                  setRuleModal(null);
                  onClose();
                }}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Add rule +{" "}
                {ruleModal.action === "delete" ? "remove" : "correct"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
