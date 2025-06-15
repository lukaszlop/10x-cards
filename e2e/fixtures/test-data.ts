export const testUsers = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
    name: "Test Admin",
  },
  user: {
    email: "user@example.com",
    password: "user123",
    name: "Test User",
  },
} as const;

export const testCards = [
  {
    id: "1",
    title: "Test Card 1",
    description: "This is a test card for E2E testing",
    category: "Technology",
  },
  {
    id: "2",
    title: "Test Card 2",
    description: "Another test card for comprehensive testing",
    category: "Science",
  },
] as const;

export const apiEndpoints = {
  login: "/api/auth/login",
  cards: "/api/cards",
  users: "/api/users",
} as const;
