export interface OllamaSettings {
  baseUrl: string;
  model: string;
  timeout?: number;
}

export interface LLMSettings {
  provider?: string;
  openai?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  ollama?: OllamaSettings;
}

export interface Settings {
  llm?: LLMSettings;
  browser?: {
    headless: boolean;
    timeout: number;
  };
}