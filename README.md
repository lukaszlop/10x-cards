# 10x-cards

## Table of Contents

- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [Services](#services)
- [License](#license)

## Project Name

**10x-cards**

## Project Description

10x-cards is a web application designed to streamline the process of creating and managing educational flashcards. The application leverages advanced language models (LLMs) to generate flashcard suggestions from provided text, enabling users to learn efficiently using spaced repetition techniques. Users can both automatically generate flashcards via AI and manually create, edit, or delete flashcards according to their study needs.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase for database and authentication management
- **AI Integration:** Communication with LLM models via Openrouter.ai for generating flashcards
- **CI/CD & Hosting:** GitHub Actions for pipeline automation and DigitalOcean for hosting

## Getting Started Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/10x-cards.git
   cd 10x-cards
   ```

2. **Ensure you are using the correct Node version:**
   This project uses the Node version specified in the `.nvmrc` file. Currently it's **22.14.0**.

   ```bash
   nvm use
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000` or the URL provided in your terminal.

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build locally.
- **`npm run astro`**: Executes Astro commands.
- **`npm run lint`**: Lints the project files.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats the codebase using Prettier.

## Project Scope

10x-cards focuses on delivering a streamlined flashcard creation experience. Key features include:

- **Automatic Flashcard Generation:**
  Automatically generate flashcards by submitting text to an AI model, which returns flashcard suggestions that users can review and approve.

- **Manual Flashcard Management:**
  Create, edit, and delete flashcards manually to tailor learning experiences.

- **User Authentication:**
  Basic registration and login functionalities ensuring personalized access and data privacy.

- **Spaced Repetition:**
  Integration with spaced repetition algorithms to schedule flashcard reviews effectively.

- **Usage Metrics:**
  Collecting statistics on AI-generated flashcards and user acceptance rates to continuously improve the system.

**Out of Scope (MVP):**

- Advanced flashcard scheduling algorithms (beyond standard spaced repetition)
- Mobile applications
- Importing multiple document formats (e.g., PDF, DOCX)
- Publicly available API and advanced notifications features

## Project Status

The project is currently in its MVP stage, focusing on core functionalities such as flashcard generation, user management, and essential spaced repetition. Future iterations may expand on the features and refine the user experience based on feedback.

## Services

### OpenRouter Service

The OpenRouter Service (`src/lib/openrouter.service.ts`) is responsible for communicating with the OpenRouter API to generate AI-powered responses. It provides a robust interface for sending messages and receiving structured responses.

#### Features

- Structured JSON responses with validation
- Automatic retry mechanism with exponential backoff
- Comprehensive error handling and logging
- Configurable system messages and model parameters
- Type-safe API using TypeScript

#### Usage Example

```typescript
// Initialize the service
const openRouterService = new OpenRouterService({
  supabase, // Supabase client instance
  userId, // Current user ID
});

// Configure the service (optional)
openRouterService.setSystemMessage("You are an expert flashcard creator.");
openRouterService.updateModelConfig({
  name: "openai/gpt-4o-mini",
  temperature: 0.7,
  max_tokens: 150,
  top_p: 0.9,
});

// Send a message and get response
try {
  const response = await openRouterService.sendMessage("Create a flashcard about photosynthesis.");
  console.log(response);
  // {
  //   answer: "Front: What is photosynthesis?\nBack: The process by which plants convert light energy into chemical energy to produce glucose from CO2 and water.",
  //   confidence: 0.95
  // }
} catch (error) {
  console.error("Failed to generate response:", error);
}
```

#### Error Handling

The service includes comprehensive error handling for various scenarios:

- Network errors with automatic retry
- Authentication failures
- Rate limiting
- Invalid responses
- Internal service errors

All errors are automatically logged to the `generation_error_logs` table in Supabase for monitoring and debugging.

## License

This project is licensed under the MIT License.
