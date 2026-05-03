import axios from "axios";
import type { Application, NewApplication } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export const fetchApplications = async (): Promise<Application[]> => {
  const { data } = await api.get<Application[]>("/api/applications");
  return data;
};

export const fetchEvents = async (applicationId: number) => {
  const { data } = await api.get(`/api/applications/${applicationId}/events`);
  return data;
};

export const createApplication = async (
  app: NewApplication,
): Promise<Application> => {
  const { data } = await api.post<Application>("/api/applications", app);
  return data;
};

export const triggerSync = async (): Promise<void> => {
  await api.post("/api/sync");
};
