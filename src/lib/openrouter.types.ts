export interface ModelConfig {
  name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

export interface RequestPayload {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format?: ResponseFormat;
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export interface ParsedResponse {
  answer: string;
  confidence: number;
}

// API Client type
export interface ApiClient {
  post: (payload: RequestPayload) => Promise<ParsedResponse>;
}
