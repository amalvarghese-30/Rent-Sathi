import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let csrfToken: string | null = null;

export async function fetchCsrfToken() {
  try {
    const { data } = await axios.get("/api/v1/auth/csrf", { withCredentials: true });
    csrfToken = data.csrf_token;
  } catch {
    csrfToken = null;
  }
}

api.interceptors.request.use(async (config) => {
  if (config.method && ["post", "patch", "put", "delete"].includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't retry refresh itself, CSRF fetch, or /auth/me (expected 401 for guests)
    if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/csrf") || original.url?.includes("/auth/me")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post("/api/v1/auth/refresh", {}, { withCredentials: true });
        await fetchCsrfToken();
        return api(original);
      } catch {
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
