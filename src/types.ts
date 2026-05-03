export type Status =
  | "applied"
  | "interview"
  | "ai_interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface ApplicationStage {
  id: number;
  status: Status;
  applied_at: string;
  email_body: string;
  last_email_id: string;
}

export interface Application {
  company: string;
  role: string;
  platform: string;
  language: string;
  url: string;
  current_status: Status;
  applied_at: string;
  stages: ApplicationStage[];
}

export interface NewApplication {
  company: string;
  role: string;
  platform: string;
  url: string;
  status: Status;
  applied_at: string;
}

export interface StatusEvent {
  id: number;
  application_id: number;
  from_status: Status;
  to_status: Status;
  email_id: string;
  email_subject: string;
  parsed_at: string;
}

export const STATUS_COLUMNS: Status[] = [
  "applied",
  "ai_interview",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  ai_interview: "AI Interview",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
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
  ai_interview: {
    bg: "rgba(99,102,241,0.12)",
    text: "#818cf8",
    border: "rgba(99,102,241,0.3)",
  },
  interview: {
    bg: "rgba(167,139,250,0.12)",
    text: "#a78bfa",
    border: "rgba(167,139,250,0.3)",
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
    bg: "rgba(156,163,175,0.12)",
    text: "#9ca3af",
    border: "rgba(156,163,175,0.3)",
  },
};
