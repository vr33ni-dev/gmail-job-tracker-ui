export type Status =
  | "applied"
  | "screening"
  | "interview"
  | "ai_interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "no_response"
  | "reviewing";

export interface Application {
  id: number;
  company: string;
  role: string;
  platform: string;
  applied_at: string;
  status: Status;
  last_email_id: string;
  notes: string;
  url: string;
  created_at: string;
  updated_at: string;
  email_body: string;
}

export interface NewApplication {
  company: string;
  role: string;
  platform: string;
  url: string;
  status: Status;
  applied_at: string;
}

export const STATUS_COLUMNS: Status[] = [
  "applied",
  "screening",
  "interview",
  "ai_interview",
  "offer",
  "rejected",
];

export const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  ai_interview: "AI Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  no_response: "No Response",
  reviewing: "Reviewing",
};

export const STATUS_COLORS: Record<
  Status,
  { bg: string; text: string; border: string }
> = {
  applied: {
    bg: "rgba(91,141,238,0.12)",
    text: "#5b8dee",
    border: "rgba(91,141,238,0.3)",
  },
  screening: {
    bg: "rgba(251,191,36,0.12)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
  },
  interview: {
    bg: "rgba(167,139,250,0.12)",
    text: "#a78bfa",
    border: "rgba(167,139,250,0.3)",
  },
  ai_interview: {
    bg: "rgba(99,102,241,0.12)",
    text: "#818cf8",
    border: "rgba(99,102,241,0.3)",
  },
  offer: {
    bg: "rgba(52,211,153,0.12)",
    text: "#34d399",
    border: "rgba(52,211,153,0.3)",
  },
  rejected: {
    bg: "rgba(248,113,113,0.12)",
    text: "#f87171",
    border: "rgba(248,113,113,0.3)",
  },
  withdrawn: {
    bg: "rgba(107,114,128,0.12)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.3)",
  },
  no_response: {
    bg: "rgba(107,114,128,0.12)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.3)",
  },
  reviewing: {
    bg: "rgba(251,146,60,0.12)",
    text: "#fb923c",
    border: "rgba(251,146,60,0.3)",
  },
};
