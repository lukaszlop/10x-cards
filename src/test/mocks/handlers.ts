import { http, HttpResponse } from "msw";

export const handlers = [
  // Example API handler
  http.get("/api/example", () => {
    return HttpResponse.json({
      message: "Hello from mock API",
      data: [],
    });
  }),

  // Health check endpoint
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
];
