import axios from "axios";
import type { Application, NewApplication } from "./types";
import { MOCK_APPLICATIONS } from "./mockData";

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export const fetchApplications = async (): Promise<Application[]> => {
  if (IS_DEMO_MODE) return MOCK_APPLICATIONS;
  const { data } = await api.get<Application[]>("/api/applications");
  return data;
};

export const fetchEvents = async (applicationId: number) => {
  if (IS_DEMO_MODE) return [];
  const { data } = await api.get(`/api/applications/${applicationId}/events`);
  return data;
};

export const createApplication = async (
  app: NewApplication,
): Promise<Application> => {
  if (IS_DEMO_MODE) {
    const newApp: Application = {
      ...app,
      language: "en",
      current_status: app.status,
      stages: [
        {
          id: Date.now(),
          status: app.status,
          applied_at: app.applied_at,
          email_body: "",
          last_email_id: "",
        },
      ],
    };
    return newApp;
  }
  const { data } = await api.post<Application>("/api/applications", app);
  return data;
};

export const triggerSync = async (): Promise<void> => {
  if (IS_DEMO_MODE) return;
  await api.post("/api/sync");
};
