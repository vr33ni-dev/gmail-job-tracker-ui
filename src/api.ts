import axios from "axios";
import type {
  Application,
  ApplicationFilter,
  NewApplication,
  StageJourney,
} from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export const fetchApplications = async (
  filter?: ApplicationFilter,
): Promise<Application[]> => {
  const { data } = await api.get<Application[]>("/api/applications", {
    params: filter, // axios serializes this as ?company=...&from=...&to=...&sort_by=...&sort_dir=...
  });
  return data;
};

export const fetchNotesByApplicationId = async (
  applicationId: number,
): Promise<string[]> => {
  const { data } = await api.get<{ notes: string[] }>(
    `/api/applications/${applicationId}/notes`,
  );
  return data.notes;
};

export const createApplication = async (
  app: NewApplication,
): Promise<Application> => {
  const { data } = await api.post<{ id: number }>("/api/applications", app);
  return {
    ...app,
    id: data.id,
    language: "en",
    current_status: app.status,
    gmail_url: "",
    stages: [
      {
        id: data.id,
        status: app.status,
        applied_at: app.applied_at,
        email_body: "",
        last_email_id: "",
        needs_review: false,
      },
    ],
  };
};

export const triggerSync = async (): Promise<void> => {
  await api.post("/api/sync");
};

export async function markReviewed(id: number): Promise<void> {
  await api.post(`/api/applications/${id}/reviewed`);
}

export async function deleteApplication(stageId: number): Promise<void> {
  await api.delete(`/api/applications/${stageId}`);
}

export async function demoteApplication(id: number): Promise<void> {
  await api.post(`/api/applications/${id}/demote`);
}

export async function promoteEmail(
  emailThreadId: string,
  applicationId: number,
  status: string,
  threadId: string,
): Promise<void> {
  await api.post(`/api/thread-emails/${emailThreadId}/promote`, {
    status,
    application_id: applicationId,
    thread_id: threadId,
  });
}

export async function fetchJourney(stageId: number): Promise<StageJourney[]> {
  const { data } = await api.get<StageJourney[]>(
    `/api/applications/${stageId}/journey`,
  );
  return data;
}

export async function correctApplication(
  stageId: number,
  status: string,
): Promise<void> {
  await api.post(`/api/applications/${stageId}/correct`, { status });
}

export async function suggestRule(
  stageId: number,
  wrongStatus: string,
  correctStatus: string,
): Promise<string> {
  const { data } = await api.post<{ rule: string }>(
    `/api/applications/${stageId}/suggest-rule`,
    { wrong_status: wrongStatus, correct_status: correctStatus },
  );
  return data.rule ?? "";
}

export async function addCorrectionRule(rule: string): Promise<void> {
  await api.post("/api/corrections/rule", { rule });
}
