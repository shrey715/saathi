/**
 * Centralized, typed client for the Saathi backend. Replaces the
 * copy-pasted `fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/...')`
 * calls that used to live in every page (and once, a hardcoded
 * `http://localhost:8000` that broke in production).
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

const api = {
  get: <T,>(path: string, auth = true) => request<T>(path, { method: "GET" }, auth),
  post: <T,>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }, auth),
  del: <T,>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "DELETE", body: body !== undefined ? JSON.stringify(body) : undefined }, auth),
};

// --- Shared types -----------------------------------------------------

export interface MoodEntryDTO {
  emotion: string;
  timestamp: string;
  message?: string | null;
}

export interface JournalEntryDTO {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  emoji: string;
}

export interface UserDetails {
  username: string;
  gender: string;
  dob: string;
  journals: JournalEntryDTO[];
  mood_history: MoodEntryDTO[];
  created_at: string;
}

export interface CommunityPost {
  id: string;
  content: string;
  mood: string;
  emoji: string;
  color: string;
  // Null when the author posted anonymously and this isn't their own
  // post — the server never sends the real username in that case.
  username: string | null;
  is_anonymous: boolean;
  timePosted: string;
  likes: number;
  liked: boolean;
}

export interface BookRecommendation {
  id: number;
  title: string;
  author: string;
  description: string;
  category: string;
  mood: string[];
  color: string;
}

// --- Explore page content — icon/tone are resolved client-side (see
// lib/explore-icons.tsx), everything else is rendered as-is. ---------------

export interface YogaExerciseDTO {
  id: number;
  name: string;
  description: string;
  duration: string;
  level: string;
  benefits: string[];
  tone: string;
  icon: string;
}

export interface BreathingExerciseDTO {
  id: number;
  name: string;
  description: string;
  duration: string;
  steps: string[];
  benefits: string[];
  tone: string;
  icon: string;
}

export interface InspiringQuoteDTO {
  id: number;
  quote: string;
  author: string;
  theme: string;
  tone: string;
  icon: string;
}

export interface WellnessFactDTO {
  id: number;
  fact: string;
  source: string;
  category: string;
  tone: string;
  icon: string;
}

export interface MovieDTO {
  id: number;
  title: string;
  description: string;
  year: number;
  genre: string;
  tone: string;
  icon: string;
}

export interface ExploreContent {
  yoga: YogaExerciseDTO[];
  breathing: BreathingExerciseDTO[];
  quotes: InspiringQuoteDTO[];
  facts: WellnessFactDTO[];
  movies: Record<string, MovieDTO[]>;
}

// --- Auth ---------------------------------------------------------------

export const authApi = {
  signup: (payload: { username: string; password: string; gender: string; dob: string }) =>
    api.post<{ message: string }>("/api/signup", payload, false),

  login: (payload: { username: string; password: string }) =>
    api.post<{ access_token: string; token_type: string }>("/api/login", payload, false),

  getUserDetails: () => api.get<UserDetails>("/api/get-user-details"),

  updateUser: (payload: { gender?: string; dob?: string; currentPassword?: string; newPassword?: string }) =>
    api.post<{ message: string }>("/api/update-user", payload),
};

// --- Chat -----------------------------------------------------------------

export const chatApi = {
  send: (message: string) => api.post<{ response: string; emotion: string }>("/api/chat", { message }),
  reset: () => api.post<{ message: string }>("/api/reset-chat"),
  moodHistory: () => api.get<MoodEntryDTO[]>("/api/get-mood-history"),
  books: () => api.post<BookRecommendation[]>("/api/get-books"),
  setMood: (emotion: string, message?: string) =>
    api.post<MoodEntryDTO>("/api/set-mood", { emotion, message }),
};

// --- Journal --------------------------------------------------------------

export const journalApi = {
  list: () => api.get<JournalEntryDTO[]>("/api/get-journals"),
  add: (journal: JournalEntryDTO) => api.post<{ message: string }>("/api/add-journal", journal),
  remove: (id: string) => api.del<{ message: string }>("/api/delete-journal", { id }),
};

// --- Community --------------------------------------------------------------

export const communityApi = {
  list: () => api.get<CommunityPost[]>("/api/community/posts"),
  create: (post: { content: string; mood: string; emoji: string; color: string; is_anonymous?: boolean }) =>
    api.post<CommunityPost>("/api/community/posts", post),
  like: (id: string) => api.post<{ id: string; likes: number; liked: boolean }>("/api/community/posts/like", { id }),
};

// --- Explore ----------------------------------------------------------------

export const exploreApi = {
  content: () => api.get<ExploreContent>("/api/explore/content"),
};

export { BACKEND_URL };
