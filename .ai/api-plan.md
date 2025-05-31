# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Managed by Supabase Auth. Key fields: id (UUID), email, encrypted_password, created_at, confirmed_at.
- **Flashcards**: Corresponds to the `flashcards` table. Key fields: id, front, back, source (allowed: 'ai-full', 'ai-edited', 'manual'), created_at, updated_at, generation_id, user_id.
- **Generations**: Corresponds to the `generations` table. Represents AI flashcard generation attempts. Key fields: model, generated_count, source_text_hash, source_text_length, generation_duration.
- **GenerationErrorLogs**: Corresponds to the `generation_error_logs` table. Stores logs of generation errors.

## 2. Endpoints

### 2.2. Flashcards

- **GET `/flashcards`**

  - **Description**: Retrieve a paginated list of flashcards for the authenticated user.
  - **Query Parameters**:

    - `page`: (default: 1)
    - `limit`: (default: 10)
    - `sort`: (e.g., `created_at`)
    - `order`: (`asc` or `desc`)
    - Optional filters (e.g., `source`, `generation_id`).

  - **Response JSON**:
    ```json
    {
      "data": [
        { "id": 1, "front": "Question", "back": "Answer", "source": "manual", "created_at": "...", "updated_at": "..." },
        ...
      ],
      "pagination": { "page": 1, "limit": 10, "total": 100 }
    }
    ```
  - **Errors** 401 Unauthorized if token is invalid.

- **POST `/flashcards`**

  - **Description**: Create one or multiple flashcards (manual or AI-generated).
  - **Request JSON**:
    ```json
    {
      "flashcards": [
        {
          "front": "Question text 1",
          "back": "Answer text 1",
          "source": "manual", // or 'ai-full' or 'ai-edited'
          "generation_id": null // required for ai-full and ai-edited sources
        },
        {
          "front": "Question text 2",
          "back": "Answer text 2",
          "source": "ai-full", // or 'manual' or 'ai-edited'
          "generation_id": 123 // required for ai-full and ai-edited sources
        }
        // ... more flashcards
      ]
    }
    ```
  - **Validations**:
    - `front` maximum length: 200 characters.
    - `back` maximum length: 500 characters.
    - `source`: Must be one of `ai-full`, `ai-edited` or `manual`.
    - `generation_id`: Required for `ai-full` and `ai-edited` sources, must be null for `manual` source.
  - **Response JSON**:
    ```json
    {
      "flashcards": [
        {
          "front": "Question text 1",
          "back": "Answer text 1",
          "source": "manual",
          "generation_id": null
        },
        {
          "front": "Question text 2",
          "back": "Answer text 2",
          "source": "ai-full",
          "generation_id": 123
        }
        // ... more created flashcards
      ]
    }
    ```
  - **Errors**:
    - 400 Bad Request (invalid data format, missing required fields)
    - 401 Unauthorized
    - 422 Unprocessable Entity (invalid source type, missing generation_id for AI flashcards)

- **GET `/flashcards/{id}`**

  - **Description**: Retrieve details of a single flashcard.
  - **Response JSON**: Flashcard object.
  - **Errors**: 401 Unauthorized, 404 Not Found

- **PUT `/flashcards/{id}`**

  - **Description**: Edit an existing flashcard.
  - **Request JSON**: Fields to update.
  - **Validations**:
    - `front` maximum length: 200 characters.
    - `back` maximum length: 500 characters.
    - `source`: Must be one of `ai-edited` or `manual`.
  - **Response JSON**: Updated flashcard object.
  - **Errors**: 400 Bad Request, 401 Unauthorized, 404 Not Found

- **DELETE `/flashcards/{id}`**
  - **Description**: Delete a flashcard.
  - **Response JSON**:
    ```json
    { "message": "Flashcard deleted successfully." }
    ```
  - **Errors**: 401 Unauthorized, 404 Not Found

### 2.3. AI Generation

- **POST `/generations`**

  - **Description**: Submit text to generate flashcard proposals via AI.
  - **Request JSON**:
    ```json
    {
      "source_text": "Input text between 1000 and 10000 characters"
    }
    ```
  - **Validation**: Ensure text `source_text` length is between 1000 and 10000 characters.
  - **Process**: Calls external LLM API, creates a generation record, and returns proposed flashcards.
  - **Response JSON**:
    ```json
    {
      "generation_id": 1,
      "flashcardsProposals": [
        { "front": "Generated Question 1", "back": "Generated Answer 1", "source": "ai-full" },
        ...
      ],
      "generated_count": 10,
    }
    ```
  - **Errors**: 400 Bad Request, 401 Unauthorized, 422 Unprocessable Entity, 500 AI service errors (logs recorded in `generation_error_logs`).

- **GET `/generations/{id}`**

  - **Description**: Retrieve details and status of an AI generation request including its flashcard.
  - **Response JSON**: Generation details and associated flashcards.
  - **Errors**: 401 Unauthorized, 404 Not Found

- **GET `/generations`**
  - **Description**: Retrieve a list of generation requests for the authenticated user.
  - **Query Parameters**: Pagination, filtering by status if needed.
  - **Errors**: 401 Unauthorized

### 2.5. Generation Error Logs

(Typically used internally or by admin users)

- **GET /api/generation-error-logs**
  - **Description**: Retrieve generation error logs (secured/admin access).
  - **Response JSON**: List of error log object.
  - **Query Parameters**: Pagination, filtering by user_id if needed.
  - **Errors**: 401 Unauthorized, 403 Forbidden

## 3. Authentication and Authorization

- **Mechanism**: Token-based authentication using Supabase Auth.
- **Process**:
  - Users authenticate via `/auth/login` or `/auth/register`, receiving a bearer token.
  - Protected endpoints require the token in the `Authentication` header.
  - Database-level Row-Level Security (RLS) ensures that users access only records with matching `user_id`.
- **Additional Considerations**: Use HTTPS, rate limiting, and secure error messaging to mitigate security risks.

## 4. Validation and Business Logic

- **Input Validation**:
  - For the generation endpoint, ensure input text length is between 1000 and 10000 characters as per the schema constraint on `source_text_length`, `source_text_hash` computed for duplicate detection.
  - For flashcards, validate that the `source` field is one of ["ai-full", "ai-edited", "manual"].
- **Business Logic**:

  - **Flashcard Generation**: Upon receiving valid text input, the endpoint calls an external LLM API to retrieve flashcard proposals. A generation record is created to track the request and responses, along with counts of generated and accepted flashcards. Record generation metadata (model, generated_count, duration) and persist generated flashcards. Log any error in `generation_error_logs` for auditing and debugging.
  - **Manual CRUD Operations**: Endpoints for creating, updating, and deleting flashcards follow the standard CRUD pattern and enforce ownership using the user_id.
  - **Flashcard Review**: Users can review, edit, and accept/reject AI generated flashcards. Accepted flashcards are then saved via the flashcards endpoint. Automatic update of the `update_at` field via database triggers when flashcards are modified.

- **Error Handling**:
  - Return appropriate error messages for validation errors, authentication failures, and authorization issues.
  - Include rate limiting and logging of generation errors via the `generation_error_logs` endpoint.

## Assumptions

- The API uses Supabase Auth for user management and leverages PostgreSQL RLS to secure data access.
- Endpoints for administrative error log access are secured and not exposed to regular users.
- External AI generation is integrated as a synchronous call for simplicity, though asynchronous processing may be considered for scalability.
