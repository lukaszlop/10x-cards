import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth API endpoints
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // Mock successful login for test credentials
    if (body.email === "test@example.com" && body.password === "test_password_123") {
      return HttpResponse.json(
        { message: "Zalogowano pomyślnie" },
        {
          status: 200,
          headers: {
            "Set-Cookie": "sb-access-token=mock-session-token; Path=/; HttpOnly",
          },
        }
      );
    }

    // Mock failed login
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json(
      { message: "Wylogowano pomyślnie" },
      {
        status: 200,
        headers: {
          "Set-Cookie": "sb-access-token=; Path=/; HttpOnly; Max-Age=0",
        },
      }
    );
  }),

  // Flashcards API endpoints
  http.get("/api/flashcards", () => {
    const mockFlashcards = [
      {
        id: 1,
        front: "Test Question 1",
        back: "Test Answer 1",
        source: "manual",
        generation_id: null,
        user_id: "test-user-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        front: "Test Question 2",
        back: "Test Answer 2",
        source: "manual",
        generation_id: null,
        user_id: "test-user-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return HttpResponse.json({
      flashcards: mockFlashcards,
      pagination: {
        page: 1,
        limit: 20,
        total: mockFlashcards.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/flashcards", async ({ request }) => {
    const body = (await request.json()) as { front: string; back: string; source: string };

    const newFlashcard = {
      id: Date.now(), // Simple ID generation for tests
      front: body.front,
      back: body.back,
      source: body.source || "manual",
      generation_id: null,
      user_id: "test-user-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(newFlashcard, { status: 201 });
  }),

  http.put("/api/flashcards/:id", async ({ params, request }) => {
    const body = (await request.json()) as { front: string; back: string };

    const updatedFlashcard = {
      id: parseInt(params.id as string),
      front: body.front,
      back: body.back,
      source: "manual",
      generation_id: null,
      user_id: "test-user-123",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(updatedFlashcard);
  }),

  http.delete("/api/flashcards/:id", ({ params }) => {
    const id = params.id;
    console.log(`[MOCK] Deleting flashcard with ID: ${id}`);
    return HttpResponse.json({}, { status: 204 });
  }),

  // Generations API endpoints
  http.get("/api/generations", () => {
    return HttpResponse.json({
      generations: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });
  }),

  http.post("/api/generations", async ({ request }) => {
    const body = (await request.json()) as { content: string };

    const mockGeneration = {
      id: Date.now(),
      content: body.content,
      user_id: "test-user-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      flashcards: [
        {
          id: Date.now() + 1,
          front: "Generated Question 1",
          back: "Generated Answer 1",
          source: "ai",
          generation_id: Date.now(),
          user_id: "test-user-123",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };

    return HttpResponse.json(mockGeneration, { status: 201 });
  }),

  // Health check endpoint
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Example API handler (keep for compatibility)
  http.get("/api/example", () => {
    return HttpResponse.json({
      message: "Hello from mock API",
      data: [],
    });
  }),
];
